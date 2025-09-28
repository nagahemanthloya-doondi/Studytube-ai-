
import React, { useState, useMemo, useRef } from 'react';
import type { Schedule, Day, ScheduleTime, Course } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// --- ICONS ---
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const BackArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /><path d="M12 8v-2" /><path d="M12 8h2" /></svg>
);
const RewindIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19" /><polygon points="22 19 13 12 22 5 22 19" /></svg>
);
const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
);
const ForwardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 19 22 12 13 5 13 19" /><polygon points="2 19 11 12 2 5 2 19" /></svg>
);
const ScheduleLayoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="12" width="22" height="18" rx="2" fill="#D1D5DB"/>
        <rect x="8" y="34" width="22" height="18" rx="2" fill="#D1D5DB"/>
        <rect x="34" y="12" width="22" height="40" rx="2" fill="#D1D5DB"/>
    </svg>
);

const SCHEDULE_COLORS = ['#FFFFFF', '#FCA5A5', '#BFDBFE', '#D8B4FE', '#A7F3D0', '#FDE68A', '#FFD8B3'];
const DAYS: Day[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];


interface SchedulePlayerProps {
  schedule?: Partial<Schedule> | null;
  time?: ScheduleTime | null;
}
const SchedulePlayer: React.FC<SchedulePlayerProps> = ({ schedule, time }) => {
    return (
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 shadow-md w-full max-w-md mx-auto">
            <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    {schedule?.imageUrl ? (
                        <img src={schedule.imageUrl} alt={schedule.title} className="w-full h-full object-cover"/>
                    ) : (
                       <CameraIcon className="w-8 h-8 text-gray-500"/>
                    )}
                </div>
                <div className="flex flex-col justify-center overflow-hidden flex-grow">
                    <div className="flex justify-between items-center text-xs text-green-600 dark:text-green-400">
                        <p>In Progress</p>
                        <div className="flex items-center gap-1">
                           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse [animation-delay:0.2s]"></div>
                        </div>
                    </div>
                    <h3 className="font-bold text-lg truncate text-black dark:text-white">{schedule?.title || 'No Class'}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{schedule?.instructor || 'Free Time'}</p>
                </div>
            </div>
            <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mt-3">
                <div className="w-1/2 h-full bg-black dark:bg-white rounded-full"></div>
            </div>
            <div className="flex justify-between text-xs font-mono mt-1 text-gray-500 dark:text-gray-400">
                <span>{time?.startTime ? time.startTime : '00:00'}</span>
                <span>{time?.endTime ? time.endTime : '00:00'}</span>
            </div>
            <div className="flex justify-around items-center mt-3 text-gray-700 dark:text-gray-300">
                <RewindIcon className="w-8 h-8 opacity-50"/>
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-700 shadow-inner flex items-center justify-center">
                    <PlayIcon className="w-8 h-8 text-black dark:text-white"/>
                </div>
                <ForwardIcon className="w-8 h-8 opacity-50"/>
            </div>
        </div>
    );
};


interface NewScheduleViewProps {
  onBack: () => void;
  onCreate: (newSchedule: Omit<Schedule, 'id'>) => void;
}

const NewScheduleView: React.FC<NewScheduleViewProps> = ({ onBack, onCreate }) => {
    const [color, setColor] = useState(SCHEDULE_COLORS[0]);
    const [title, setTitle] = useState('');
    const [instructor, setInstructor] = useState('');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const [times, setTimes] = useState<ScheduleTime[]>([
      { id: Date.now().toString(), days: [], startTime: '09:00', endTime: '10:00' }
    ]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const previewSchedule = { title, instructor, location, color, imageUrl };

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
                    <BackArrowIcon className="w-6 h-6 rotate-180"/>
                </button>
                <h1 className="text-xl font-bold ml-4">New Schedule</h1>
            </div>

            <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
              <SchedulePlayer schedule={previewSchedule} />
            </div>

            <div className="space-y-6 mt-6">
                <div>
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2 mt-2">
                        {SCHEDULE_COLORS.map(c => (
                            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-black dark:border-white ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-black ring-black dark:ring-white' : 'border-gray-300 dark:border-gray-600'}`} style={{backgroundColor: c}}></button>
                        ))}
                        <button className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"><PlusIcon className="w-5 h-5"/></button>
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

                <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Schedules</h3>
                    <button onClick={addScheduleTime} className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full"><PlusIcon className="w-5 h-5"/></button>
                </div>
                
                {times.map((s, index) => (
                    <div key={s.id} className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg space-y-3">
                        <p className="font-semibold">Schedule {index + 1}</p>
                        <div className="flex justify-between">
                            {DAYS.map(day => (
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
                
                <button onClick={handleCreate} className="w-full p-4 bg-gray-300 dark:bg-gray-700 font-bold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600">Create</button>
            </div>
        </div>
    );
};


interface SchedulePageProps {
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  courses: Course[];
}

const SchedulePage: React.FC<SchedulePageProps> = ({ schedules, setSchedules, courses }) => {
  const [isCreating, setIsCreating] = useState(false);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const weekDayMap: Day[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const todayDay = weekDayMap[today.getDay()];
  
  const getMinutes = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
  const currentTimeInMinutes = getMinutes(`${today.getHours()}:${today.getMinutes()}`);

  const todaysEvents = useMemo(() => {
    const events: { schedule: Schedule, time: ScheduleTime }[] = [];
    schedules.forEach(schedule => {
        schedule.times.forEach(time => {
            if (time.days.includes(todayDay)) {
                events.push({ schedule, time });
            }
        });
    });
    return events.sort((a, b) => getMinutes(a.time.startTime) - getMinutes(b.time.startTime));
  }, [schedules, todayDay]);

  const currentEvent = useMemo(() => {
    const activeEvent = todaysEvents.find(event => currentTimeInMinutes >= getMinutes(event.time.startTime) && currentTimeInMinutes <= getMinutes(event.time.endTime));
    if (activeEvent) return activeEvent;
    const upcomingEvent = todaysEvents.find(event => currentTimeInMinutes < getMinutes(event.time.startTime));
    if (upcomingEvent) return upcomingEvent;
    return null;
  }, [todaysEvents, currentTimeInMinutes]);

  const handleCreateSchedule = (newSchedule: Omit<Schedule, 'id'>) => {
    setSchedules(prev => [...prev, { ...newSchedule, id: Date.now().toString() }]);
    setIsCreating(false);
  };
  
  if (isCreating) {
    return <NewScheduleView onBack={() => setIsCreating(false)} onCreate={handleCreateSchedule} />;
  }

  return (
    <div className="w-full">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-4xl font-serif font-bold text-black dark:text-white">Class Schedule</h1>
                <p className="text-gray-500 dark:text-gray-400">{formattedDate}</p>
            </div>
            <button onClick={() => setIsCreating(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <PlusIcon className="w-8 h-8" />
            </button>
        </div>
        
        <SchedulePlayer schedule={currentEvent?.schedule} time={currentEvent?.time} />

        {schedules.length === 0 && (
            <div className="text-center mt-16 flex flex-col items-center">
                <ScheduleLayoutIcon />
                <p className="mt-4 font-semibold text-gray-800 dark:text-gray-200">No schedule found</p>
                <button onClick={() => setIsCreating(true)} className="mt-4 px-6 py-2 bg-yellow-400 text-black font-bold rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                    + Schedule
                </button>
            </div>
        )}
    </div>
  );
};

export default SchedulePage;
