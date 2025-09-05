import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../shared';
import { RoleIcon, RuleIcon, ExceptionIcon } from '../shared';
import type { Role, User, DefaultAssignmentRule, UserRole } from '../../../types';

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

interface DashboardProps {
  roles: Role[];
  users: User[];
  defaultAssignments: DefaultAssignmentRule[];
}

export const Dashboard: React.FC<DashboardProps> = ({ roles, users, defaultAssignments }) => {
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
