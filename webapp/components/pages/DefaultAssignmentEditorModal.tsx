import React, { useState } from 'react';
import { Modal, Button } from '../shared';
import { ATTRIBUTE_VALUES } from '../../../constants';
import type { DefaultAssignmentRule, Role, Attribute } from '../../../types';

interface DefaultAssignmentEditorModalProps {
  rule: DefaultAssignmentRule | null;
  roles: Role[];
  onSave: (rule: DefaultAssignmentRule) => void;
  onClose: () => void;
}

export const DefaultAssignmentEditorModal: React.FC<DefaultAssignmentEditorModalProps> = ({ 
  rule, 
  roles, 
  onSave, 
  onClose 
}) => {
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
