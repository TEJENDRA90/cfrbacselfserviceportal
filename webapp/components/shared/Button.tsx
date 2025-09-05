import React from 'react';

interface ButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className, 
  type = 'button', 
  disabled = false 
}) => {
  const baseClasses = "flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-900";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-slate-500 text-white hover:bg-slate-600 dark:bg-gray-600 dark:hover:bg-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  const disabledClasses = "disabled:bg-slate-300 dark:disabled:bg-gray-500 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-gray-400";
  
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};
