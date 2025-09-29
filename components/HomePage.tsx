

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { UserProfile, TodoItem, Course } from '../types';
import Modal from './Modal';

// --- ICONS for UI ---
const BackArrowIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

// --- ICONS for TODOs ---
const LabReportIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 20H4C3.44772 20 3 19.5523 3 19V5C3 4.44772 3.44772 4 4 4H9" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 4H20C20.5523 4 21 4.44772 21 5V19C21 19.5523 20.5523 20 20 20H12" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="2" width="6" height="4" rx="1" stroke="#4B5563" strokeWidth="2"/></svg>;
const ProblemSetIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h6v6H4V4zm10 10h6v6h-6v-6zM4 14h6v6H4v-6zM14 4h6v6h-6V4z" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const PositionPaperIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CodeGameIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="#4B5563" strokeWidth="2"/><line x1="8" y1="21" x2="16" y2="21" stroke="#4B5563" strokeWidth="2"/><line x1="12" y1="17" x2="12" y2="21" stroke="#4B5563" strokeWidth="2"/></svg>;
const DesignPosterIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.38 0 2.69-.28 3.89-.77l-1.9-1.9C13.2 19.8 12.63 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c1.18 0 2.29.26 3.31.72l1.5-1.5C15.68 2.53 13.9 2 12 2zM6.5 9C5.67 9 5 8.33 5 7.5S5.67 6 6.5 6 8 6.67 8 7.5 7.33 9 6.5 9zm4-4C9.67 5 9 4.33 9 3.5S9.67 2 10.5 2s1.5.67 1.5 1.5S11.33 5 10.5 5zm5 0c-.83 0-1.5-.67-1.5-1.5S14.67 2 15.5 2s1.5.67 1.5 1.5S16.33 5 15.5 5zm2.5 4c-.83 0-1.5-.67-1.5-1.5S17.17 6 18 6s1.5.67 1.5 1.5S18.83 9 18 9z" fill="#4B5563"/><path d="m21.31 15.66-2.48-1.12-1.12-2.48c-.23-.5-.78-.78-1.31-.72s-.96.5-1.05 1.05L14.4 15.8c-.3.12-.58.3-.81.54l-3.32-3.32c-1.36 1.36-1.36 3.56 0 4.92l4.92 4.92c1.36 1.36 3.56 1.36 4.92 0l2.67-2.67c.56-.56.56-1.47 0-2.03z" fill="#4B5563"/></svg>;
const DefaultTodoIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="m16 14 3 3 5-5" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 4h2" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"/><path d="M12 4h-2" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"/><path d="M8 4H6" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"/></svg>
const getTodoIcon = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('lab') || lowerText.includes('report')) return <LabReportIcon />;
    if (lowerText.includes('problem set')) return <ProblemSetIcon />;
    if (lowerText.includes('paper') || lowerText.includes('essay')) return <PositionPaperIcon />;
    if (lowerText.includes('code') || lowerText.includes('game') || lowerText.includes('dev')) return <CodeGameIcon />;
    if (lowerText.includes('design') || lowerText.includes('poster') || lowerText.includes('art')) return <DesignPosterIcon />;
    return <DefaultTodoIcon />;
}

// --- LOGO ICONS for ID CARD ---
const Logo1 = () => <svg viewBox="0 0 110 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.89 3.39c-1.8 0-3.6.4-5.2 1.2-3.8 1.9-6.4 5.6-6.4 10 0 4.3 2.6 8.1 6.4 10 1.6.8 3.4 1.2 5.2 1.2 1.8 0 3.6-.4 5.2-1.2 3.8-1.9 6.4-5.6 6.4-10 0-4.3-2.6-8.1-6.4-10-1.6-.8-3.4-1.2-5.2-1.2zm0 2.4c1.3 0 2.6.3 3.9.9 3.1 1.5 5.1 4.7 5.1 8.1 0 3.4-2 6.6-5.1 8.1-1.3.6-2.6.9-3.9.9s-2.6-.3-3.9-.9c-3.1-1.5-5.1-4.7-5.1-8.1 0-3.4 2-6.6 5.1-8.1 1.3-.6 2.6-.9 3.9-.9zM30.09 14.29c0-5.8 4.7-10.5 10.5-10.5s10.5 4.7 10.5 10.5-4.7 10.5-10.5 10.5-10.5-4.7-10.5-10.5zm2.4 0c0-4.5 3.6-8.1 8.1-8.1s8.1 3.6 8.1 8.1-3.6 8.1-8.1 8.1-8.1-3.6-8.1-8.1zM58.09 15.69l3.5-3.5 1.7 1.7-3.5 3.5-1.7-1.7zm1.1-12.3h2.4v2.4h-2.4v-2.4zm10.7 10.7l-1.7-1.7-3.5 3.5 1.7 1.7 3.5-3.5zM63.79 3.39h2.4v2.4h-2.4v-2.4z" fill="#E864A4"/><path d="M63.69 11.09l-4.2-4.2-1.7 1.7 4.2 4.2 1.7-1.7zm-4.1 4.6l-4.2 4.2 1.7 1.7 4.2-4.2-1.7-1.7z" fill="#E864A4"/><path d="M74.99 6.29h21.3v2.4H74.99v-2.4zM74.99 13.09h21.3v2.4H74.99v-2.4zM74.99 19.89h21.3v2.4H74.99v-2.4zM108.69 13.09l4.9 4.9 1.7-1.7-4.9-4.9-1.7 1.7zM100.89 25.19c-1.3 0-2.6-.5-3.5-1.4l-1.7 1.7c2 2 4.6 3.1 7.4 3.1s5.4-1.1 7.4-3.1l-1.7-1.7c-.9.9-2.2 1.4-3.5 1.4zm0-10.3c1.3 0 2.6.5 3.5 1.4l1.7-1.7c-2-2-4.6-3.1-7.4-3.1s-5.4 1.1-7.4 3.1l1.7 1.7c.9-.9 2.2-1.4 3.5-1.4zM108.69 18.09l-4.9-4.9-1.7 1.7 4.9 4.9 1.7 1.7z" fill="#E864A4"/></svg>;
const Logo2 = () => <svg viewBox="0 0 130 38" fill="none" xmlns="http://www.w3.org/2000/svg"><text style={{whiteSpace: 'pre'}} fontFamily="monospace" fontSize="12" fill="#000"><tspan x="0" y="11.82">Student ID</tspan></text><path d="M37 26.02a.85.85 0 0 1-.6-.25L28 17.09a.87.87 0 0 1 0-1.23l8.42-8.68a.85.85 0 0 1 1.2 0 .87.87 0 0 1 0 1.23L30.82 16.5l7.8 8.04a.87.87 0 0 1 0 1.23.85.85 0 0 1-.62.25zM58.3 33.1H.7a.68.68 0 0 1-.7-.7V1.1A.68.68 0 0 1 .7.4h57.6c.38 0 .7.3.7.7v31.2c0 .38-.3.7-.7.7z" stroke="#000" strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const Logo3 = () => <svg viewBox="0 0 130 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 32.7a.87.87 0 0 1-.61-.25L.23 27.8a.86.86 0 0 1 0-1.22L4.89 22a.85.85 0 0 1 1.22 0 .86.86 0 0 1 0 1.22L2.06 27.2l4.05 4.05a.86.86 0 0 1 0 1.22.85.85 0 0 1-.61.23zM34.9 15.6a.86.86 0 0 1-.62-.25L29.6 10.7a.86.86 0 0 1 0-1.22l4.68-4.66a.85.85 0 0 1 1.22 0 .86.86 0 0 1 0 1.22L31.44 9.5l4.06 4.05a.86.86 0 0 1 0 1.22.85.85 0 0 1-.6.23zM1.98 12.1A20.47 20.47 0 0 1 20.2 1.4a.85.85 0 0 1 .6.23.87.87 0 0 1 .25.62v28.2a.87.87 0 0 1-.25.62.85.85 0 0 1-.6.23A20.47 20.47 0 0 1 1.98 12.1z" stroke="#000" strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round"/><path d="M128.53 18.9a.85.85 0 0 1-.61-.25l-4.66-4.66a.86.86 0 0 1 0-1.22l4.66-4.66a.85.85 0 0 1 1.22 0 .86.86 0 0 1 0 1.22l-4.05 4.05 4.05 4.05a.86.86 0 0 1 0 1.22.85.85 0 0 1-.61.23zM99.13 36a.85.85 0 0 1-.61-.25L93.86 31a.86.86 0 0 1 0-1.22l4.66-4.66a.85.85 0 0 1 1.22 0 .86.86 0 0 1 0 1.22l-4.05 4.05 4.05 4.05a.86.86 0 0 1 0 1.22.85.85 0 0 1-.61.23z" stroke="#000" strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round"/><path d="M110.13 29.3a20.47 20.47 0 0 1-18.2-10.7.85.85 0 0 1 .6-.23.87.87 0 0 1 .25.62V30a.87.87 0 0 1-.25.62.85.85 0 0 1-.6.23 20.47 20.47 0 0 1-18.22-10.7z" fill="#fff" stroke="#000" strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round"/><text style={{whiteSpace: 'pre'}} fontFamily="monospace" fontSize="8" fill="#000"><tspan x="30" y="24.47">STRUGGLING STUDENTS CLUB</tspan></text></svg>;

const LOGOS = {
    logo1: { component: Logo1, name: 'Mag-aaral ng Bayan' },
    logo2: { component: Logo2, name: 'Student ID' },
    logo3: { component: Logo3, name: 'Struggling Students Club' },
    logo4: { component: () => <div className="font-bold text-lg text-red-500 transform -skew-y-6">ACADEMIC SLAYER</div>, name: 'Academic Slayer' },
    logo5: { component: () => <div className="font-serif font-bold text-lg text-purple-500">academic achiever</div>, name: 'Academic Achiever' },
};

const ID_COLORS = ['#ffc2d1', '#ffb3c1', '#a0c4ff', '#b5a7e7', '#c8e7c8', '#ffe1a8', '#ffc8a8'];

interface HomePageProps {
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    homeTodos: TodoItem[];
    setHomeTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
    courses: Course[];
    setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const HomePage: React.FC<HomePageProps> = ({ profile, setProfile, homeTodos, setHomeTodos, courses, setCourses }) => {
    const [isEditingId, setIsEditingId] = useState(false);
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        }));
    }, []);

    if (isEditingId) {
        return <EditIDCardView currentProfile={profile} onSave={setProfile} onBack={() => setIsEditingId(false)} />;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Hello, {profile.name}</h1>
                <p className="text-gray-500 dark:text-gray-400">{currentDate}</p>
            </div>
            
            <IDCard profile={profile} onEdit={() => setIsEditingId(true)} />
            <TodoList homeTodos={homeTodos} setHomeTodos={setHomeTodos} courses={courses} setCourses={setCourses} />
        </div>
    );
};

const IDCard: React.FC<{ profile: UserProfile, onEdit: () => void }> = ({ profile, onEdit }) => {
    const isCustomLogo = profile.logoUrl?.startsWith('data:image/');
    const LogoComponent = !isCustomLogo ? LOGOS[profile.logoUrl as keyof typeof LOGOS]?.component : null;
    
    return (
        <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex gap-4" style={{ backgroundColor: profile.cardColor, borderRadius: '0.75rem', padding: '1rem' }}>
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0 flex items-center justify-center">
                        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Cat%20with%20Wry%20Smile.png" alt="Cat with Wry Smile" width="80" height="80" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                        <div className="h-10 flex items-center justify-center overflow-hidden [&_svg]:max-w-full [&_svg]:max-h-full">
                            {isCustomLogo ? (
                                <img src={profile.logoUrl} alt="Custom Logo" className="max-h-full max-w-full object-contain" />
                            ) : LogoComponent ? (
                                <LogoComponent />
                            ) : null}
                        </div>
                        <div className="w-full h-1 my-1 bg-gray-500/20" style={{'--tw-bg-opacity': '0.2', backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(128,128,128,0.2) 4px, rgba(128,128,128,0.2) 5px)`}}></div>
                        <div className="grid grid-cols-2 text-xs font-mono text-gray-800/80 gap-x-2">
                            <div className="break-words"><span className="font-semibold">NAME</span><br/>{profile.name}</div>
                            <div className="break-words"><span className="font-semibold">BIRTHDAY</span><br/>{profile.birthday}</div>
                            <div className="break-words"><span className="font-semibold">SCHOOL</span><br/>{profile.school}</div>
                            <div className="break-words"><span className="font-semibold">YEAR LVL.</span><br/>{profile.yearLevel}</div>
                        </div>
                    </div>
                </div>
                <div className="w-full bg-gray-300 dark:bg-gray-600 h-6 mt-2 rounded-b-lg flex items-center justify-center text-xs tracking-widest font-mono text-gray-600 dark:text-gray-300">
                    |||||||||||||||||||||||||||
                </div>
            </div>
            <button onClick={onEdit} className="absolute -top-2 -right-2 bg-gray-800 dark:bg-white text-white dark:text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">Edit</button>
        </div>
    );
};

const TodoList: React.FC<Omit<HomePageProps, 'profile' | 'setProfile'>> = ({ homeTodos, setHomeTodos, courses, setCourses }) => {
    const [filter, setFilter] = useState('Ongoing');
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    const allTodos = useMemo(() => {
        const courseTodos = courses.flatMap(course => 
            course.todos.map(todo => ({
                ...todo,
                courseId: course.id,
                subject: todo.subject || course.name,
            }))
        );
        return [...homeTodos.map(t => ({...t, courseId: undefined})), ...courseTodos].sort((a,b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : 0);
    }, [courses, homeTodos]);

    const filteredTodos = useMemo(() => {
        const now = new Date();
        return allTodos.filter(todo => {
            if (filter === 'Completed') return todo.completed;
            if (filter === 'Missed') return !todo.completed && todo.dueDate && new Date(todo.dueDate) < now;
            if (filter === 'Ongoing') return !todo.completed && (!todo.dueDate || new Date(todo.dueDate) >= now);
            return true;
        })
    }, [allTodos, filter]);
    
    const handleToggleTodo = (todoId: string, courseId?: string) => {
        if (courseId) {
            setCourses(prev => prev.map(course => course.id === courseId ? {
                ...course,
                todos: course.todos.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t)
            } : course));
        } else {
            setHomeTodos(prev => prev.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t));
        }
    };
    
    const handleAddTodo = (newTodo: Omit<TodoItem, 'id' | 'completed'>) => {
        setHomeTodos(prev => [...prev, { ...newTodo, id: Date.now().toString(), completed: false }]);
        setAddModalOpen(false);
    };

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">To-do</h2>
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-gray-200 dark:bg-gray-700 text-sm font-semibold p-1 rounded-md border border-gray-300 dark:border-gray-600">
                        <option>Ongoing</option>
                        <option>Missed</option>
                        <option>Completed</option>
                    </select>
                </div>
                <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-1 font-semibold bg-gray-800 text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-lg text-sm">
                    <PlusIcon className="w-4 h-4" />
                    To-do
                </button>
            </div>
            
            <div className="space-y-3">
                {filteredTodos.map(todo => (
                    <div key={todo.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-gray-400 dark:text-gray-500">
                            {getTodoIcon(todo.text)}
                        </div>
                        <div className="flex-grow">
                            <p className={`font-semibold ${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.text}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {todo.subject}
                                {todo.dueDate && ` | ${new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${new Date(todo.dueDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                            </p>
                        </div>
                        <input 
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggleTodo(todo.id, todo.courseId)}
                            className="w-6 h-6 rounded-md text-cyan-600 border-gray-300 focus:ring-cyan-500 flex-shrink-0"
                        />
                    </div>
                ))}
            </div>

            {isAddModalOpen && <AddTodoModal onAdd={handleAddTodo} onClose={() => setAddModalOpen(false)} />}
        </div>
    );
};

const AddTodoModal: React.FC<{onClose: () => void, onAdd: (newTodo: Omit<TodoItem, 'id' | 'completed'>) => void}> = ({ onClose, onAdd }) => {
    const [text, setText] = useState('');
    const [subject, setSubject] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = () => {
        if (!text) return;
        onAdd({ text, subject, dueDate });
    }

    return (
        <Modal isOpen={true} onClose={onClose} title="New To-do">
            <div className="space-y-4">
                <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Task name, e.g., Laboratory Report" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject, e.g., Biology" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
                <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
            </div>
             <div className="flex justify-end gap-2 mt-4">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 text-white bg-cyan-600 rounded">Add</button>
            </div>
        </Modal>
    );
}


interface EditIDCardViewProps {
    currentProfile: UserProfile;
    onSave: (newProfile: UserProfile) => void;
    onBack: () => void;
}
const EditIDCardView: React.FC<EditIDCardViewProps> = ({ currentProfile, onSave, onBack }) => {
    const [profile, setProfile] = useState(currentProfile);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        onSave(profile);
        onBack();
    }

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(p => ({ ...p, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="pb-8">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="flex items-center gap-1 p-2 -ml-2"><BackArrowIcon /> Back</button>
                <button onClick={handleSave} className="font-semibold bg-cyan-600 text-white px-4 py-2 rounded-lg">Save</button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Edit ID</h1>
            <IDCard profile={profile} onEdit={() => {}} />

            <div className="space-y-4 mt-6">
                <div>
                    <h3 className="font-semibold mb-2">Color</h3>
                    <div className="flex gap-2 flex-wrap">
                        {ID_COLORS.map(color => (
                            <button key={color} onClick={() => setProfile(p => ({...p, cardColor: color}))} className={`w-10 h-10 rounded-full border-2 ${profile.cardColor === color ? 'border-black dark:border-white ring-2 ring-offset-2 ring-black dark:ring-white' : 'border-gray-300'}`} style={{backgroundColor: color}} />
                        ))}
                    </div>
                </div>

                 <div>
                    <h3 className="font-semibold mb-2">Logo</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="file"
                            accept="image/png"
                            ref={logoInputRef}
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                        <button onClick={() => logoInputRef.current?.click()} className="h-16 flex items-center justify-center border-2 border-dashed rounded-lg">Upload a custom logo</button>
                        {Object.entries(LOGOS).map(([key, { component: Logo, name }]) => (
                            <button key={key} onClick={() => setProfile(p => ({...p, logoUrl: key}))} className={`h-16 flex items-center justify-center border-2 rounded-lg ${profile.logoUrl === key ? 'border-black dark:border-white' : 'border-gray-300'}`}>
                                <Logo />
                            </button>
                        ))}
                    </div>
                </div>
                
                <div>
                    <label className="font-semibold text-sm">Name</label>
                    <input type="text" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                 <div>
                    <label className="font-semibold text-sm">Birthday</label>
                    <input type="date" value={profile.birthday} onChange={e => setProfile(p => ({...p, birthday: e.target.value}))} className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                 <div>
                    <label className="font-semibold text-sm">School</label>
                    <input type="text" value={profile.school} onChange={e => setProfile(p => ({...p, school: e.target.value}))} className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                 <div>
                    <label className="font-semibold text-sm">Year Level</label>
                    <input type="text" value={profile.yearLevel} onChange={e => setProfile(p => ({...p, yearLevel: e.target.value}))} className="w-full p-2 mt-1 border rounded dark:bg-gray-700 dark:border-gray-600"/>
                </div>
            </div>
        </div>
    );
};

export default HomePage;