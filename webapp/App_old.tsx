
import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/shared';
import { 
  Dashboard, 
  RoleManagement, 
  RoleEditor, 
  DefaultRoleAssignment, 
  ExceptionHandling, 
  UserRoleManager, 
  AuditReport 
} from './components/pages';
import { MOCK_ROLES, MOCK_USERS, MOCK_DEFAULT_ASSIGNMENTS } from '../constants';
import type { Role, User, DefaultAssignmentRule } from '../types';


// -- THEME MANAGEMENT -- //
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void; }>({
    theme: 'dark',
    toggleTheme: () => {},
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('theme');
        return (storedTheme === 'light' || storedTheme === 'dark') ? storedTheme : 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => useContext(ThemeContext);

const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button 
            onClick={toggleTheme} 
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


// -- ICONS -- //
const Icon = ({ path, className = "w-6 h-6" }: { path: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);
const HomeIcon = () => <Icon path="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />;
const HomeIconFilled = () => <Icon path="M12 2.25a.75.75 0 01.75.75v.54l8.22 8.22a.75.75 0 01-1.06 1.06L12 4.811 3.09 13.81a.75.75 0 01-1.06-1.06l8.22-8.22v-.54a.75.75 0 01.75-.75zM11.25 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3zM12 15.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3zM13.5 15a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" />;
const RoleIcon = () => <Icon path="M18 18.75a3 3 0 00-3-3H9a3 3 0 00-3 3v.5a.75.75 0 00.75.75h10.5a.75.75 0 00.75-.75v-.5zM15 12a3 3 0 11-6 0 3 3 0 016 0zM17.625 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" />;
const RuleIcon = () => <Icon path="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375zM1.5 9h1.125a1.125 1.125 0 011.125 1.125v1.5a1.125 1.125 0 01-1.125 1.125H1.5v-3.75zM3 15v.75c0 1.036.84 1.875 1.875 1.875h13.5A1.125 1.125 0 0119.5 19.5v-1.5a1.125 1.125 0 011.125-1.125H22.5v-3.75h-1.125a1.125 1.125 0 00-1.125 1.125v1.5a1.125 1.125 0 001.125 1.125H21v.75a.375.375 0 01-.375.375H4.875a.375.375 0 01-.375-.375v-.75h1.125a1.125 1.125 0 001.125-1.125v-1.5a1.125 1.125 0 00-1.125-1.125H3zM1.5 15h1.125a1.125 1.125 0 011.125 1.125v1.5a1.125 1.125 0 01-1.125 1.125H1.5v-3.75z" />;
const ExceptionIcon = () => <Icon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />;
const AuditIcon = () => <Icon path="M10.5 6A2.25 2.25 0 008.25 8.25v10.5A2.25 2.25 0 0010.5 21h3a2.25 2.25 0 002.25-2.25V8.25A2.25 2.25 0 0013.5 6h-3zM10.5 9h3v1.5h-3V9zm0 3h3v1.5h-3v-1.5zm0 3h3v1.5h-3V15zM4.125 3C3.504 3 3 3.504 3 4.125v15.75C3 20.496 3.504 21 4.125 21H6v-2.25A2.25 2.25 0 018.25 16.5h7.5A2.25 2.25 0 0118 18.75V21h1.875C20.496 21 21 20.496 21 19.875V4.125C21 3.504 20.496 3 19.875 3H4.125z" />
const PlusIcon = ({className="w-5 h-5"}: { className?: string }) => <Icon className={className} path="M12 4.5a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6A.75.75 0 0112 4.5z" />;
const TrashIcon = () => <Icon className="w-5 h-5" path="M13.5 6a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V6.75a.75.75 0 01.75-.75zM8.25 6a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V6.75a.75.75 0 01.75-.75zM3 3.75A2.25 2.25 0 015.25 1.5h13.5A2.25 2.25 0 0121 3.75v16.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 20.25V3.75zM5.25 3a.75.75 0 00-.75.75v16.5c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75H5.25z" />;
const EditIcon = () => <Icon className="w-5 h-5" path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />;
const MinusCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => <Icon className={className} path="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-3.75 9a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" />
const ExportIcon = () => <Icon className="w-5 h-5" path="M12 1.5a.75.75 0 01.75.75v11.543l3.44-3.441a.75.75 0 111.06 1.06l-4.75 4.75a.75.75 0 01-1.06 0l-4.75-4.75a.75.75 0 111.06-1.06L11.25 13.793V2.25A.75.75 0 0112 1.5zM3 16.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />;


// -- UI COMPONENTS -- //
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg p-6 ${className}`}>
        {children}
    </div>
);

type ButtonProps = {
    onClick?: (e: React.MouseEvent) => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary', className, type = 'button', disabled = false }) => {
    const baseClasses = "flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-900";
    const variantClasses = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-slate-500 text-white hover:bg-slate-600 dark:bg-gray-600 dark:hover:bg-gray-700 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };
    const disabledClasses = "disabled:bg-slate-300 dark:disabled:bg-gray-500 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-gray-400";
    return <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}>{children}</button>;
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                        <Icon path="M6.28 5.22a.75.75 0 00-1.06 1.06L10.94 12l-5.72 5.72a.75.75 0 101.06 1.06L12 13.06l5.72 5.72a.75.75 0 101.06-1.06L13.06 12l5.72-5.72a.75.75 0 00-1.06-1.06L12 10.94 6.28 5.22z" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// -- HELPERS -- //
type Status = 'Active' | 'Expired' | 'Removed';
const getRoleStatus = (roleAssignment: UserRole): Status => {
    if (roleAssignment.removedOn) {
        return 'Removed';
    }
    if (roleAssignment.endDate && new Date(roleAssignment.endDate) < new Date()) {
        return 'Expired';
    }
    return 'Active';
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
    const colors: Record<Status, string> = {
        Active: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30',
        Expired: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30',
        Removed: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${colors[status]}`}>{status}</span>;
};

// -- PAGE COMPONENTS -- //

const Dashboard: React.FC<{ roles: Role[], users: User[], defaultAssignments: DefaultAssignmentRule[] }> = ({ roles, users, defaultAssignments }) => {
    const activeExceptionsCount = useMemo(() =>
        users.flatMap(user => user.roles)
             .filter(role => role.assignedBy !== 'Auto' && getRoleStatus(role) === 'Active')
             .length,
        [users]
    );

    return (
        <Card className="animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">RBAC Self-Service Portal</h1>
            <p className="text-slate-600 dark:text-gray-300 mb-6">Welcome! This portal provides a real-time overview and management tools for user access controls.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Link to="/roles" className="bg-slate-100 dark:bg-gray-700/50 p-6 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-700 transition-all text-center group flex flex-col justify-center">
                    <div className="flex justify-center text-blue-500 dark:text-blue-400 mb-3"><RoleIcon/></div>
                    <p className="text-5xl font-bold text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{roles.length}</p>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-white mt-2">Defined Roles</h3>
                    <p className="text-slate-500 dark:text-gray-400 mt-1 text-sm">Manage roles and permissions.</p>
                </Link>
                 <Link to="/assignments" className="bg-slate-100 dark:bg-gray-700/50 p-6 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-700 transition-all text-center group flex flex-col justify-center">
                     <div className="flex justify-center text-blue-500 dark:text-blue-400 mb-3"><RuleIcon/></div>
                    <p className="text-5xl font-bold text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{defaultAssignments.length}</p>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-white mt-2">Default Assignments</h3>
                     <p className="text-slate-500 dark:text-gray-400 mt-1 text-sm">Configure automated role assignments.</p>
                </Link>
                 <Link to="/exceptions" className="bg-slate-100 dark:bg-gray-700/50 p-6 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-700 transition-all text-center group flex flex-col justify-center">
                     <div className="flex justify-center text-blue-500 dark:text-blue-400 mb-3"><ExceptionIcon/></div>
                    <p className="text-5xl font-bold text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{activeExceptionsCount}</p>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-white mt-2">Active Exceptions</h3>
                    <p className="text-slate-500 dark:text-gray-400 mt-1 text-sm">Handle manual role assignments.</p>
                </Link>
            </div>
        </Card>
    );
};

const DAY_TYPE_OPTIONS = ["All", "W", "W1", "W-am", "W-pm", "WX", "V", "DO", "T", "TH",  "X", "F", "NA"];

const RoleEditor: React.FC<{ roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>> }> = ({ roles, setRoles }) => {
    const { roleId } = useParams<{ roleId: string }>();
    const navigate = useNavigate();
    const isNewRole = !roleId;

    const initialRole = useMemo(() => {
        if (isNewRole) {
            const newRole: Role = { 
                id: '', name: '', description: '',
                permissions: ATTRIBUTES.map(attr => ({ attribute: attr, values: [] })),
                writeRestrictionDays: null,
                functionalityAccess: "Both",
                dayTypeAccess: ["All"],
                appAccess: []
            };
            return newRole;
        }
        return roles.find(r => r.id === roleId);
    }, [roleId, isNewRole, roles]);
    
    const [formData, setFormData] = useState<Role | undefined>(initialRole);

    const handleMultiSelectChange = (attribute: Attribute, values: string[]) => {
        if (!formData) return;
        const newPermissions = formData.permissions.map(p => 
            p.attribute === attribute ? { ...p, values: values } : p
        );
        setFormData({ ...formData, permissions: newPermissions });
    };

    const handleAppAccessChange = (appName: string, action: Action, isChecked: boolean) => {
        if (!formData) return;
        
        let newAppAccess = [...(formData.appAccess || [])];
        const appIndex = newAppAccess.findIndex(a => a.appName === appName);

        if (appIndex > -1) { // App already has some access defined
            let appConfig = { ...newAppAccess[appIndex] };
            let actions = [...appConfig.actions];

            if (isChecked) {
                if (!actions.includes(action)) {
                    actions.push(action);
                }
            } else {
                actions = actions.filter(a => a !== action);
            }
            
            appConfig.actions = actions;

            if (appConfig.actions.length > 0) {
                newAppAccess[appIndex] = appConfig;
            } else {
                // No actions left, remove the app from access list
                newAppAccess.splice(appIndex, 1);
            }
        } else if (isChecked) { // App is new to the access list
            newAppAccess.push({ appName, actions: [action] });
        }

        const updatedData: Partial<Role> = { appAccess: newAppAccess };
        if (!newAppAccess.some(a => a.actions.includes('Write'))) {
            updatedData.writeRestrictionDays = undefined;
        }

        setFormData({ ...formData, ...updatedData });
    };
    
    const handleDayTypeChange = (selectedOptions: HTMLCollectionOf<HTMLOptionElement>) => {
        if (!formData) return;
        const values = Array.from(selectedOptions, option => option.value);

        const oldValues = formData.dayTypeAccess || [];
        const allWasSelected = oldValues.includes('All');
        const allIsSelected = values.includes('All');

        if (allIsSelected && !allWasSelected) {
            setFormData({ ...formData, dayTypeAccess: ['All'] });
        } else if (allIsSelected && values.length > 1) {
            setFormData({ ...formData, dayTypeAccess: values.filter(v => v !== 'All') });
        } else {
            setFormData({ ...formData, dayTypeAccess: values });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        if (isNewRole) {
            setRoles(prevRoles => [...prevRoles, { ...formData, id: `role-${Date.now()}` }]);
        } else {
            setRoles(prevRoles => prevRoles.map(r => r.id === roleId ? formData : r));
        }
        navigate('/roles');
    };
    
    if (!formData) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-red-500 dark:text-red-400">Role not found</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-2">The role ID specified in the URL does not exist.</p>
                <Link to="/roles">
                    <Button variant="secondary">Back to Role List</Button>
                </Link>
            </div>
        );
    }

    const hasWriteAccess = formData.appAccess?.some(a => a.actions.includes('Write'));

    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{isNewRole ? "Create New Role" : `Edit Role: ${initialRole?.name}`}</h1>
            </div>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="roleName" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Role Name</label>
                        <input type="text" id="roleName" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Description</label>
                        <textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Application Access & Actions</label>
                            <div className="mt-2 bg-slate-100 dark:bg-gray-900/50 rounded-md border border-slate-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                                {APP_LIST.map(appName => {
                                    const currentAccess = formData.appAccess?.find(a => a.appName === appName);
                                    const canRead = currentAccess?.actions.includes('Read') ?? false;
                                    const canWrite = currentAccess?.actions.includes('Write') ?? false;
                                    return (
                                        <div key={appName} className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-gray-700/50 last:border-b-0">
                                            <span className="font-semibold text-slate-800 dark:text-white">{appName}</span>
                                            <div className="flex items-center gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-gray-300 text-sm">
                                                    <input type="checkbox" checked={canRead} onChange={e => handleAppAccessChange(appName, 'Read', e.target.checked)} className="bg-slate-200 dark:bg-gray-700 border-slate-300 dark:border-gray-600 rounded text-blue-500 focus:ring-blue-500" /> Read
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-gray-300 text-sm">
                                                    <input type="checkbox" checked={canWrite} onChange={e => handleAppAccessChange(appName, 'Write', e.target.checked)} className="bg-slate-200 dark:bg-gray-700 border-slate-300 dark:border-gray-600 rounded text-blue-500 focus:ring-blue-500" /> Write
                                                </label>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {hasWriteAccess && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Write Restriction</label>
                                <div className="mt-2 flex items-center gap-4 p-4 bg-slate-100 dark:bg-gray-900/50 rounded-md border border-slate-200 dark:border-gray-700">
                                    <input type="number" value={formData.writeRestrictionDays ?? ''} onChange={e => setFormData({...formData, writeRestrictionDays: e.target.value ? parseInt(e.target.value) : 0})} disabled={formData.writeRestrictionDays === null} className="block w-24 bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md py-1.5 px-3 focus:outline-none focus:ring-blue-500 disabled:bg-slate-200 dark:disabled:bg-gray-800" />
                                    <span className="text-slate-500 dark:text-gray-400 text-sm">days in past</span>
                                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-gray-300">
                                        <input type="checkbox" checked={formData.writeRestrictionDays === null} onChange={e => setFormData({...formData, writeRestrictionDays: e.target.checked ? null : 0})} className="bg-slate-200 dark:bg-gray-700 border-slate-300 dark:border-gray-600 rounded text-blue-500 focus:ring-blue-500" /> No restriction
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="functionalityAccess" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">VPP Functionality Access</label>
                            <select id="functionalityAccess" value={formData.functionalityAccess || 'Both'} onChange={e => setFormData({...formData, functionalityAccess: e.target.value as "Planning View" | "Scheduling View" | "Both"})} className="block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="Both">Both</option>
                                <option value="Planning View">Planning View</option>
                                <option value="Scheduling View">Scheduling View</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="dayTypeAccess" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Day Type Access</label>
                            <select id="dayTypeAccess" multiple value={formData.dayTypeAccess || []} onChange={e => handleDayTypeChange(e.target.selectedOptions)} className="block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-24">
                               {DAY_TYPE_OPTIONS.map(opt => <option key={opt} value={opt} className={opt === 'All' ? 'font-bold text-blue-500 dark:text-blue-300' : ''}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Permission Attributes</label>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-100 dark:bg-gray-900/50 rounded-md border border-slate-200 dark:border-gray-700">
                            {formData.permissions.map(p => (
                                <div key={p.attribute}>
                                    <label htmlFor={p.attribute} className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1">{p.attribute}</label>
                                    <select 
                                        id={p.attribute} 
                                        multiple 
                                        value={p.values}
                                        onChange={e => handleMultiSelectChange(p.attribute, Array.from(e.target.selectedOptions, option => option.value))}
                                        className="block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-24"
                                    >
                                        <option value="All" className="font-bold text-blue-500 dark:text-blue-300">All</option>
                                        <option value="Dynamic" className="font-bold text-green-600 dark:text-green-300">Dynamic</option>
                                        {ATTRIBUTE_VALUES[p.attribute].map(val => <option key={val} value={val}>{val}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-gray-700">
                        <Button type="button" variant="secondary" onClick={() => navigate('/roles')}>Cancel</Button>
                        <Button type="submit">Save Role</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const RoleManagement: React.FC<{ roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>> }> = ({ roles, setRoles }) => {
    const handleDeleteRole = (roleId: string) => {
        if(window.confirm("Are you sure you want to delete this role? This might affect default assignments and users with this role.")) {
            setRoles(roles.filter(r => r.id !== roleId));
        }
    }

    const handleExportXLSX = () => {
        if (roles.length === 0) {
            alert("There are no roles to export.");
            return;
        }

        const dataToExport = roles.map(role => {
            const permissionsData: Record<string, string> = {};
            ATTRIBUTES.forEach(attr => {
                const permission = role.permissions.find(p => p.attribute === attr);
                permissionsData[`Permission: ${attr}`] = permission && permission.values.length > 0 ? permission.values.join(', ') : 'Not Set';
            });

            return {
                'ID': role.id,
                'Name': role.name,
                'Description': role.description,
                'Application Access': role.appAccess?.map(a => `${a.appName} (${a.actions.join('/')})`).join('; ') || 'N/A',
                'Write Restriction (Days)': role.writeRestrictionDays === null ? 'No Restriction' : (role.writeRestrictionDays ?? 'N/A'),
                'VPP Functionality Access': role.functionalityAccess || 'N/A',
                'Day Type Access': role.dayTypeAccess?.join(', ') || 'N/A',
                ...permissionsData,
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Role Definitions");
        
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `role-definitions-${date}.xlsx`);
    };

    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Role Management</h1>
                 <div className="flex items-center gap-4">
                    <Button onClick={handleExportXLSX} variant="secondary" disabled={roles.length === 0}>
                        <ExportIcon /> Export to Excel
                    </Button>
                    <Link to="/roles/new">
                        <Button>
                            <PlusIcon /> Create Role
                        </Button>
                    </Link>
                </div>
            </div>
            <Card className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-gray-700/50 text-xs text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                        <tr>
                            <th className="p-3">Role Name</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">App Access</th>
                            <th className="p-3">Functionality</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                        {roles.map(role => (
                            <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-3 font-medium text-slate-900 dark:text-white">{role.name}</td>
                                <td className="p-3 text-slate-500 dark:text-gray-400">{role.description}</td>
                                <td className="p-3 text-slate-500 dark:text-gray-400">{role.appAccess?.length || 0} apps</td>
                                <td className="p-3 text-slate-500 dark:text-gray-400">{role.functionalityAccess || 'N/A'}</td>
                                <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link to={`/roles/${role.id}`} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"><EditIcon /></Link>
                                        <button onClick={() => handleDeleteRole(role.id)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

const DefaultAssignmentEditorModal: React.FC<{
    rule: DefaultAssignmentRule | null;
    roles: Role[];
    onSave: (rule: DefaultAssignmentRule) => void;
    onClose: () => void;
}> = ({ rule, roles, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<DefaultAssignmentRule, 'id'>>(
        rule ? { 
            jobTitle: rule.jobTitle, 
            roleIds: rule.roleIds,
            company: rule.company,
            function: rule.function,
            operation: rule.operation,
            ship: rule.ship,
            department: rule.department,
        } : { jobTitle: '', roleIds: [] }
    );
    
    const optionalAttributes: Exclude<Attribute, "Job Title">[] = ["Company", "Function", "Operation", "Ship", "Department"];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.jobTitle || !formData.roleIds || formData.roleIds.length === 0) {
            alert("Please select a Job Title and at least one Role.");
            return;
        }
        
        const cleanedData: any = {};
        for (const [key, value] of Object.entries(formData)) {
            if (value) { // This will filter out empty strings but keep non-empty arrays
                cleanedData[key] = value;
            }
        }

        onSave({ ...cleanedData, id: rule?.id || `rule-${Date.now()}` });
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRolesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, roleIds: selectedOptions }));
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={rule ? "Edit Default Assignment Rule" : "Create New Rule"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-slate-100 dark:bg-gray-900/50 rounded-md border border-slate-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-200 mb-3">Mandatory Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Job Title</label>
                            <select id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                                <option value="" disabled>Select a Job Title</option>
                                {ATTRIBUTE_VALUES["Job Title"].map(jt => <option key={jt} value={jt}>{jt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="roleIds" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Assigned Roles</label>
                            <select id="roleIds" name="roleIds" multiple value={formData.roleIds} onChange={handleRolesChange} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-32" required>
                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-gray-900/50 rounded-md border border-slate-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-200 mb-3">Optional Conditions</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">Leave fields as 'Any' to create a broader rule. The more fields you specify, the more specific the rule becomes.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {optionalAttributes.map(attr => {
                            const name = (attr.charAt(0).toLowerCase() + attr.slice(1)).replace(/\s/g, '') as keyof Omit<DefaultAssignmentRule, 'id'|'jobTitle'|'roleIds'>;
                            return (
                                <div key={attr}>
                                    <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-gray-300">{attr}</label>
                                    <select id={name} name={name} value={formData[name] || ''} onChange={handleChange} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">Any</option>
                                        {ATTRIBUTE_VALUES[attr].map(val => <option key={val} value={val}>{val}</option>)}
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Rule</Button>
                </div>
            </form>
        </Modal>
    );
};


const DefaultRoleAssignment: React.FC<{
    rules: DefaultAssignmentRule[], 
    setRules: React.Dispatch<React.SetStateAction<DefaultAssignmentRule[]>>, 
    roles: Role[]
}> = ({ rules, setRules, roles }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<DefaultAssignmentRule | null>(null);

    const handleOpenModal = (rule?: DefaultAssignmentRule) => {
        setEditingRule(rule || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRule(null);
    };

    const handleSaveRule = (rule: DefaultAssignmentRule) => {
        if(editingRule) {
            setRules(rules.map(r => r.id === rule.id ? rule : r));
        } else {
            setRules([...rules, rule]);
        }
        handleCloseModal();
    };

    const handleDeleteRule = (ruleId: string) => {
        if(window.confirm("Are you sure you want to delete this assignment rule?")) {
            setRules(rules.filter(r => r.id !== ruleId));
        }
    }
    
    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Default Role Assignment</h1>
                <Button onClick={() => handleOpenModal()}>
                    <PlusIcon /> Add Rule
                </Button>
            </div>
            <Card className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-gray-700/50 text-xs text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                        <tr>
                            <th className="p-3">Job Title</th>
                            <th className="p-3">Company</th>
                            <th className="p-3">Function</th>
                            <th className="p-3">Operation</th>
                            <th className="p-3">Ship</th>
                            <th className="p-3">Department</th>
                            <th className="p-3">Assigned Roles</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                        {rules.map(rule => {
                            const assignedRoles = rule.roleIds
                                .map(roleId => roles.find(r => r.id === roleId))
                                .filter((r): r is Role => !!r);
                            return (
                                <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-3 font-medium text-slate-900 dark:text-white">{rule.jobTitle}</td>
                                    <td className="p-3 text-slate-500 dark:text-gray-400">{rule.company || 'Any'}</td>
                                    <td className="p-3 text-slate-500 dark:text-gray-400">{rule.function || 'Any'}</td>
                                    <td className="p-3 text-slate-500 dark:text-gray-400">{rule.operation || 'Any'}</td>
                                    <td className="p-3 text-slate-500 dark:text-gray-400">{rule.ship || 'Any'}</td>
                                    <td className="p-3 text-slate-500 dark:text-gray-400">{rule.department || 'Any'}</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-1">
                                            {assignedRoles.map(role => (
                                                <span key={role.id} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 rounded-full whitespace-nowrap">
                                                    {role.name}
                                                </span>
                                            ))}
                                            {assignedRoles.length === 0 && <span className="text-slate-400 dark:text-gray-500">No roles</span>}
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenModal(rule)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"><EditIcon /></button>
                                            <button onClick={() => handleDeleteRule(rule.id)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
            {isModalOpen && <DefaultAssignmentEditorModal rule={editingRule} roles={roles} onSave={handleSaveRule} onClose={handleCloseModal} />}
        </div>
    );
};

const UserRoleManager: React.FC<{ users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>, roles: Role[] }> = ({ users, setUsers, roles }) => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const user = useMemo(() => users.find(u => u.id === userId), [users, userId]);
    
    const [addingExceptionForUser, setAddingExceptionForUser] = useState<User | null>(null);

    const handleOpenAddModal = () => {
        if (user) {
            setAddingExceptionForUser(user);
        }
    };
    const handleCloseAddModal = () => setAddingExceptionForUser(null);

    const handleAddException = (userId: string, roleId: string, reason: string, startDate: string, endDate: string) => {
        setUsers(currentUsers => currentUsers.map(u => {
            if (u.id === userId) {
                const newRole: UserRole = { 
                    roleId, 
                    reason, 
                    startDate, 
                    endDate, 
                    assignedBy: 'Admin', 
                    assignedOn: new Date().toISOString().split('T')[0] 
                };
                return { ...u, roles: [...u.roles, newRole] }
            }
            return u;
        }));
        handleCloseAddModal();
    };

    const handleRemoveRole = (userId: string, roleId: string, assignedOn: string) => {
        if (!window.confirm("Are you sure you want to remove this role assignment? This action will be logged.")) return;
        setUsers(currentUsers => currentUsers.map(u => {
            if (u.id === userId) {
                return {
                    ...u,
                    roles: u.roles.map(r => {
                        if (r.roleId === roleId && r.assignedOn === assignedOn) {
                            return { ...r, removedOn: new Date().toISOString().split('T')[0] };
                        }
                        return r;
                    })
                }
            }
            return u;
        }));
    };
    
    if (!user) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-red-500 dark:text-red-400">User not found</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-2">The user ID specified in the URL does not exist.</p>
                <Link to="/exceptions" className="mt-4 inline-block">
                    <Button variant="secondary">Back to Exception Handling</Button>
                </Link>
            </div>
        );
    }
    
    return (
         <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <div>
                     <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Roles for {user.name}</h1>
                     <p className="text-slate-500 dark:text-gray-400">{user.jobTitle} - {user.department}</p>
                </div>
                <div className="flex gap-2">
                     <Button onClick={handleOpenAddModal} variant="primary">
                        <PlusIcon className="w-4 h-4" /> Add Exception
                    </Button>
                     <Button onClick={() => navigate('/exceptions')} variant="secondary">
                        Back to List
                    </Button>
                </div>
            </div>
            <Card>
                <h4 className="text-lg font-semibold text-slate-700 dark:text-gray-200 uppercase mb-4 border-b border-slate-200 dark:border-gray-700 pb-2">Assigned Roles</h4>
                <ul className="text-sm space-y-3 p-1">
                    {user.roles.length > 0 ? [...user.roles].sort((a, b) => {
                        const statusA = getRoleStatus(a);
                        const statusB = getRoleStatus(b);
                        if (statusA === 'Active' && statusB !== 'Active') return -1;
                        if (statusA !== 'Active' && statusB === 'Active') return 1;
                        return new Date(b.assignedOn).getTime() - new Date(a.assignedOn).getTime();
                    }).map((r, index) => {
                        const role = roles.find(role => role.id === r.roleId);
                        const status = getRoleStatus(r);
                        return (
                            <li key={`${r.roleId}-${r.assignedOn}-${index}`} className="p-4 bg-slate-50 dark:bg-gray-900/50 rounded-md border border-slate-200 dark:border-gray-700/50 flex flex-col md:flex-row justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-xl text-blue-600 dark:text-blue-400">{role?.name || 'Unknown Role'}</span>
                                        <StatusBadge status={status}/>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-gray-400 mt-2 space-y-1">
                                        {r.reason && <div className="flex gap-2 items-center"><strong>Reason:</strong> <span className="italic text-slate-600 dark:text-gray-300">"{r.reason}"</span></div>}
                                        <div className="flex gap-2 items-center"><strong>Assigned:</strong> {r.assignedOn} by {r.assignedBy}</div>
                                        {r.startDate && r.endDate && <div className="flex gap-2 items-center"><strong>Valid:</strong> {r.startDate} to {r.endDate}</div>}
                                        {r.removedOn && <div className="flex gap-2 items-center"><strong>Removed:</strong> {r.removedOn}</div>}
                                    </div>
                                </div>
                                {status === 'Active' && (
                                    <div className="mt-3 md:mt-0 md:ml-4 flex-shrink-0">
                                        <Button onClick={() => handleRemoveRole(user.id, r.roleId, r.assignedOn)} variant="danger" className="!py-1 !px-3 text-xs">
                                            <MinusCircleIcon className="w-4 h-4" /> Remove Role
                                        </Button>
                                    </div>
                                )}
                            </li>
                        );
                    }) : <p className="text-slate-400 dark:text-gray-500 text-center py-4">No roles assigned to this user.</p>}
                </ul>
            </Card>
             {addingExceptionForUser && <ExceptionModal user={addingExceptionForUser} roles={roles} onAdd={handleAddException} onClose={handleCloseAddModal} />}
         </div>
    );
};

const ExceptionHandling: React.FC<{ users: User[], roles: Role[] }> = ({ users, roles }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => 
        users.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.id.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [users, searchTerm]
    );

    return (
        <div className="animate-fade-in">
             <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Exception Role Assignment</h1>
            <Card>
                <div className="mb-4">
                     <input
                        type="text"
                        placeholder="Search for user by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-gray-700/50 text-xs text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                            <tr>
                                <th className="p-3">User</th>
                                <th className="p-3">Job Title</th>
                                <th className="p-3">Department</th>
                                <th className="p-3 text-center">Active Exceptions</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                            {filteredUsers.map(user => {
                                const activeExceptionsCount = user.roles.filter(r => r.assignedBy !== 'Auto' && getRoleStatus(r) === 'Active').length;
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="p-3 font-medium text-slate-900 dark:text-white">{user.name} <span className="text-slate-400 dark:text-gray-500">({user.id})</span></td>
                                        <td className="p-3 text-slate-500 dark:text-gray-400">{user.jobTitle}</td>
                                        <td className="p-3 text-slate-500 dark:text-gray-400">{user.department}</td>
                                        <td className="p-3 text-center font-medium">
                                            {activeExceptionsCount > 0 ? 
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 rounded-md text-xs">{activeExceptionsCount}</span> : 
                                                <span className="text-slate-400 dark:text-gray-500">0</span>
                                            }
                                        </td>
                                        <td className="p-3 text-right">
                                            <Link to={`/exceptions/${user.id}`}>
                                                <Button variant="secondary" className="!py-1.5 text-sm">
                                                    Manage Roles
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const ExceptionModal: React.FC<{user: User, roles: Role[], onAdd: (userId: string, roleId: string, reason: string, startDate: string, endDate: string) => void, onClose: () => void}> = ({ user, roles, onAdd, onClose}) => {
    const [roleId, setRoleId] = useState('');
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const availableRoles = roles.filter(r => !user.roles.some(ur => ur.roleId === r.id && getRoleStatus(ur) === 'Active'));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleId || !reason || !startDate || !endDate) {
            alert("Please fill all fields.");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert("Start date cannot be after end date.");
            return;
        }
        onAdd(user.id, roleId, reason, startDate, endDate);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Add Exception for ${user.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Role to Assign</label>
                    <select id="role" value={roleId} onChange={e => setRoleId(e.target.value)} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                        <option value="" disabled>Select a role</option>
                        {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                 <div>
                     <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-gray-300">JIRA Ticket / Reason</label>
                    <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={3} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">This will be logged for audit reporting.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Start Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-gray-300">End Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Assign Role</Button>
                </div>
            </form>
        </Modal>
    );
};

type AuditRecord = UserRole & {
    userName: string;
    userId: string;
    roleName: string;
    assignmentType: 'Default' | 'Exception';
    status: Status;
};

const AuditReport: React.FC<{ users: User[]; roles: Role[] }> = ({ users, roles }) => {
    const [filters, setFilters] = useState({
        userSearch: '',
        startDate: '',
        endDate: '',
        assignmentType: 'All',
        roleId: 'All'
    });
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const resetFilters = () => {
        setFilters({
            userSearch: '',
            startDate: '',
            endDate: '',
            assignmentType: 'All',
            roleId: 'All'
        });
    }

    const filteredAuditRecords = useMemo((): AuditRecord[] => {
        let records: AuditRecord[] = [];
        users.forEach(user => {
            user.roles.forEach(userRole => {
                const role = roles.find(r => r.id === userRole.roleId);
                records.push({
                    ...userRole,
                    userId: user.id,
                    userName: user.name,
                    roleName: role?.name || 'Unknown Role',
                    assignmentType: userRole.assignedBy === 'Auto' ? 'Default' : 'Exception',
                    status: getRoleStatus(userRole),
                });
            });
        });
        
        return records.filter(record => {
            const userMatch = filters.userSearch ? 
                record.userName.toLowerCase().includes(filters.userSearch.toLowerCase()) || 
                record.userId.toLowerCase().includes(filters.userSearch.toLowerCase()) 
                : true;
            
            const startDateMatch = filters.startDate ? new Date(record.assignedOn) >= new Date(filters.startDate) : true;
            const endDateMatch = filters.endDate ? new Date(record.assignedOn) <= new Date(filters.endDate) : true;
            
            const typeMatch = filters.assignmentType === 'All' ? true : record.assignmentType === filters.assignmentType;
            const roleMatch = filters.roleId === 'All' ? true : record.roleId === filters.roleId;

            return userMatch && startDateMatch && endDateMatch && typeMatch && roleMatch;
        }).sort((a,b) => new Date(b.assignedOn).getTime() - new Date(a.assignedOn).getTime());

    }, [users, roles, filters]);
    
    const getExportData = () => {
        return filteredAuditRecords.map(r => ({
            "User ID": r.userId,
            "User Name": r.userName,
            "Role Name": r.roleName,
            "Assignment Type": r.assignmentType,
            "Assigned By": r.assignedBy,
            "Assigned On": r.assignedOn,
            "Start Date": r.startDate || 'N/A',
            "End Date": r.endDate || 'N/A',
            "Reason": r.reason || 'N/A',
            "Status": r.status,
            "Removed On": r.removedOn || 'N/A',
        }));
    };

    const handleExportCSV = (e: React.MouseEvent) => {
        e.preventDefault();
        if (filteredAuditRecords.length === 0) return;
        
        const data = getExportData();
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${(row[header as keyof typeof row] ?? '').toString().replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute("download", `audit-report-${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsExportMenuOpen(false);
    };
    
    const handleExportXLSX = (e: React.MouseEvent) => {
        e.preventDefault();
        if (filteredAuditRecords.length === 0) return;
        
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Report");
        
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `audit-report-${date}.xlsx`);
        setIsExportMenuOpen(false);
    };

    const handleExportPDF = (e: React.MouseEvent) => {
        e.preventDefault();
        if (filteredAuditRecords.length === 0) return;
        
        const doc = new jsPDF({ orientation: 'landscape' });
        const tableColumn = [ "User", "Role", "Type", "Assigned By", "Assigned On", "Status", "Reason"];
        const tableRows: (string | null | undefined)[][] = [];

        filteredAuditRecords.forEach(record => {
            const recordData = [
                `${record.userName} (${record.userId})`,
                record.roleName,
                record.assignmentType,
                record.assignedBy,
                record.assignedOn,
                record.status,
                record.reason || 'N/A'
            ];
            tableRows.push(recordData);
        });
        
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20
        });
        doc.text("Audit Report", 14, 15);
        const date = new Date().toISOString().split('T')[0];
        doc.save(`audit-report-${date}.pdf`);
        setIsExportMenuOpen(false);
    };


    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Audit Report</h1>
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="userSearch" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">User Name/ID</label>
                        <input type="text" name="userSearch" id="userSearch" value={filters.userSearch} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500" placeholder="Search user..." />
                    </div>
                    <div>
                        <label htmlFor="assignmentType" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Assignment Type</label>
                        <select name="assignmentType" id="assignmentType" value={filters.assignmentType} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500">
                            <option value="All">All Types</option>
                            <option value="Default">Default</option>
                            <option value="Exception">Exception</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="roleId" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Role</label>
                        <select name="roleId" id="roleId" value={filters.roleId} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500">
                            <option value="All">All Roles</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 items-end">
                       <Button onClick={resetFilters} variant="secondary" className="w-full">Reset</Button>
                       <div className="relative">
                            <Button onClick={() => setIsExportMenuOpen(prev => !prev)} disabled={filteredAuditRecords.length === 0} className="w-full">
                                <ExportIcon/> Export
                            </Button>
                            {isExportMenuOpen && (
                                <div className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                                    <ul className="py-1">
                                        <li><button onClick={handleExportCSV} className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-600">as CSV</button></li>
                                        <li><button onClick={handleExportXLSX} className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-600">as XLSX</button></li>
                                        <li><button onClick={handleExportPDF} className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-600">as PDF</button></li>
                                    </ul>
                                </div>
                            )}
                       </div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                     <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Assigned After</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Assigned Before</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500" />
                    </div>
                 </div>
            </Card>

            <Card className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-gray-700/50 text-xs text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                        <tr>
                            <th className="p-3">User</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Assigned By</th>
                            <th className="p-3">Assigned On</th>
                            <th className="p-3">Validity Period</th>
                            <th className="p-3">Reason</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                        {filteredAuditRecords.length > 0 ? filteredAuditRecords.map((record, index) => (
                             <tr key={`${record.userId}-${record.roleId}-${record.assignedOn}-${index}`} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-3 font-medium text-slate-900 dark:text-white">{record.userName} <span className="text-slate-400 dark:text-gray-500">({record.userId})</span></td>
                                <td className="p-3 text-blue-600 dark:text-blue-400">{record.roleName}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${record.assignmentType === 'Default' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'}`}>
                                        {record.assignmentType}
                                    </span>
                                </td>
                                <td className="p-3 text-slate-500 dark:text-gray-400">{record.assignedBy}</td>
                                <td className="p-3 text-slate-500 dark:text-gray-400">{record.assignedOn}</td>
                                <td className="p-3 text-slate-500 dark:text-gray-400">{record.startDate && record.endDate ? `${record.startDate} to ${record.endDate}` : 'N/A'}</td>
                                <td className="p-3 text-slate-500 dark:text-gray-400 italic">{record.reason || 'N/A'}</td>
                                <td className="p-3"><StatusBadge status={record.status} /></td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className="text-center p-6 text-slate-500 dark:text-gray-500">No audit records found for the selected criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

// -- Main App Component -- //
const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, children: React.ReactNode }> = ({ to, icon, children }) => {
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
}

const AppContent = () => {
    const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [defaultAssignments, setDefaultAssignments] = useState<DefaultAssignmentRule[]>(MOCK_DEFAULT_ASSIGNMENTS);
  
    return (
      <HashRouter>
          <div className="flex h-screen bg-slate-100 dark:bg-gray-900 text-slate-800 dark:text-white">
              <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 p-4 flex flex-col justify-between border-r border-slate-200 dark:border-gray-700">
                  <div>
                      <div className="flex items-center gap-3 px-3 mb-6">
                           <HomeIconFilled/>
                          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Auth Portal</h1>
                      </div>
                      <nav className="space-y-2">
                          <SidebarLink to="/" icon={<HomeIcon/>}>Dashboard</SidebarLink>
                          <SidebarLink to="/roles" icon={<RoleIcon/>}>Role Management</SidebarLink>
                          <SidebarLink to="/assignments" icon={<RuleIcon/>}>Default Assignments</SidebarLink>
                          <SidebarLink to="/exceptions" icon={<ExceptionIcon/>}>Exception Handling</SidebarLink>
                          <SidebarLink to="/audit" icon={<AuditIcon/>}>Audit Report</SidebarLink>
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
            <AppContent />
        </ThemeProvider>
    );
}
