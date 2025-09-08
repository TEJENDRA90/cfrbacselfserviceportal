import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../shared';
import { ATTRIBUTE_VALUES } from '../../../constants';
import type { DefaultAssignmentRule, Role, Attribute } from '../../../types';
import apiService from '../../lib/service';
import { useCommonApi } from '../../contexts/CommonApiContext';

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
  const { getJobTitle, getCompanyIdList, vpp2Filter } = useCommonApi();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // API data states
  const [jobTitles, setJobTitles] = useState<any[]>([]);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [functions, setFunctions] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  
  const optionalAttributes: Exclude<Attribute, "Job Title">[] = ["Company", "Function", "Operation", "Ship", "Department"];

  // Fetch API data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setApiLoading(true);
        
        // Call APIs in parallel
        const [jobTitlesResponse, companyListResponse, vppResponse] = await Promise.all([
          getJobTitle(),
          getCompanyIdList(),
          vpp2Filter()
        ]);

        // Set all the data
        setJobTitles(jobTitlesResponse.data || jobTitlesResponse || []);
        setCompanyList(companyListResponse.data || companyListResponse || []);
        
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobTitle || !formData.roleIds || formData.roleIds.length === 0) {
      alert("Please select a Job Title and at least one Role.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare payload with the exact structure you specified
      const payload = {
        jobTitle: formData.jobTitle,
        company: formData.company || "",
        function: formData.function || "",
        operation: formData.operation || "",
        ship: formData.ship || "",
        department: formData.department || "",
        roleIds: formData.roleIds
      };
      
      console.log('Creating default assignment rule with payload:', payload);
      
      if (rule) {
        // Update existing rule - PUT call with exact payload structure
        const updatePayload = {
          ruleId: rule.id,
          jobTitle: formData.jobTitle,
          company: formData.company || "",
          function: formData.function || "",
          operation: formData.operation || "",
          ship: formData.ship || "",
          department: formData.department || "",
          roleIds: formData.roleIds
        };
        console.log('Updating default assignment rule with payload:', updatePayload);
        const response = await apiService.put('/rbac/defaultassignment', updatePayload);
        console.log('Update default assignment rule response:', response);
      } else {
        // Create new rule - POST call
        console.log('Creating default assignment rule with payload:', payload);
        const response = await apiService.post('/rbac/defaultassignment', payload);
        console.log('Create default assignment rule response:', response);
      }
      
      // Call the onSave callback to update parent component
      onSave({ ...payload, id: rule?.id || `rule-${Date.now()}` });
      onClose();
      
    } catch (err) {
      console.error('Error saving default assignment rule:', err);
      setError(err instanceof Error ? err.message : 'Failed to save default assignment rule');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRolesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
    setFormData(prev => ({ ...prev, roleIds: selectedOptions }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={rule ? "Edit Default Assignment Rule" : "Create New Rule"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error saving rule
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="p-4 bg-slate-100 dark:bg-gray-900/50 rounded-md border border-slate-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-200 mb-3">Mandatory Fields</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Job Title</label>
              <select id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                <option value="" disabled>Select a Job Title</option>
                {jobTitles.map((jobTitle, index) => (
                  <option key={index} value={jobTitle.jobCodeId}>
                    {jobTitle.jobTitleDesc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="roleIds" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Assigned Roles</label>
              <select id="roleIds" name="roleIds" multiple value={formData.roleIds} onChange={handleRolesChange} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-32" required>
                {roles.map(r => <option key={r.id || r.roleId} value={r.roleId || r.id}>{r.name || 'Unknown Role'}</option>)}
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
              
              // Get API data for specific attributes
              const getApiOptions = (attribute: string) => {
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
                  default:
                    return ATTRIBUTE_VALUES[attr]?.map(val => ({ value: val, label: val })) || [];
                }
              };

              const apiOptions = getApiOptions(attr);
              const hasApiData = apiOptions.length > 0;

              return (
                <div key={attr}>
                  <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-gray-300">{attr}</label>
                  <select id={name} name={name} value={formData[name] || ''} onChange={handleChange} className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Any</option>
                    {hasApiData ? (
                      apiOptions.map((option, index) => (
                        <option key={index} value={option.value} className="text-white dark:text-white">
                          {option.label}
                        </option>
                      ))
                    ) : (
                      ATTRIBUTE_VALUES[attr]?.map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))
                    )}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
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
              'Save Rule'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
