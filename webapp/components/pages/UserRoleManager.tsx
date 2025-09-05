import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, StatusBadge, PlusIcon, MinusCircleIcon } from '../shared';
import { ExceptionModal } from './ExceptionModal';
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

interface UserRoleManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  roles: Role[];
}

export const UserRoleManager: React.FC<UserRoleManagerProps> = ({ 
  users, 
  setUsers, 
  roles 
}) => {
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
