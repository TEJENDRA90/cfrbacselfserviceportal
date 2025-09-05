import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button } from '../shared';
import { ATTRIBUTES, ATTRIBUTE_VALUES, APP_LIST } from '../../../constants';
import type { Role, Attribute, Action } from '../../../types';

const DAY_TYPE_OPTIONS = ["All", "W", "W1", "W-am", "W-pm", "WX", "V", "DO", "T", "TH", "X", "F", "NA"];

interface RoleEditorProps {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

export const RoleEditor: React.FC<RoleEditorProps> = ({ roles, setRoles }) => {
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
