import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../shared';
import type { User, Role, UserRole } from '../../../types';

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

interface ExceptionHandlingProps {
  users: User[];
  roles: Role[];
}

export const ExceptionHandling: React.FC<ExceptionHandlingProps> = ({ users, roles }) => {
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
