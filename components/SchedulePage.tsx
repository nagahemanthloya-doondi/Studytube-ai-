


import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Schedule, Day, ScheduleTime, Course, GoogleAuth } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// --- ICONS ---
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const BackArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /><path d="M12 8v-2" /><path d="M12 8h2" /></svg>
);

const SCHEDULE_COLORS = ['#FFFFFF', '#FCA5A5', '#BFDBFE', '#D8B4FE', '#A7F3D0', '#FDE68A', '#FFD8B3'];
const DAYS: Day[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const dayToRrule: Record<Day, string> = {
    SUN: 'SU', MON: 'MO', TUE: 'TU', WED: 'WE', THU: 'TH', FRI: 'FR', SAT: 'SA',
};

// --- HELPERS ---
const getMinutes = (timeStr: string): number => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatMinutesToTime = (totalMinutes: number): string => {
    if (isNaN(totalMinutes) || totalMinutes < 0) return '00:00';
    const mins = Math.floor(totalMinutes % 60);
    const hrs = Math.floor(totalMinutes / 60);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const formatTime12hr = (timeStr: string): string => {
    if (!timeStr || !timeStr.includes(':')) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12
    return `${hours12}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

const createGoogleCalendarEvent = async (schedule: Omit<Schedule, 'id'>, time: ScheduleTime, accessToken: string) => {
    const byday = time.days.map(d => dayToRrule[d]).join(',');
    if (!byday) return; 

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    
    // Find the next occurrence of the first day of the week to start the event
    const sortedDays = time.days.sort((a,b) => DAYS.indexOf(a) - DAYS.indexOf(b));
    const firstDayIndex = DAYS.indexOf(sortedDays[0]);
    const todayIndex = now.getDay();
    const dayDifference = (firstDayIndex - todayIndex + 7) % 7;
    
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayDifference);
    const [startHours, startMinutes] = time.startTime.split(':').map(Number);
    const [endHours, endMinutes] = time.endTime.split(':').map(Number);

    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(endHours, endMinutes, 0, 0);

    // Make recurrence end in ~6 months
    const recurrenceEndDate = new Date();
    recurrenceEndDate.setMonth(recurrenceEndDate.getMonth() + 6);
    const toGCalDateString = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');

    const event = {
        'summary': schedule.title,
        'location': schedule.location,
        'description': `Instructor: ${schedule.instructor}`,
        'start': {
            'dateTime': startDate.toISOString(),
            'timeZone': timeZone,
        },
        'end': {
            'dateTime': endDate.toISOString(),
            'timeZone': timeZone,
        },
        'recurrence': [
            `RRULE:FREQ=WEEKLY;BYDAY=${byday};UNTIL=${toGCalDateString(recurrenceEndDate)}`
        ],
    };

    try {
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event)
        });
        const data = await response.json();
        if (data.error) {
            console.error('Google Calendar API Error:', data.error);
            alert(`Error creating calendar event: ${data.error.message}. Your token might have expired. Please try signing out and in again.`);
        } else {
            console.log('Google Calendar event created: ', data.htmlLink);
        }
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        alert('An unexpected error occurred while creating the calendar event.');
    }
};

// --- SUB-COMPONENTS ---

const IPodPlayer: React.FC<{
    event: { schedule: Partial<Schedule>, time: ScheduleTime } | null;
    progress: number;
}> = ({ event, progress }) => {
    
    const schedule = event?.schedule;
    const time = event?.time;
    const isNextUp = schedule?.title?.startsWith('Next up:');
    const displayProgress = isNextUp ? 0 : progress;

    const totalDurationMinutes = time ? getMinutes(time.endTime) - getMinutes(time.startTime) : 0;
    const elapsedMinutes = (totalDurationMinutes * displayProgress) / 100;

    return (
        <div className="w-full max-w-sm mx-auto bg-gray-100 dark:bg-zinc-800 p-3 rounded-2xl shadow-lg border-[6px] border-gray-200 dark:border-zinc-900 mb-6">
            <div className="bg-white dark:bg-black border-2 border-black dark:border-gray-700 rounded p-2">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span className="font-bold">Schedule</span>
                    <div className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 5.5H13.5V11.5C13.5 12.6046 12.6046 13.5 11.5 13.5H3.5C2.39543 13.5 1.5 12.6046 1.5 11.5V5.5Z" stroke="#34D399" strokeWidth="2"/><path d="M4.5 5.5V2.5C4.5 1.94772 4.94772 1.5 5.5 1.5H9.5C10.0523 1.5 10.5 1.94772 10.5 2.5V5.5" stroke="#34D399" strokeWidth="2"/></svg>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="14" height="12" rx="2" stroke="#34D399" strokeWidth="2"/><path d="M18 9H20V15H18V9Z" fill="#34D399"/></svg>
                    </div>
                </div>
                <div className="my-2 text-center text-black dark:text-white">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 mx-auto my-2 rounded-sm border dark:border-gray-700 flex items-center justify-center">
                        {schedule?.imageUrl ? <img src={schedule.imageUrl} alt={schedule.title} className="w-full h-full object-cover"/> : <span className="text-2xl">📚</span>}
                    </div>
                    <h3 className="font-bold text-base truncate">{schedule?.title || 'No Class'}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{schedule?.instructor || 'Free Time'}</p>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-gray-500 dark:bg-gray-400 rounded-full" style={{ width: `${displayProgress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs font-mono mt-1 text-gray-500">
                    <span>{formatMinutesToTime(elapsedMinutes)}</span>
                    <span>{formatMinutesToTime(totalDurationMinutes)}</span>
                </div>
            </div>

            <div className="relative w-36 h-36 mx-auto mt-4 bg-gray-50 dark:bg-zinc-700 rounded-full border-2 border-gray-200 dark:border-zinc-600 flex items-center justify-center cursor-pointer">
                <div className="absolute top-3 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest">SCHEDULE</div>
                <div className="absolute left-3 text-xl font-bold text-gray-400 dark:text-gray-500">{"|◀"}</div>
                <div className="absolute right-3 text-xl font-bold text-gray-400 dark:text-gray-500">{"▶|"}</div>
                <div className="absolute bottom-3 text-xl font-bold text-gray-400 dark:text-gray-500">{"▶︎❚❚"}</div>
                <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-full border-2 border-gray-200 dark:border-zinc-600"></div>
            </div>
        </div>
    );
};

const WeekView: React.FC<{ schedules: Schedule[]; currentDay: Day; onDeleteSchedule: (scheduleId: string) => void; }> = ({ schedules, currentDay, onDeleteSchedule }) => {
    const days: Day[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    
    const { startHour, totalHours } = useMemo(() => {
        const allTimes = schedules.flatMap(s => s.times.flatMap(t => [getMinutes(t.startTime), getMinutes(t.endTime)]));
        if (allTimes.length === 0) return { startHour: 7, totalHours: 11 };
        const minHour = Math.floor(Math.min(...allTimes) / 60);
        const maxHour = Math.ceil(Math.max(...allTimes) / 60);
        const sh = Math.max(0, minHour - 1);
        const eh = Math.min(24, maxHour + 1);
        return { startHour: sh, totalHours: eh - sh };
    }, [schedules]);

    const timeToPercent = (timeStr: string) => {
        if (totalHours <= 0) return 0;
        const decimalHours = getMinutes(timeStr) / 60;
        return Math.max(0, ((decimalHours - startHour) / totalHours) * 100);
    };

    const eventsByDay = useMemo(() => {
        const map = new Map<Day, (Schedule & ScheduleTime & { scheduleId: string })[]>();
        days.forEach(day => map.set(day, []));
        schedules.forEach(schedule => {
            schedule.times.forEach(time => {
                time.days.forEach(day => {
                    if (map.has(day)) {
                        map.get(day)!.push({ ...schedule, ...time, scheduleId: schedule.id });
                    }
                });
            });
        });
        map.forEach(events => events.sort((a, b) => getMinutes(a.startTime) - getMinutes(b.startTime)));
        return map;
    }, [schedules]);

    return (
        <div className="mt-8 w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold mb-2">
                {days.map(day => (
                    <div key={day} className={`p-2 rounded-lg ${day === currentDay ? 'bg-yellow-300 text-black' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 h-[500px]">
                {days.map(day => (
                    <div key={day} className="relative h-full bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-hidden">
                        {(eventsByDay.get(day) || []).map(event => {
                            const top = timeToPercent(event.startTime);
                            const bottom = timeToPercent(event.endTime);
                            const height = bottom - top;
                            return (
                                <div
                                    key={`${event.id}-${event.startTime}`}
                                    className="absolute w-[95%] left-[2.5%] p-1.5 rounded text-[10px] text-white overflow-hidden shadow group"
                                    style={{
                                        top: `${top}%`,
                                        height: `${Math.max(0, height)}%`,
                                        minHeight: '40px',
                                        backgroundColor: event.color === '#FFFFFF' ? '#06b6d4' : event.color || '#06b6d4',
                                    }}
                                >
                                    <div className="flex flex-col h-full">
                                        <p className="text-white/80 truncate">{formatTime12hr(event.startTime)}</p>
                                        <p className="font-bold truncate text-xs leading-tight my-0.5">{event.title}</p>
                                        <p className="text-white/80 truncate mt-auto">{formatTime12hr(event.endTime)}</p>
                                    </div>
                                     {!event.courseId && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteSchedule(event.scheduleId); }}
                                            className="absolute top-0.5 right-0.5 p-0.5 bg-black/20 rounded-full text-white/70 hover:text-white hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
                                            aria-label="Delete schedule"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};


const NewScheduleView: React.FC<{
  onBack: () => void;
  onCreate: (newSchedule: Omit<Schedule, 'id'>) => void;
}> = ({ onBack, onCreate }) => {
    const [color, setColor] = useState(SCHEDULE_COLORS[0]);
    const [title, setTitle] = useState('');
    const [instructor, setInstructor] = useState('');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const [times, setTimes] = useState<ScheduleTime[]>([
      { id: Date.now().toString(), days: [], startTime: '09:00', endTime: '10:00' }
    ]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreate = () => {
        if (!title.trim()) {
            alert("Please enter a schedule title.");
            return;
        }
        onCreate({ title, instructor, location, color, imageUrl, times });
    };

    const addScheduleTime = () => setTimes([...times, { id: Date.now().toString(), days: [], startTime: '09:00', endTime: '10:00' }]);
    const updateScheduleTime = (id: string, newTime: Partial<Omit<ScheduleTime, 'id'>>) => setTimes(times.map(s => s.id === id ? { ...s, ...newTime } : s));
    const toggleDay = (scheduleId: string, day: Day) => {
        const schedule = times.find(s => s.id === scheduleId);
        if (!schedule) return;
        const newDays = schedule.days.includes(day) ? schedule.days.filter(d => d !== day) : [...schedule.days, day];
        updateScheduleTime(scheduleId, { days: newDays });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto text-black dark:text-white">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <BackArrowIcon />
                </button>
                <h1 className="text-xl font-bold ml-4">New Schedule</h1>
            </div>

            <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
              <IPodPlayer event={{ schedule: { title, instructor, imageUrl }, time: { id: '', days: [], startTime: '00:00', endTime: '00:00' } }} progress={0} />
            </div>

            <div className="space-y-6 mt-6">
                <div>
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2 mt-2">
                        {SCHEDULE_COLORS.map(c => (
                            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-black dark:border-white ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-black ring-black dark:ring-white' : 'border-gray-300 dark:border-gray-600'}`} style={{backgroundColor: c}}></button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter schedule title" className="w-full p-3 mt-1 bg-gray-200 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-900 outline-none"/>
                </div>
                <div>
                    <label htmlFor="instructor" className="text-sm font-medium">Instructor</label>
                    <input id="instructor" type="text" value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="Enter instructor's name (Optional)" className="w-full p-3 mt-1 bg-gray-200 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-900 outline-none"/>
                </div>
                 <div>
                    <label htmlFor="location" className="text-sm font-medium">Room Location</label>
                    <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter room location (Optional)" className="w-full p-3 mt-1 bg-gray-200 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-900 outline-none"/>
                </div>

                <h3 className="font-semibold">Schedules</h3>
                
                {times.map((s, index) => (
                    <div key={s.id} className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg space-y-3">
                        <div className="flex justify-between">
                            {[...DAYS.slice(1), DAYS[0]].map(day => (
                                <button key={day} onClick={() => toggleDay(s.id, day)} className={`px-3 py-1 text-sm font-semibold rounded-md ${s.days.includes(day) ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-gray-700'}`}>
                                    {day}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="time" value={s.startTime} onChange={e => updateScheduleTime(s.id, {startTime: e.target.value})} className="w-full p-2 bg-white dark:bg-gray-700 rounded-lg text-center" />
                            <input type="time" value={s.endTime} onChange={e => updateScheduleTime(s.id, {endTime: e.target.value})} className="w-full p-2 bg-white dark:bg-gray-700 rounded-lg text-center"/>
                        </div>
                    </div>
                ))}
                 <button onClick={addScheduleTime} className="w-full p-3 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center font-semibold">
                    <PlusIcon className="w-5 h-5 mr-2"/> Add Time
                </button>
                
                <button onClick={handleCreate} className="w-full p-4 bg-black text-white dark:bg-white dark:text-black font-bold rounded-lg hover:opacity-80 transition-opacity">Create</button>
            </div>
        </div>
    );
};

interface SchedulePageProps {
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  courses: Course[];
  googleAuth: GoogleAuth | null;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ schedules, setSchedules, courses, googleAuth }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
  }, []);

  const today = currentTime;
  const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const todayDay = DAYS[today.getDay()];

  const allSchedules = useMemo(() => {
    const courseSchedules: Schedule[] = courses.flatMap(course => 
      course.schedules.length > 0 ? [{
        id: course.id,
        title: course.code,
        instructor: course.instructor,
        location: course.location,
        color: course.color,
        times: course.schedules,
        courseId: course.id
      }] : []
    );
    return [...schedules, ...courseSchedules];
  }, [schedules, courses]);

  const { currentEvent, progress } = useMemo(() => {
    const now = currentTime;
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    const todaysEvents = allSchedules
        .flatMap(schedule => schedule.times.map(time => ({ schedule, time })))
        .filter(({ time }) => time.days.includes(todayDay))
        .sort((a, b) => getMinutes(a.time.startTime) - getMinutes(b.time.startTime));

    const activeEvent = todaysEvents.find(({ time }) => {
        const start = getMinutes(time.startTime);
        const end = getMinutes(time.endTime);
        return currentTimeInMinutes >= start && currentTimeInMinutes < end;
    });

    if (activeEvent) {
        const start = getMinutes(activeEvent.time.startTime);
        const end = getMinutes(activeEvent.time.endTime);
        const duration = end - start;
        const elapsed = currentTimeInMinutes - start;
        const currentProgress = duration > 0 ? (elapsed / duration) * 100 : 0;
        return { currentEvent: activeEvent, progress: currentProgress };
    }

    const nextEvent = todaysEvents.find(({ time }) => getMinutes(time.startTime) > currentTimeInMinutes);
    if (nextEvent) {
        return { currentEvent: { schedule: { title: `Next up: ${nextEvent.schedule.title}`, instructor: nextEvent.schedule.instructor }, time: nextEvent.time }, progress: 0 };
    }

    return { currentEvent: null, progress: 0 };
  }, [currentTime, allSchedules, todayDay]);

  const handleCreateSchedule = (newScheduleData: Omit<Schedule, 'id'>) => {
    const newSchedule = { ...newScheduleData, id: Date.now().toString() };
    setSchedules(prev => [...prev, newSchedule]);
    setIsCreating(false);

    if (googleAuth?.access_token) {
        newSchedule.times.forEach(timeSlot => {
            createGoogleCalendarEvent(newSchedule, timeSlot, googleAuth.access_token);
        });
    }
  };
  
  const handleDeleteSchedule = (scheduleIdToDelete: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleIdToDelete));
  };
  
  if (isCreating) {
    return <NewScheduleView onBack={() => setIsCreating(false)} onCreate={handleCreateSchedule} />;
  }

  return (
    <div className="w-full">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h1 className="text-4xl font-serif font-bold text-black dark:text-white">Class Schedule</h1>
                <p className="text-gray-500 dark:text-gray-400">{formattedDate}</p>
            </div>
            <button onClick={() => setIsCreating(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <PlusIcon className="w-8 h-8 text-black dark:text-white" />
            </button>
        </div>
        
        <IPodPlayer event={currentEvent} progress={progress} />

        <AnimatePresence>
            {allSchedules.length > 0 ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <WeekView schedules={allSchedules} currentDay={todayDay} onDeleteSchedule={handleDeleteSchedule} />
                 </motion.div>
            ) : (
                <div className="text-center mt-16 flex flex-col items-center">
                    <p className="mt-4 font-semibold text-gray-800 dark:text-gray-200">No schedule found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Click the '+' to add your first class.</p>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default SchedulePage;