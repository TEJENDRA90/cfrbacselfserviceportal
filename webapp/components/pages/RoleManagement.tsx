import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, EditIcon, TrashIcon, PlusIcon, ExportIcon, ConfirmationDialog } from '../shared';
import { ATTRIBUTES } from '../../../constants';
import * as XLSX from 'xlsx';
import type { Role } from '../../../types';
import apiService from '../../lib/service';

interface RoleManagementProps {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ roles, setRoles }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching roles from API...');
      const response = await apiService.get('/rbac/roles');
      console.log('Roles API response:', response);
      
      if (response.data.data) {
        setRoles(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  // Load roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Filter roles based on search term
  const filteredRoles = useMemo(() => 
    roles.filter(role => {
      if (!role) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        (role.name?.toLowerCase() || '').includes(searchLower) ||
        (role.description?.toLowerCase() || '').includes(searchLower) ||
        (role.functionalityAccess?.toLowerCase() || '').includes(searchLower)
      );
    }),
    [roles, searchTerm]
  );

  const handleDeleteRole = (role: Role) => {
    setDeletingRole(role);
  };

  const confirmDeleteRole = async () => {
    if (!deletingRole) return;

    try {
      setIsDeleting(true);
      setError(null);
      
      const roleId = deletingRole.roleId || deletingRole.id;
      console.log('Deleting role with ID:', roleId);
      const response = await apiService.del(`/rbac/roles?roleId=${roleId}`);
      console.log('Delete role response:', response);
      
      // Remove the role from local state after successful deletion
      setRoles(prevRoles => prevRoles.filter(r => (r.roleId || r.id) !== roleId));
      
      // Close the dialog
      setDeletingRole(null);
      
    } catch (err) {
      console.error('Error deleting role:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteRole = () => {
    setDeletingRole(null);
    setError(null);
  };

  const handleExportXLSX = () => {
    if (filteredRoles.length === 0) {
      alert("There are no roles to export.");
      return;
    }

    const dataToExport = filteredRoles.map(role => {
      const permissionsData: Record<string, string> = {};
      
      // Handle the new permissions structure
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(permission => {
          const attribute = permission.attribute || 'Unknown';
          const values = permission.value || permission.values || [];
          permissionsData[`Permission: ${attribute}`] = Array.isArray(values) && values.length > 0 ? values.join(', ') : 'Not Set';
        });
      }

      // Handle app access structure
      const appAccessText = role.appAccess?.map(app => {
        const readWrite = [];
        if (app.CAN_READ) readWrite.push('Read');
        if (app.CAN_WRITE) readWrite.push('Write');
        return `${app.APP_ID} (${readWrite.join('/')})`;
      }).join('; ') || 'N/A';

      return {
        'Role ID': role.roleId || role.id,
        'Name': role.name,
        'Description': role.description,
        'Application Access': appAccessText,
        'Write Restriction (Days)': role.writeRestrictionDays === null ? 'No Restriction' : (role.writeRestrictionDays ?? 'N/A'),
        'Functionality Access': role.functionalityAccess === 'B' ? 'Both' : 
                              role.functionalityAccess === 'P' ? 'Planning View' : 
                              role.functionalityAccess === 'S' ? 'Scheduling View' : 
                              role.functionalityAccess || 'N/A',
        'Day Type Access': role.dayTypeAccess?.join(', ') || 'N/A',
        'Created By': role.createdBy || 'N/A',
        'Created At': role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A',
        'Modified By': role.modifiedBy || 'N/A',
        'Updated At': role.updatedAt ? new Date(role.updatedAt).toLocaleDateString() : 'N/A',
        ...permissionsData,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Role Definitions");
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `role-definitions-${date}.xlsx`);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Role Management</h1>
        <div className="flex items-center gap-4">
          <Button onClick={handleExportXLSX} variant="secondary" disabled={filteredRoles.length === 0}>
            <ExportIcon /> Export to Excel
          </Button>
          <Link to="/roles/new">
            <Button>
              <PlusIcon /> Create Role
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by role name, description, or functionality..."
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
              Loading roles...
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
                    Error loading roles
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={fetchRoles}
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
              <th className="p-3">Role Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">Functionality</th>
              <th className="p-3">App Access</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {filteredRoles.map(role => {
                  if (!role) return null;
                  
                  // Format functionality access
                  const getFunctionalityText = (access: string) => {
                    switch (access) {
                      case 'B': return 'Both';
                      case 'P': return 'Planning View';
                      case 'S': return 'Scheduling View';
                      default: return access || 'N/A';
                    }
                  };

                  return (
                    <tr key={role.roleId || role.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900 dark:text-white">{role.name || 'N/A'}</td>
                      <td className="p-3 text-slate-500 dark:text-gray-400">{role.description || 'N/A'}</td>
                      <td className="p-3 text-slate-500 dark:text-gray-400">{getFunctionalityText(role.functionalityAccess)}</td>
                      <td className="p-3 text-slate-500 dark:text-gray-400">{role.appAccess?.length || 0} apps</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/roles/${role.roleId || role.id}`} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"><EditIcon /></Link>
                          <button onClick={() => handleDeleteRole(role)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"><TrashIcon /></button>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingRole}
        onClose={cancelDeleteRole}
        onConfirm={confirmDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${deletingRole?.name}"? This action cannot be undone and may affect users with this role.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};
