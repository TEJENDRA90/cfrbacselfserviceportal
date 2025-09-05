import React, { useState } from 'react';
import { Card, Button, EditIcon, TrashIcon, PlusIcon } from '../shared';
import { DefaultAssignmentEditorModal } from './DefaultAssignmentEditorModal';
import type { DefaultAssignmentRule, Role } from '../../../types';

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
