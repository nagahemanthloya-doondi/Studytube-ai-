

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Course, CourseFile, TodoItem, CourseLink, StudySet, Flashcard, ScheduleTime, Day } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';

// --- ICONS ---
const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const BackArrowIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const ComputerIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
);
const MoreIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
)
const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
)
const FolderIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
);

const FileIcon: React.FC<{ type: CourseFile['type'] }> = ({ type }) => {
    const styles = {
        pdf: 'text-red-500',
        pptx: 'text-orange-500',
        docx: 'text-blue-500',
        other: 'text-gray-500',
    };
    return <svg className={`w-6 h-6 ${styles[type] || styles.other}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
};

const COURSE_COLORS = ['#f8fafc', '#fecaca', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fed7aa', '#fde68a'];
const DAYS: Day[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// --- FLASHCARD PRACTICE MODAL ---
interface FlashcardPracticeModalProps {
  studySet: StudySet;
  onClose: () => void;
}

const FlashcardPracticeModal: React.FC<FlashcardPracticeModalProps> = ({ studySet, onClose }) => {
  const shuffledCards = useMemo(() => {
    if (!studySet.flashcards || studySet.flashcards.length === 0) return [];
    return [...studySet.flashcards].sort(() => Math.random() - 0.5)
  }, [studySet]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  if (shuffledCards.length === 0) {
      return (
        <Modal isOpen={true} onClose={onClose} title="Practice">
            <p>This study set has no flashcards to practice.</p>
        </Modal>
      )
  }

  const currentCard = shuffledCards[currentIndex];

  const advanceToNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        if (currentIndex < shuffledCards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose(); // End of session
        }
    }, 250);
  };
  
  const cardVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Practicing: ${studySet.name}`}>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
            Card {currentIndex + 1} of {shuffledCards.length}
        </p>
        
        <div className="w-full h-48 cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setIsFlipped(f => !f)}>
            <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                initial={false}
                animate={isFlipped ? 'back' : 'front'}
                variants={cardVariants}
                transition={{ duration: 0.6 }}
            >
                <div className="absolute w-full h-full bg-white dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center p-4 text-center text-xl" style={{ backfaceVisibility: 'hidden' }}>
                    {currentCard.front}
                </div>
                <div className="absolute w-full h-full bg-cyan-100 dark:bg-cyan-900 rounded-lg shadow-lg flex items-center justify-center p-4 text-center text-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    {currentCard.back}
                </div>
            </motion.div>
        </div>
        
        <div className="mt-6 h-10">
            <AnimatePresence mode="wait">
            {isFlipped ? (
                <motion.div
                    key="answer-buttons"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} 
                    className="flex justify-around"
                >
                    <button onClick={advanceToNextCard} className="px-4 py-2 w-24 text-sm font-semibold rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Again</button>
                    <button onClick={advanceToNextCard} className="px-4 py-2 w-24 text-sm font-semibold rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-900">Hard</button>
                    <button onClick={advanceToNextCard} className="px-4 py-2 w-24 text-sm font-semibold rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Good</button>
                    <button onClick={advanceToNextCard} className="px-4 py-2 w-24 text-sm font-semibold rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">Easy</button>
                </motion.div>
            ) : (
                <motion.div
                    key="show-answer-button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-center"
                >
                    <button onClick={() => setIsFlipped(true)} className="px-6 py-2 font-semibold rounded-md bg-cyan-600 text-white hover:bg-cyan-700">Show Answer</button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    </Modal>
  );
};


// --- URL INPUT COMPONENT ---
interface UrlInputViewProps {
  onLoadVideo: (url: string) => void;
}

const UrlInputView: React.FC<UrlInputViewProps> = ({ onLoadVideo }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onLoadVideo(url.trim());
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube URL here to start studying..."
          className="w-full px-4 py-3 text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 text-lg font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-900"
        >
          Load Video
        </button>
      </form>
    </div>
  );
};


// --- TABS ---

const TodoTab: React.FC<{ course: Course, onCourseUpdate: (updatedCourse: Course) => void }> = ({ course, onCourseUpdate }) => {
    const [newTodoText, setNewTodoText] = useState('');
    const [newTodoDueDate, setNewTodoDueDate] = useState('');
    const sortedTodos = [...course.todos].sort((a,b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);

    const addTodo = () => {
        if (!newTodoText.trim()) return;
        const newTodo: TodoItem = { 
            id: Date.now().toString(), 
            text: newTodoText, 
            completed: false,
            dueDate: newTodoDueDate,
            subject: course.name
        };
        const updatedCourse = { ...course, todos: [...course.todos, newTodo] };
        onCourseUpdate(updatedCourse);
        setNewTodoText('');
        setNewTodoDueDate('');
    };
    const toggleTodo = (id: string) => {
        const updatedCourse = { ...course, todos: course.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t) };
        onCourseUpdate(updatedCourse);
    };
    const deleteTodo = (id: string) => {
        const updatedCourse = { ...course, todos: course.todos.filter(t => t.id !== id) };
        onCourseUpdate(updatedCourse);
    };
    const clearCompleted = () => {
        const updatedCourse = { ...course, todos: course.todos.filter(t => !t.completed) };
        onCourseUpdate(updatedCourse);
    };
    
    return (
        <div>
            <div className="flex justify-end mb-2">
                {course.todos.some(t => t.completed) && (
                    <button onClick={clearCompleted} className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-200 dark:hover:bg-red-900">Clear Completed</button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                <input value={newTodoText} onChange={e => setNewTodoText(e.target.value)} placeholder="Add a to-do item..." className="p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
                <input type="datetime-local" value={newTodoDueDate} onChange={e => setNewTodoDueDate(e.target.value)} className="p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
            </div>
            <button onClick={addTodo} className="w-full px-4 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black rounded-md">+ Add To-do</button>
            <ul className="space-y-2 mt-4">
                {sortedTodos.map(todo => (
                    <li key={todo.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                        <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="h-5 w-5 rounded text-cyan-600 focus:ring-cyan-500"/>
                        <div className={`ml-3 flex-grow ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                            <p>{todo.text}</p>
                            {todo.dueDate && <p className="text-xs text-gray-400">{new Date(todo.dueDate).toLocaleString()}</p>}
                        </div>
                        <button onClick={() => deleteTodo(todo.id)}><TrashIcon className="text-gray-400 hover:text-red-500"/></button>
                    </li>
                ))}
            </ul>
        </div>
    )
};

const FilesTab: React.FC<{ course: Course, onCourseUpdate: (updatedCourse: Course) => void }> = ({ course, onCourseUpdate }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        setIsUploading(true);

        const newFilesPromises = Array.from(files).map(async (file: File) => {
            const extension = file.name.split('.').pop()?.toLowerCase();
            let type: CourseFile['type'] = 'other';
            if (extension === 'pdf') type = 'pdf';
            else if (extension === 'pptx' || extension === 'ppt') type = 'pptx';
            else if (extension === 'docx' || extension === 'doc') type = 'docx';
            
            try {
                const dataUrl = await fileToBase64(file);
                const newFile: CourseFile = { 
                    id: `${Date.now()}-${file.name}`, 
                    name: file.name, 
                    type,
                    mimeType: file.type,
                    dataUrl: dataUrl,
                };
                return newFile;
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                return null;
            }
        });

        try {
            const newFiles = (await Promise.all(newFilesPromises)).filter((f): f is CourseFile => f !== null);
            if(newFiles.length < files.length) {
                alert('Some files could not be uploaded, they might be too large or corrupted.');
            }
            const updatedCourse = { ...course, files: [...course.files, ...newFiles] };
            onCourseUpdate(updatedCourse);
        } catch (error) {
            console.error("Error reading files:", error);
            alert("There was an error processing your files.");
        } finally {
            setIsUploading(false);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const deleteFile = (id: string) => {
        const updatedCourse = { ...course, files: course.files.filter(f => f.id !== id) };
        onCourseUpdate(updatedCourse);
    };

    return (
        <div>
            <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                onChange={handleFileSelect}
                className="hidden" 
                disabled={isUploading}
            />
            <div className="flex justify-end mb-4">
                <button 
                    onClick={triggerFileInput} 
                    disabled={isUploading}
                    className="px-4 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black rounded-md disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                    {isUploading ? 'Uploading...' : '+ Upload Files'}
                </button>
            </div>
            {isUploading && (
                 <div className="text-center text-sm text-gray-500 my-4">
                    <p>Processing files, please wait...</p>
                 </div>
            )}
            <ul className="space-y-2">
                {course.files.map(file => (
                    <li key={file.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                        <FileIcon type={file.type}/>
                        <a href={file.dataUrl} download={file.name} target="_blank" rel="noopener noreferrer" className="ml-3 flex-grow truncate hover:underline" title={file.name}>
                            {file.name}
                        </a>
                        <button onClick={() => deleteFile(file.id)}><TrashIcon className="text-gray-400 hover:text-red-500 ml-2"/></button>
                    </li>
                ))}
            </ul>
        </div>
    )
};

const LinksTab: React.FC<{ course: Course, onCourseUpdate: (updatedCourse: Course) => void, onLoadVideo: (url: string) => void }> = ({ course, onCourseUpdate, onLoadVideo }) => {
    const addLink = () => {
        const title = prompt("Enter link title:");
        if (!title) return;
        const url = prompt("Enter URL:");
        if (!url) return;
        const finalUrl = url.startsWith('http') ? url : `https://${url}`;
        const updatedCourse = { ...course, links: [...course.links, { id: Date.now().toString(), title, url: finalUrl }] };
        onCourseUpdate(updatedCourse);
    };
    const deleteLink = (id: string) => {
        const updatedCourse = { ...course, links: course.links.filter(l => l.id !== id) };
        onCourseUpdate(updatedCourse);
    };
    const handleLinkClick = (event: React.MouseEvent, url: string) => {
        const isYoutubeLink = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
        if (isYoutubeLink) {
            event.preventDefault();
            onLoadVideo(url);
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={addLink} className="px-4 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black rounded-md">+ Link</button>
            </div>
            <ul className="space-y-2">
                {course.links.map(link => (
                    <li key={link.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="flex-grow">
                            <a href={link.url} onClick={(e) => handleLinkClick(e, link.url)} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{link.title}</a>
                            <p className="text-xs text-gray-500 truncate">{link.url}</p>
                        </div>
                        <button onClick={() => deleteLink(link.id)}><TrashIcon className="text-gray-400 hover:text-red-500"/></button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const StudySetsTab: React.FC<{ course: Course, onCourseUpdate: (updatedCourse: Course) => void }> = ({ course, onCourseUpdate }) => {
    const [expandedSetId, setExpandedSetId] = useState<string | null>(null);
    const [practiceSet, setPracticeSet] = useState<StudySet | null>(null);

    const addSet = () => {
        const name = prompt("Enter new study set name (e.g., 'Midterm Review'):");
        if (!name) return;
        const newSet: StudySet = { id: Date.now().toString(), name, flashcards: [] };
        onCourseUpdate({ ...course, studySets: [...course.studySets, newSet] });
    };

    const addFlashcard = (setId: string) => {
        const front = prompt("Enter flashcard front (question/term):");
        if (!front) return;
        const back = prompt("Enter flashcard back (answer/definition):");
        if (!back) return;
        const newCard: Flashcard = { id: Date.now().toString(), front, back };
        const updatedSets = course.studySets.map(s => s.id === setId ? { ...s, flashcards: [...s.flashcards, newCard] } : s);
        onCourseUpdate({ ...course, studySets: updatedSets });
    };

    const deleteFlashcard = (setId: string, cardId: string) => {
        const updatedSets = course.studySets.map(s => s.id === setId ? { ...s, flashcards: s.flashcards.filter(fc => fc.id !== cardId) } : s);
        onCourseUpdate({ ...course, studySets: updatedSets });
    };
    
    return (
        <div>
             <div className="flex justify-end mb-4">
                <button onClick={addSet} className="px-4 py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black rounded-md">+ Study Set</button>
            </div>
            <div className="space-y-4">
                {course.studySets.map(set => (
                    <div key={set.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="w-full text-left flex justify-between items-center">
                            <button onClick={() => setExpandedSetId(expandedSetId === set.id ? null : set.id)} className="font-semibold text-lg flex-grow text-left">
                                {set.name} <span>({set.flashcards.length} cards)</span>
                            </button>
                            <button 
                                onClick={() => setPracticeSet(set)} 
                                disabled={set.flashcards.length === 0}
                                className="px-4 py-1 text-sm font-semibold bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Practice
                            </button>
                        </div>
                       {expandedSetId === set.id && (
                           <div className="mt-4 pt-4 border-t border-dashed">
                               <div className="flex justify-end mb-2">
                                  <button onClick={() => addFlashcard(set.id)} className="px-3 py-1 text-xs font-semibold bg-cyan-600 text-white rounded-md">+ Flashcard</button>
                               </div>
                               <div className="space-y-2">
                                   {set.flashcards.map(card => (
                                       <div key={card.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex justify-between items-start">
                                           <div>
                                               <p><strong>Front:</strong> {card.front}</p>
                                               <p><strong>Back:</strong> {card.back}</p>
                                           </div>
                                           <button onClick={() => deleteFlashcard(set.id, card.id)}><TrashIcon className="text-gray-400 hover:text-red-500"/></button>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )}
                    </div>
                ))}
            </div>
            {practiceSet && <FlashcardPracticeModal studySet={practiceSet} onClose={() => setPracticeSet(null)} />}
        </div>
    )
}

// --- COURSE DETAIL VIEW ---
interface CourseDetailViewProps {
    course: Course;
    onBack: () => void;
    onUpdateCourse: (updatedCourse: Course) => void;
    onLoadVideo: (url: string) => void;
}

const CourseDetailView: React.FC<CourseDetailViewProps> = ({ course, onBack, onUpdateCourse, onLoadVideo }) => {
    const [activeTab, setActiveTab] = useState('To-do');
    const [isEditing, setIsEditing] = useState(false);
    const [editedCourse, setEditedCourse] = useState(course);

    useEffect(() => {
        setEditedCourse(course);
    }, [course]);

    const handleSave = () => {
        onUpdateCourse(editedCourse);
        setIsEditing(false);
    }
    
    return (
        <div className="w-full max-w-4xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <BackArrowIcon/>
                Back to Courses
            </button>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                           <ComputerIcon />
                        </div>
                        <div>
                            {isEditing ? (
                                <input value={editedCourse.code} onChange={e => setEditedCourse({...editedCourse, code: e.target.value})} className="text-3xl font-bold bg-transparent border-b-2 p-1" />
                            ) : (
                                <h2 className="text-3xl font-bold">{course.code}</h2>
                            )}
                            <p className="text-gray-500 dark:text-gray-400">{course.name.toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="px-4 py-2 text-sm font-semibold border-2 border-black dark:border-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 w-28">
                        {isEditing ? 'Save' : 'Edit Course'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6 border-y border-dashed border-gray-300 dark:border-gray-600 py-4">
                    {isEditing ? (
                        <>
                            <input value={editedCourse.instructor} onChange={e => setEditedCourse({...editedCourse, instructor: e.target.value})} placeholder="Instructor" className="bg-transparent border-b p-1"/>
                             <input value={editedCourse.location} onChange={e => setEditedCourse({...editedCourse, location: e.target.value})} placeholder="Location" className="bg-transparent border-b p-1"/>
                        </>
                    ) : (
                        <>
                            <div><span className="font-semibold w-24 inline-block">Instructor:</span> {course.instructor}</div>
                            <div><span className="font-semibold w-24 inline-block">Schedule:</span> {course.schedules.length > 0 ? 'Scheduled' : 'Not set'}</div>
                            <div><span className="font-semibold w-24 inline-block">Location:</span> {course.location}</div>
                        </>
                    )}
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
                    {['To-do', 'Files', 'Study Sets', 'Links'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-black dark:border-white' : 'text-gray-500'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                 
                 {activeTab === 'To-do' && <TodoTab course={course} onCourseUpdate={onUpdateCourse} />}
                 {activeTab === 'Files' && <FilesTab course={course} onCourseUpdate={onUpdateCourse} />}
                 {activeTab === 'Study Sets' && <StudySetsTab course={course} onCourseUpdate={onUpdateCourse} />}
                 {activeTab === 'Links' && <LinksTab course={course} onCourseUpdate={onUpdateCourse} onLoadVideo={onLoadVideo} />}
            </div>
        </div>
    )
}

// --- NEW COURSE VIEW ---
const NewCourseView: React.FC<{onSave: (course: Course) => void; onBack: () => void}> = ({ onSave, onBack }) => {
    const [color, setColor] = useState(COURSE_COLORS[0]);
    const [name, setName] = useState('');
    const [instructor, setInstructor] = useState('');
    const [location, setLocation] = useState('');
    const [assignSchedules, setAssignSchedules] = useState(false);
    const [schedules, setSchedules] = useState<ScheduleTime[]>([
      { id: Date.now().toString(), days: [], startTime: '09:00', endTime: '10:00' }
    ]);
    
    const handleSave = () => {
        if (!name.trim()) {
            alert("Please enter a course name.");
            return;
        }
        const newCourse: Course = {
            id: Date.now().toString(),
            name,
            code: name.substring(0,4).toUpperCase(),
            instructor,
            location,
            color,
            schedules: assignSchedules ? schedules : [],
            files: [],
            todos: [],
            links: [],
            studySets: [],
        };
        onSave(newCourse);
    };

    const addScheduleTime = () => {
        setSchedules([...schedules, { id: Date.now().toString(), days: [], startTime: '09:00', endTime: '10:00' }]);
    };
    
    const updateScheduleTime = (id: string, newTime: Partial<ScheduleTime>) => {
        setSchedules(schedules.map(s => s.id === id ? { ...s, ...newTime } : s));
    };

    const toggleDay = (scheduleId: string, day: Day) => {
        const schedule = schedules.find(s => s.id === scheduleId);
        if (!schedule) return;
        
        const newDays = schedule.days.includes(day)
          ? schedule.days.filter(d => d !== day)
          : [...schedule.days, day];
        updateScheduleTime(scheduleId, { days: newDays });
    };

    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <BackArrowIcon className="w-6 h-6"/>
            </button>
            <h1 className="text-xl font-bold ml-4">New Course</h1>
        </div>

        <div className="space-y-6 text-black dark:text-white">
            <div className="flex justify-center">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <FolderIcon className="w-16 h-16 text-gray-400 dark:text-gray-500"/>
                </div>
            </div>
            
            <div>
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2 mt-2">
                    {COURSE_COLORS.map(c => (
                        <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-black dark:border-white' : 'border-transparent'}`} style={{backgroundColor: c}}></button>
                    ))}
                    <button className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"><PlusIcon className="w-5 h-5"/></button>
                </div>
            </div>

            <div>
                <label htmlFor="course-name" className="text-sm font-medium">Course</label>
                <input id="course-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter course name" className="w-full p-3 mt-1 bg-gray-200 dark:bg-gray-800 rounded-lg border-2 border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-900 outline-none"/>
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
                <label className="text-sm font-medium">Assign schedules to this course</label>
                <button onClick={() => setAssignSchedules(!assignSchedules)} className={`w-12 h-6 rounded-full p-1 transition-colors ${assignSchedules ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${assignSchedules ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>

            {assignSchedules && (
                <div className="space-y-4">
                    {schedules.map((s, index) => (
                        <div key={s.id} className="p-4 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg">
                            <p className="font-semibold mb-2">Schedule {index + 1}</p>
                            <div className="flex justify-between mb-2">
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
                     <button onClick={addScheduleTime} className="w-full p-3 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center font-semibold">
                        <PlusIcon className="w-5 h-5 mr-2"/> Add
                    </button>
                </div>
            )}
            
            <button onClick={handleSave} className="w-full p-4 bg-gray-300 dark:bg-gray-700 font-bold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600">Create</button>
        </div>
      </div>
    );
};


// --- COURSES LIST VIEW ---
interface CourseItemProps {
    course: Course;
    onSelectCourse: (course: Course) => void;
    onRename: (course: Course) => void;
    onDelete: (course: Course) => void;
}
const CourseItem: React.FC<CourseItemProps> = ({ course, onSelectCourse, onRename, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative">
            <button onClick={() => onSelectCourse(course)}
                className="w-full aspect-[4/3] border-2 border-black dark:border-gray-500 rounded-lg p-4 flex flex-col justify-end text-left hover:shadow-lg hover:-translate-y-1 transition-transform"
                style={{ backgroundColor: course.color }}
            >
                <span className="font-bold text-black px-2 py-1 bg-white/70 rounded-md inline-block">{course.name}</span>
            </button>
             <div className="absolute top-2 right-2" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 bg-black/10 hover:bg-black/20 rounded-full">
                    <MoreIcon className="text-black/70" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 z-10">
                        <button onClick={() => { onRename(course); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Rename</button>
                        <button onClick={() => { onDelete(course); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">Delete</button>
                    </div>
                )}
            </div>
        </div>
    )
}

interface CoursesListViewProps {
    onLoadVideo: (url: string) => void;
    courses: Course[];
    onSelectCourse: (course: Course) => void;
    onAddCourse: () => void;
    onRenameCourse: (id: string, newName: string) => void;
    onDeleteCourse: (id: string) => void;
}
const CoursesListView: React.FC<CoursesListViewProps> = (props) => {
    const { onLoadVideo, courses, onSelectCourse, onAddCourse, onRenameCourse, onDeleteCourse } = props;
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<{type: 'rename' | 'delete', course?: Course} | null>(null);
    const [courseName, setCourseName] = useState('');

    const filteredCourses = useMemo(() => {
        return courses.filter(course => 
            course.name.toLowerCase().includes(search.toLowerCase()) || 
            course.code.toLowerCase().includes(search.toLowerCase())
        );
    }, [courses, search]);
    
    const handleModalSubmit = () => {
        if (modal?.type === 'rename' && modal.course && courseName) {
            onRenameCourse(modal.course.id, courseName);
        }
        if (modal?.type === 'delete' && modal.course) {
            onDeleteCourse(modal.course.id);
        }
        setModal(null);
        setCourseName('');
    };

    return (
        <div>
            <UrlInputView onLoadVideo={onLoadVideo} />
            <h1 className="text-3xl font-bold mb-2">Courses</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create a course folder to keep track of course-related files.</p>
            
            <div className="relative mb-6">
                 <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search a course"
                    className="w-full p-3 pl-10 border-2 border-black dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                 />
                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                 </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCourses.map(course => (
                    <CourseItem key={course.id} course={course} onSelectCourse={onSelectCourse} 
                        onRename={(c: Course) => { setCourseName(c.name); setModal({ type: 'rename', course: c }); }}
                        onDelete={(c: Course) => setModal({ type: 'delete', course: c })}
                    />
                ))}
            </div>
             <button onClick={onAddCourse} className="fixed bottom-24 right-8 w-16 h-16 bg-black text-white dark:bg-white dark:text-black rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
                <PlusIcon />
            </button>

            {modal && (
                <Modal isOpen={!!modal} onClose={() => setModal(null)} title={
                    modal.type === 'rename' ? 'Rename Course' : 'Delete Course'
                }>
                    {modal.type === 'delete' ? (
                        <p>Are you sure you want to delete the course "<strong>{modal.course?.name}</strong>"? This action cannot be undone.</p>
                    ) : (
                        <input type="text" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="Course Name" className="w-full p-2 border rounded"/>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button onClick={handleModalSubmit} className={`px-4 py-2 text-white rounded ${modal.type === 'delete' ? 'bg-red-600' : 'bg-cyan-600'}`}>
                            {modal.type === 'rename' ? 'Save' : 'Delete'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
interface CoursesPageProps {
  onLoadVideo: (url: string) => void;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const CoursesPage: React.FC<CoursesPageProps> = ({ onLoadVideo, courses, setCourses }) => {
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const handleAddCourse = (newCourse: Course) => {
        setCourses(prev => [...prev, newCourse]);
        setViewMode('list');
    };
    const handleUpdateCourse = (updatedCourse: Course) => {
        setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
        if (selectedCourse && selectedCourse.id === updatedCourse.id) {
            setSelectedCourse(updatedCourse);
        }
    };
    const handleDeleteCourse = (id: string) => {
        setCourses(prev => prev.filter(c => c.id !== id));
    };
    
    const handleSelectCourse = (course: Course) => {
      setSelectedCourse(course);
      setViewMode('detail');
    }

    if (viewMode === 'create') {
        return <NewCourseView onBack={() => setViewMode('list')} onSave={handleAddCourse} />
    }
    
    if (viewMode === 'detail' && selectedCourse) {
        return <CourseDetailView course={selectedCourse} onBack={() => setViewMode('list')} onUpdateCourse={handleUpdateCourse} onLoadVideo={onLoadVideo} />
    }

    return <CoursesListView 
        onLoadVideo={onLoadVideo} 
        courses={courses} 
        onSelectCourse={handleSelectCourse}
        onAddCourse={() => setViewMode('create')}
        onRenameCourse={(id, newName) => {
            const course = courses.find(c => c.id === id);
            if (course) {
                handleUpdateCourse({ ...course, name: newName });
            }
        }}
        onDeleteCourse={handleDeleteCourse}
    />
}

export default CoursesPage;
