import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button } from '../shared';
import { ATTRIBUTES, ATTRIBUTE_VALUES, APP_LIST } from '../../../constants';
import type { Role, Attribute, Action } from '../../../types';
import apiService from '../../lib/service';
import { useCommonApi } from '../../contexts/CommonApiContext';

// Day type options will be fetched from API

interface RoleEditorProps {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

export const RoleEditor: React.FC<RoleEditorProps> = ({ roles, setRoles }) => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const isNewRole = !roleId;
  const { vpp2Filter, getCompanyIdList, getJobTitle, getDayTypeAccess } = useCommonApi();

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
    
    return roles.find(r => (r.roleId || r.id) === roleId);
  }, [roleId, isNewRole, roles]);
  
  const [formData, setFormData] = useState<Role | undefined>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobTitles, setJobTitles] = useState<any[]>([]);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [vppData, setVppData] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [dayTypeOptions, setDayTypeOptions] = useState<any[]>([]);
  
  // VPP Data arrays for dropdowns
  const [departments, setDepartments] = useState<any[]>([]);
  const [functions, setFunctions] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);

  // Transform API role data to form format
  const transformApiRoleToForm = (apiRole: any): Role => {
    // Transform functionality access from API format to form format
    const getFunctionalityText = (access: string) => {
      switch (access) {
        case 'B': return 'Both';
        case 'P': return 'Planning View';
        case 'S': return 'Scheduling View';
        default: return 'Both';
      }
    };

    // Transform permissions from API format to form format
    const transformedPermissions = ATTRIBUTES.map(attr => {
      const apiPermission = apiRole.permissions?.find((p: any) => 
        p.attribute?.toLowerCase() === attr.toLowerCase()
      );
      return {
        attribute: attr,
        values: apiPermission?.value || []
      };
    });

    // Transform app access from API format to form format
    const transformedAppAccess = apiRole.appAccess?.map((app: any) => ({
      appName: app.APP_ID || app.appId,
      actions: [
        ...(app.CAN_READ || app.read ? ['Read'] : []),
        ...(app.CAN_WRITE || app.write ? ['Write'] : [])
      ]
    })) || [];

    return {
      id: apiRole.roleId || apiRole.id || '',
      name: apiRole.name || '',
      description: apiRole.description || '',
      permissions: transformedPermissions,
      writeRestrictionDays: apiRole.writeRestrictionDays,
      functionalityAccess: getFunctionalityText(apiRole.functionalityAccess),
      dayTypeAccess: apiRole.dayTypeAccess || ['All'],
      appAccess: transformedAppAccess
    };
  };

  // Call Common API functions on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setApiLoading(true);
        
        // Call APIs in parallel
        const [jobTitlesResponse, companyListResponse, vppResponse, applicationsResponse, dayTypeResponse] = await Promise.all([
          getJobTitle(),
          getCompanyIdList(),
          vpp2Filter(),
          apiService.get('/rbac/application'),
          getDayTypeAccess()
        ]);

        // Set all the data
        console.log('Job Titles response:', jobTitlesResponse);
        console.log('Company List response:', companyListResponse);
        console.log('VPP Filter response:', vppResponse);
        console.log('Applications response:', applicationsResponse);
        console.log('Day Type Access response:', dayTypeResponse);

        setJobTitles(jobTitlesResponse.data || jobTitlesResponse || []);
        setCompanyList(companyListResponse.data || companyListResponse || []);
        setVppData(vppResponse.data || vppResponse || null);
        setApplications(applicationsResponse.data.data || applicationsResponse.data || []);
        
        // Set day type options from API response
        const dayTypeData = dayTypeResponse.data || dayTypeResponse || [];
        // Add "All" option at the beginning if it doesn't exist
        const allOption = { Code: 'All', LookupName: 'All Day Types' };
        const hasAllOption = dayTypeData.some((opt: any) => opt.Code === 'All');
        const optionsWithAll = hasAllOption ? dayTypeData : [allOption, ...dayTypeData];
        setDayTypeOptions(optionsWithAll);
        
        // Extract VPP data for dropdowns
        if (vppResponse.data || vppResponse) {
          const vppData = vppResponse.data || vppResponse;
          setDepartments(vppData.aDepartment || []);
          setFunctions(vppData.aFunction || []);
          setOperations(vppData.aOperation || []);
          setShips(vppData.aShip || []);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load some data');
      } finally {
        setApiLoading(false);
      }
    };

    fetchAllData();
  }, [getJobTitle, getCompanyIdList, vpp2Filter]);

  // Update form data when initial role changes (for editing different roles)
  React.useEffect(() => {
    if (initialRole) {
      // If it's an API role (has roleId), transform it to form format
      if (initialRole.roleId || (initialRole as any).permissions?.some((p: any) => p.value)) {
        const transformedRole = transformApiRoleToForm(initialRole);
        setFormData(transformedRole);
      } else {
        // If it's already in form format, use as is
        setFormData(initialRole);
      }
    }
  }, [initialRole]);

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

      if (appConfig.actions && appConfig.actions.length > 0) {
        newAppAccess[appIndex] = appConfig;
      } else {
        // No actions left, remove the app from access list
        newAppAccess.splice(appIndex, 1);
      }
    } else if (isChecked) { // App is new to the access list
      newAppAccess.push({ appName, actions: [action] });
    }

    const updatedData: Partial<Role> = { appAccess: newAppAccess };
    if (!newAppAccess.some(a => a.actions?.includes('Write'))) {
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

  // Transform form data to API payload structure
  const transformToApiPayload = (role: Role) => {
    // Transform functionality access to API format
    const getFunctionalityCode = (access: string) => {
      switch (access) {
        case 'Both': return 'B';
        case 'Planning View': return 'P';
        case 'Scheduling View': return 'S';
        default: return 'B';
      }
    };

    // Transform app access to API format
    const transformedAppAccess = role.appAccess?.map(app => ({
      appId: app.appName, // Assuming appName maps to appId
      read: app.actions?.includes('Read') || false,
      write: app.actions?.includes('Write') || false
    })) || [];

    // Transform permissions to API format
    const transformedPermissions = role.permissions
      .filter(p => p.values.length > 0) // Only include permissions with values
      .map(p => ({
        attribute: p.attribute.toLowerCase(), // Convert to lowercase as per API
        value: p.values
      }));

    return {
      name: role.name,
      description: role.description,
      writeRestrictionDays: role.writeRestrictionDays,
      functionalityAccess: getFunctionalityCode(role.functionalityAccess || 'Both'),
      dayTypeAccess: role.dayTypeAccess || [],
      permissions: transformedPermissions,
      appAccess: transformedAppAccess
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Basic validation
    if (!formData.name.trim()) {
      setError('Role name is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isNewRole) {
        // Create new role via API
        const payload = transformToApiPayload(formData);
        console.log('Creating role with payload:', payload);
        
        const response = await apiService.post('/rbac/roles', payload);
        console.log('Create role response:', response);
        
        // Add the new role to local state
        const newRole = { ...formData, id: `role-${Date.now()}` };
        setRoles(prevRoles => [...prevRoles, newRole]);
      } else {
        // Update existing role via API
        const payload = {
          roleId: roleId,
          ...transformToApiPayload(formData)
        };
        console.log('Updating role with payload:', payload);
        
        const response = await apiService.put('/rbac/roles', payload);
        console.log('Update role response:', response);
        
        // Update the role in local state
        setRoles(prevRoles => prevRoles.map(r => (r.roleId || r.id) === roleId ? formData : r));
      }
      
      navigate('/roles');
    } catch (err) {
      console.error('Error saving role:', err);
      setError(err instanceof Error ? err.message : 'Failed to save role');
    } finally {
      setLoading(false);
    }
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

  const hasWriteAccess = formData.appAccess?.some(a => a.actions?.includes('Write')) || false;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{isNewRole ? "Create New Role" : `Edit Role: ${initialRole?.name}`}</h1>
      </div>
      <Card>
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error saving role
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

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
                {applications.map(app => {
                  const currentAccess = formData.appAccess?.find(a => a.appName === app.appName);
                  const canRead = currentAccess?.actions?.includes('Read') ?? false;
                  const canWrite = currentAccess?.actions?.includes('Write') ?? false;
                  return (
                    <div key={app.appId} className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-gray-700/50 last:border-b-0">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-white">{app.appName}</span>
                        <span className="text-xs text-slate-500 dark:text-gray-400">ID: {app.appId}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-gray-300 text-sm">
                          <input type="checkbox" checked={canRead} onChange={e => handleAppAccessChange(app.appName, 'Read', e.target.checked)} className="bg-slate-200 dark:bg-gray-700 border-slate-300 dark:border-gray-600 rounded text-blue-500 focus:ring-blue-500" /> Read
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-gray-300 text-sm">
                          <input type="checkbox" checked={canWrite} onChange={e => handleAppAccessChange(app.appName, 'Write', e.target.checked)} className="bg-slate-200 dark:bg-gray-700 border-slate-300 dark:border-gray-600 rounded text-blue-500 focus:ring-blue-500" /> Write
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
              <select id="dayTypeAccess" multiple value={formData.dayTypeAccess || []} onChange={e => handleDayTypeChange(e.target.selectedOptions)} className="block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-24 text-slate-900 dark:text-white">
                {dayTypeOptions.map(opt => (
                  <option key={opt.Code} value={opt.Code} className={`${opt.Code === 'All' ? 'font-bold text-blue-500 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                    {opt.Code} - {opt.LookupName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Permission Attributes</label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-100 dark:bg-gray-900/50 rounded-md border border-slate-200 dark:border-gray-700">
              {formData.permissions.map(p => {
                // Get VPP data for specific attributes
                const getVppOptions = (attribute: string) => {
                  switch (attribute.toLowerCase()) {
                    case 'company':
                      return companyList.map((company, index) => ({ 
                        value: company.COMPANYID, 
                        label: company.COMPANYDESC 
                      }));
                    case 'department':
                      return departments.map((dept, index) => ({ value: dept.DEPARTMENT_CODE, label: dept.PARAMETER_VALUE }));
                    case 'function':
                      return functions.map((func, index) => ({ value: func.FUNCTION_CODE, label: func.PARAMETER_VALUE }));
                    case 'operation':
                      return operations.map((op, index) => ({ value: op.OPERATION_CODE, label: op.PARAMETER_VALUE }));
                    case 'ship':
                      return ships.map((ship, index) => ({ value: ship.SHIP_CODE, label: ship.PARAMETER_VALUE }));
                    case 'job title':
                      return jobTitles.map((jobTitle, index) => ({ 
                        value: jobTitle.jobCodeId, 
                        label: jobTitle.jobTitleDesc 
                      }));
                    default:
                      return ATTRIBUTE_VALUES[p.attribute as keyof typeof ATTRIBUTE_VALUES]?.map(val => ({ value: val, label: val })) || [];
                  }
                };

                const vppOptions = getVppOptions(p.attribute);
                const hasVppData = vppOptions.length > 0;

                return (
                  <div key={p.attribute}>
                    <label htmlFor={p.attribute} className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1">
                      {p.attribute}
                    </label>
                    <select 
                      id={p.attribute} 
                      multiple 
                      value={p.values}
                      onChange={e => handleMultiSelectChange(p.attribute, Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))}
                      className="block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-24 text-slate-900 dark:text-white"
                      disabled={apiLoading}
                    >
                      <option value="All" className="font-bold text-blue-500 dark:text-blue-300">All</option>
                      <option value="Dynamic" className="font-bold text-green-600 dark:text-green-300">Dynamic</option>
                      {hasVppData ? (
                        vppOptions.map((option, index) => (
                          <option key={index} value={option.value} className="text-slate-900 dark:text-white">
                            {option.label}
                          </option>
                        ))
                      ) : (
                        ATTRIBUTE_VALUES[p.attribute as keyof typeof ATTRIBUTE_VALUES]?.map(val => (
                          <option key={val} value={val} className="text-slate-900 dark:text-white">{val}</option>
                        ))
                      )}
                    </select>
                  </div>
                );
              })}
            </div>
            {apiLoading && (
              <div className="mt-2 flex items-center justify-center py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <svg className="animate-spin h-4 w-4 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-blue-600 dark:text-blue-400 text-sm">Loading VPP data...</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={() => navigate('/roles')} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Role'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
