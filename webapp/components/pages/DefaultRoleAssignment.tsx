import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, EditIcon, TrashIcon, PlusIcon, ConfirmationDialog } from '../shared';
import { DefaultAssignmentEditorModal } from './DefaultAssignmentEditorModal';
import type { DefaultAssignmentRule, Role } from '../../../types';
import apiService from '../../lib/service';

interface DefaultRoleAssignmentProps {
  rules: DefaultAssignmentRule[];
  setRules: React.Dispatch<React.SetStateAction<DefaultAssignmentRule[]>>;
  roles: Role[];
}

export const DefaultRoleAssignment: React.FC<DefaultRoleAssignmentProps> = ({ 
  rules, 
  setRules, 
  roles 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DefaultAssignmentRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingRule, setDeletingRule] = useState<DefaultAssignmentRule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch default assignment rules from API
  const fetchDefaultAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching default assignments from API...');
      const response = await apiService.get('/rbac/defaultassignment');
      console.log('Default assignments API response:', response);
      
      if (response.data.data) {
        // Transform API response to match our component's expected format
        const transformedRules = response.data.data.map((apiRule: any) => ({
          id: apiRule.ruleId,
          jobTitle: apiRule.jobTitle,
          roleIds: apiRule.roles?.map((role: any) => role.roleId) || [],
          company: apiRule.company,
          function: apiRule.function,
          operation: apiRule.operation,
          ship: apiRule.ship,
          department: apiRule.department
        }));
        setRules(transformedRules);
      }
    } catch (err) {
      console.error('Error fetching default assignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch default assignments');
    } finally {
      setLoading(false);
    }
  };

  // Load default assignments on component mount
  useEffect(() => {
    fetchDefaultAssignments();
  }, []);

  // Filter rules based on search term
  const filteredRules = useMemo(() => 
    rules.filter(rule => {
      if (!rule) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        (rule.jobTitle?.toLowerCase() || '').includes(searchLower) ||
        (rule.company?.toLowerCase() || '').includes(searchLower) ||
        (rule.function?.toLowerCase() || '').includes(searchLower) ||
        (rule.operation?.toLowerCase() || '').includes(searchLower) ||
        (rule.ship?.toLowerCase() || '').includes(searchLower) ||
        (rule.department?.toLowerCase() || '').includes(searchLower)
      );
    }),
    [rules, searchTerm]
  );

  const handleOpenModal = (rule?: DefaultAssignmentRule) => {
    setEditingRule(rule || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const handleSaveRule = async (rule: DefaultAssignmentRule) => {
    try {
      setLoading(true);
      setError(null);

      if (editingRule) {
        // Update existing rule via API
        const payload = {
          ruleId: rule.id,
          jobTitle: rule.jobTitle,
          company: rule.company,
          function: rule.function,
          operation: rule.operation,
          ship: rule.ship,
          department: rule.department,
          roles: rule.roleIds.map(roleId => ({ roleId }))
        };
        console.log('Updating default assignment rule with payload:', payload);
        
        const response = await apiService.put('/rbac/defaultassignment', payload);
        console.log('Update default assignment rule response:', response);
        
        // Update the rule in local state
        setRules(rules.map(r => r.id === rule.id ? rule : r));
      } else {
        // Create new rule via API
        const payload = {
          jobTitle: rule.jobTitle,
          company: rule.company,
          function: rule.function,
          operation: rule.operation,
          ship: rule.ship,
          department: rule.department,
          roles: rule.roleIds.map(roleId => ({ roleId }))
        };
        console.log('Creating default assignment rule with payload:', payload);
        
        const response = await apiService.post('/rbac/defaultassignment', payload);
        console.log('Create default assignment rule response:', response);
        
        // Add the new rule to local state
        setRules([...rules, rule]);
      }
      
      handleCloseModal();
    } catch (err) {
      console.error('Error saving default assignment rule:', err);
      setError(err instanceof Error ? err.message : 'Failed to save default assignment rule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = (rule: DefaultAssignmentRule) => {
    setDeletingRule(rule);
  };

  const confirmDeleteRule = async () => {
    if (!deletingRule) return;

    try {
      setIsDeleting(true);
      setError(null);
      
      console.log('Deleting default assignment rule with ID:', deletingRule.id);
      const response = await apiService.del(`/rbac/defaultassignment?ruleId=${deletingRule.id}`);
      console.log('Delete default assignment rule response:', response);
      
      // Remove the rule from local state after successful deletion
      setRules(rules.filter(r => r.id !== deletingRule.id));
      
      // Close the dialog
      setDeletingRule(null);
      
    } catch (err) {
      console.error('Error deleting default assignment rule:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete default assignment rule');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteRule = () => {
    setDeletingRule(null);
    setError(null);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Default Role Assignment</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusIcon /> Add Rule
        </Button>
      </div>
      <Card>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by job title, company, function, operation, ship, or department..."
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
              Loading default assignments...
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
                    Error loading default assignments
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={fetchDefaultAssignments}
                      className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Try Again
                    </button>
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
            {filteredRules.map(rule => {
              const assignedRoles = rule.roleIds
                .map(roleId => roles.find(r => r.id === roleId || r.roleId === roleId))
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
                        <span key={role.id || role.roleId} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 rounded-full whitespace-nowrap">
                          {role.name || 'Unknown Role'}
                        </span>
                      ))}
                      {assignedRoles.length === 0 && <span className="text-slate-400 dark:text-gray-500">No roles</span>}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(rule)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"><EditIcon /></button>
                      <button onClick={() => handleDeleteRule(rule)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
          </div>
        )}

        {!loading && !error && filteredRules.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 dark:text-gray-500">
              {searchTerm ? 'No default assignment rules found matching your search.' : 'No default assignment rules available.'}
            </p>
          </div>
        )}
      </Card>
      
      {isModalOpen && <DefaultAssignmentEditorModal rule={editingRule} roles={roles} onSave={handleSaveRule} onClose={handleCloseModal} />}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingRule}
        onClose={cancelDeleteRule}
        onConfirm={confirmDeleteRule}
        title="Delete Default Assignment Rule"
        message={`Are you sure you want to delete the default assignment rule for "${deletingRule?.jobTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};
