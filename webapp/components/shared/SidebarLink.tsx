import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
                   (to === '/exceptions' && location.pathname.startsWith('/exceptions/')) ||
                   (to === '/roles' && location.pathname.startsWith('/roles/'));

  const activeClasses = "bg-blue-500 text-white dark:bg-gray-700/80";
  const inactiveClasses = "text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white";

  return (
    <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? activeClasses : inactiveClasses}`}>
      {icon}
      <span>{children}</span>
    </Link>
  );
};
