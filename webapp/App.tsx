import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { ThemeProvider, ThemeSwitcher } from './components/shared';
import { CommonApiProvider } from './contexts/CommonApiContext';
import { 
  Dashboard, 
  RoleManagement, 
  RoleEditor, 
  DefaultRoleAssignment, 
  ExceptionHandling, 
  UserRoleManager, 
  ApplicationManagement,
  AuditReport 
} from './components/pages';
import { MOCK_ROLES, MOCK_USERS, MOCK_DEFAULT_ASSIGNMENTS, MOCK_APPLICATIONS } from '../constants';
import type { Role, User, DefaultAssignmentRule, Application } from '../types';
import apiService from './lib/service';

const NavigationLink = ({ to, children, icon }: { to: string; children: React.ReactNode; icon: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/' && location.pathname === '/');

    return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-blue-500 text-white' 
          : 'text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white'
      }`}
    >
            {icon}
            <span>{children}</span>
        </Link>
    );
};

const AppContent = () => {
    const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [defaultAssignments, setDefaultAssignments] = useState<DefaultAssignmentRule[]>(MOCK_DEFAULT_ASSIGNMENTS);
    const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
    
    // Fetch roles from API
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await apiService.get('/rbac/roles');
                console.log('Roles API response in App:', response);
                
                // Handle different possible response structures
                let rolesData = [];
                if (response.data && response.data.data) {
                    rolesData = response.data.data;
                } else if (response.data && Array.isArray(response.data)) {
                    rolesData = response.data;
                } else if (Array.isArray(response)) {
                    rolesData = response;
                }
                
                console.log('Processed roles data in App:', rolesData);
                setRoles(rolesData);
            } catch (err) {
                console.error('Error fetching roles in App:', err);
                // Keep using MOCK_ROLES if API fails
            }
        };

        fetchRoles();
    }, []);
  
    return (
      <HashRouter>
          <div className="flex h-screen bg-slate-100 dark:bg-gray-900 text-slate-800 dark:text-white">
              <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 p-4 flex flex-col justify-between border-r border-slate-200 dark:border-gray-700">
                  <div>
                      <div className="flex items-center gap-3 px-3 mb-6">
               <div className="w-8 h-8 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-slate-700 dark:text-slate-300">
                   <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v.54l8.22 8.22a.75.75 0 01-1.06 1.06L12 4.811 3.09 13.81a.75.75 0 01-1.06-1.06l8.22-8.22v-.54a.75.75 0 01.75-.75zM11.25 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3zM12 15.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3zM13.5 15a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" clipRule="evenodd" />
                 </svg>
               </div>
                          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Auth Portal</h1>
                      </div>
                      <nav className="space-y-2">
              <NavigationLink to="/" icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" clipRule="evenodd" />
                </svg>
              }>
                Dashboard
              </NavigationLink>
              <NavigationLink to="/roles" icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M18 18.75a3 3 0 00-3-3H9a3 3 0 00-3 3v.5a.75.75 0 00.75.75h10.5a.75.75 0 00.75-.75v-.5zM15 12a3 3 0 11-6 0 3 3 0 016 0zM17.625 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                </svg>
              }>
                Role Management
              </NavigationLink>
              <NavigationLink to="/assignments" icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375zM1.5 9h1.125a1.125 1.125 0 011.125 1.125v1.5a1.125 1.125 0 01-1.125 1.125H1.5v-3.75zM3 15v.75c0 1.036.84 1.875 1.875 1.875h13.5A1.125 1.125 0 0119.5 19.5v-1.5a1.125 1.125 0 011.125-1.125H22.5v-3.75h-1.125a1.125 1.125 0 00-1.125 1.125v1.5a1.125 1.125 0 001.125 1.125H21v.75a.375.375 0 01-.375.375H4.875a.375.375 0 01-.375-.375v-.75h1.125a1.125 1.125 0 001.125-1.125v-1.5a1.125 1.125 0 00-1.125-1.125H3zM1.5 15h1.125a1.125 1.125 0 011.125 1.125v1.5a1.125 1.125 0 01-1.125 1.125H1.5v-3.75z" clipRule="evenodd" />
                </svg>
              }>
                Default Assignments
              </NavigationLink>
              <NavigationLink to="/exceptions" icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" clipRule="evenodd" />
                </svg>
              }>
                Exception Handling
              </NavigationLink>
              <NavigationLink to="/applications" icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M3.75 1.5a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v16.5a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75V1.5zM4.5 3v15h15V3H4.5zM9 6a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zM9 9a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zM9 12a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9z" clipRule="evenodd" />
                </svg>
              }>
                Application
              </NavigationLink>
              <NavigationLink to="/audit" icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M10.5 6A2.25 2.25 0 008.25 8.25v10.5A2.25 2.25 0 0010.5 21h3a2.25 2.25 0 002.25-2.25V8.25A2.25 2.25 0 0013.5 6h-3zM10.5 9h3v1.5h-3V9zm0 3h3v1.5h-3v-1.5zm0 3h3v1.5h-3V15zM4.125 3C3.504 3 3 3.504 3 4.125v15.75C3 20.496 3.504 21 4.125 21H6v-2.25A2.25 2.25 0 018.25 16.5h7.5A2.25 2.25 0 0118 18.75V21h1.875C20.496 21 21 20.496 21 19.875V4.125C21 3.504 20.496 3 19.875 3H4.125z" clipRule="evenodd" />
                </svg>
              }>
                Audit Report
              </NavigationLink>
                      </nav>
                  </div>
                   <div>
                       <ThemeSwitcher />
                       <div className="text-center text-xs text-slate-400 dark:text-gray-500 mt-4">
                          <p>&copy; {new Date().getFullYear()} VPP Auth Systems</p>
                      </div>
                   </div>
              </aside>
              <main className="flex-1 p-8 overflow-y-auto">
                  <Routes>
                      <Route path="/" element={<Dashboard roles={roles} users={users} defaultAssignments={defaultAssignments} />} />
                      <Route path="/roles" element={<RoleManagement roles={roles} setRoles={setRoles} />} />
                      <Route path="/roles/new" element={<RoleEditor roles={roles} setRoles={setRoles} />} />
                      <Route path="/roles/:roleId" element={<RoleEditor roles={roles} setRoles={setRoles} />} />
                      <Route path="/assignments" element={<DefaultRoleAssignment rules={defaultAssignments} setRules={setDefaultAssignments} roles={roles} />} />
                      <Route path="/exceptions" element={<ExceptionHandling users={users} roles={roles} />} />
                      <Route path="/exceptions/:userId" element={<UserRoleManager users={users} setUsers={setUsers} roles={roles} />} />
              <Route path="/applications" element={<ApplicationManagement applications={applications} setApplications={setApplications} />} />
                      <Route path="/audit" element={<AuditReport users={users} roles={roles} />} />
                  </Routes>
              </main>
          </div>
      </HashRouter>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <CommonApiProvider>
                <AppContent />
            </CommonApiProvider>
        </ThemeProvider>
    );
}
