import React from 'react';
import { Icon } from './Icon';
import { useTheme } from './ThemeProvider';

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  const handleToggle = () => {
    console.log('Theme toggle clicked, current theme:', theme);
    toggleTheme();
  };
  
  return (
    <button 
      onClick={handleToggle} 
      className="flex items-center justify-center w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Icon path="M12 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 3zM18.75 6a.75.75 0 000-1.06l-1.06-1.06a.75.75 0 00-1.06 1.06l1.06 1.06a.75.75 0 001.06 0zM21 12a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM18.75 18a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 00-1.06 1.06l1.06 1.06zM12 21a.75.75 0 01.75-.75v-1.5a.75.75 0 01-1.5 0v1.5A.75.75 0 0112 21zM5.25 18a.75.75 0 00-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM3 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zM5.25 6a.75.75 0 001.06-1.06L5.25 3.88a.75.75 0 00-1.06 1.06l1.06 1.06zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
      ) : (
        <Icon path="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 004.463-.949a.75.75 0 01.82.162a.75.75 0 01.162.819A9.757 9.757 0 0112.133 22.37a9.75 9.75 0 01-9.67-9.284A9.757 9.757 0 019.528 1.718z" />
      )}
      <span className="ml-3">Switch Theme</span>
    </button>
  );
};
