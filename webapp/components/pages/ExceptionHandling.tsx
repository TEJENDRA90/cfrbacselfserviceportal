import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../shared';
import type { User, Role, UserRole } from '../../../types';
import apiService from '../../lib/service';

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
  const [apiUsers, setApiUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET call in useEffect
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/rbac/users');
        console.log('Users API response:', response);
        
        // Handle different possible response structures
        let usersData = [];
        if (response.data && response.data.data) {
          usersData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          usersData = response.data;
        } else if (Array.isArray(response)) {
          usersData = response;
        }
        
        // Transform API response to match our User interface
        const transformedUsers = usersData.map((apiUser: any) => ({
          id: apiUser.userId || apiUser.id,
          name: apiUser.name || 'Unknown',
          jobTitle: apiUser.jobTitle || 'N/A',
          department: apiUser.department || 'N/A',
          roles: [] // Initialize empty roles array for now
        }));
        
        console.log('Processed users data:', transformedUsers);
        setApiUsers(transformedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => 
    apiUsers.filter(u => 
      u && u.name && u.id &&
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       u.id.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [apiUsers, searchTerm]
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

        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading users...
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error loading users
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-gray-700/50 text-xs text-slate-500 dark:text-gray-300 uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Job Title</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-center">Active Exceptions</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {filteredUsers.map(user => {
                if (!user) return null;
                const activeExceptionsCount = (user.roles || []).filter(r => r && r.assignedBy !== 'Auto' && getRoleStatus(r) === 'Active').length;
                return (
                  <tr key={user.id || Math.random()} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-3 text-left font-medium text-slate-900 dark:text-white">{user.name || 'Unknown'}</td>
                    <td className="p-3 text-left text-slate-500 dark:text-gray-400">{user.jobTitle || 'N/A'}</td>
                    <td className="p-3 text-left text-slate-500 dark:text-gray-400">{user.department || 'N/A'}</td>
                    <td className="p-3 text-center font-medium">
                      {activeExceptionsCount > 0 ? 
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 rounded-md text-xs">{activeExceptionsCount}</span> : 
                        <span className="text-slate-400 dark:text-gray-500">0</span>
                      }
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <Link to={`/exceptions/${user.id}`}>
                          <Button variant="secondary" className="!py-1.5 text-sm">
                            Manage Roles
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
};
