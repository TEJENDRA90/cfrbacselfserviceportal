import React, { useState } from 'react';
import { Modal, Button } from '../shared';
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

interface ExceptionModalProps {
  user: User;
  roles: Role[];
  onAdd: (userId: string, roleId: string, reason: string, startDate: string, endDate: string) => void;
  onClose: () => void;
  onRefetch: () => Promise<void>;
}

export const ExceptionModal: React.FC<ExceptionModalProps> = ({ 
  user, 
  roles, 
  onAdd, 
  onClose,
  onRefetch
}) => {
  const [roleId, setRoleId] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const availableRoles = roles.filter(r => !user.roles.some(ur => ur.roleId === (r.roleId || r.id) && getRoleStatus(ur) === 'Active'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId || !reason || !startDate || !endDate) {
      alert("Please fill all fields.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Construct payload
      const payload = {
        userId: user.id,
        roleId: roleId,
        reason: reason,
        startDate: startDate,
        endDate: endDate
      };

      console.log('ExceptionModal POST payload:', payload);

      // Make API call
      const response = await apiService.post('/rbac/userRoles', payload);
      console.log('ExceptionModal POST response:', response);

      // Refetch data from API instead of soft add
      await onRefetch();

      // Close the modal after successful API call
      onClose();

    } catch (err) {
      console.error('Error adding user role:', err);
      setError('Failed to assign role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Add Exception for ${user.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Role to Assign</label>
          <select id="role" value={roleId} onChange={e => setRoleId(e.target.value)} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
            <option value="" disabled>Select a role</option>
            {availableRoles.map(r => <option key={r.id || r.roleId} value={r.roleId || r.id}>{r.name || 'Unknown Role'}</option>)}
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
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Assigning...
              </div>
            ) : (
              'Assign Role'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
