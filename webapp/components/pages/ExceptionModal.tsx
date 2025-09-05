import React, { useState } from 'react';
import { Modal, Button } from '../shared';
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

interface ExceptionModalProps {
  user: User;
  roles: Role[];
  onAdd: (userId: string, roleId: string, reason: string, startDate: string, endDate: string) => void;
  onClose: () => void;
}

export const ExceptionModal: React.FC<ExceptionModalProps> = ({ 
  user, 
  roles, 
  onAdd, 
  onClose
}) => {
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
