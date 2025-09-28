import React from 'react';

const HomeIcon: React.FC<{isActive: boolean}> = ({ isActive }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9.26681L12 2L21 9.26681V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V9.26681Z" stroke={isActive ? "black" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const CourseIcon: React.FC<{isActive: boolean}> = ({ isActive }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke={isActive ? "black" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke={isActive ? "black" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const ScheduleIcon: React.FC<{isActive: boolean}> = ({ isActive }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={isActive ? "black" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 2V6" stroke={isActive ? "black" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 2V6" stroke={isActive ? "black" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 10H21" stroke={isActive ? "black" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// FIX: Added the missing BottomNavBar component and default export.
interface BottomNavBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { name: 'Home', icon: HomeIcon },
    { name: 'Course', icon: CourseIcon },
    { name: 'Schedule', icon: ScheduleIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-t-lg z-20">
      <div className="container mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = activeView === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveView(item.name)}
              className="flex flex-col items-center justify-center w-full h-full text-sm font-medium transition-colors"
            >
              <item.icon isActive={isActive} />
              <span className={`mt-1 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;