import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, EditIcon, TrashIcon, PlusIcon, ExportIcon } from '../shared';
import { ATTRIBUTES } from '../../../constants';
import * as XLSX from 'xlsx';
import type { Role } from '../../../types';

interface RoleManagementProps {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ roles, setRoles }) => {
  const handleDeleteRole = (roleId: string) => {
    if(window.confirm("Are you sure you want to delete this role? This might affect default assignments and users with this role.")) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  }

  const handleExportXLSX = () => {
    if (roles.length === 0) {
      alert("There are no roles to export.");
      return;
    }

    const dataToExport = roles.map(role => {
      const permissionsData: Record<string, string> = {};
      ATTRIBUTES.forEach(attr => {
        const permission = role.permissions.find(p => p.attribute === attr);
        permissionsData[`Permission: ${attr}`] = permission && permission.values.length > 0 ? permission.values.join(', ') : 'Not Set';
      });

      return {
        'ID': role.id,
        'Name': role.name,
        'Description': role.description,
        'Application Access': role.appAccess?.map(a => `${a.appName} (${a.actions.join('/')})`).join('; ') || 'N/A',
        'Write Restriction (Days)': role.writeRestrictionDays === null ? 'No Restriction' : (role.writeRestrictionDays ?? 'N/A'),
        'VPP Functionality Access': role.functionalityAccess || 'N/A',
        'Day Type Access': role.dayTypeAccess?.join(', ') || 'N/A',
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
          <Button onClick={handleExportXLSX} variant="secondary" disabled={roles.length === 0}>
            <ExportIcon /> Export to Excel
          </Button>
          <Link to="/roles/new">
            <Button>
              <PlusIcon /> Create Role
            </Button>
          </Link>
        </div>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-gray-700/50 text-xs text-slate-500 dark:text-gray-300 uppercase tracking-wider">
            <tr>
              <th className="p-3">Role Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">App Access</th>
              <th className="p-3">Functionality</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
            {roles.map(role => (
              <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3 font-medium text-slate-900 dark:text-white">{role.name}</td>
                <td className="p-3 text-slate-500 dark:text-gray-400">{role.description}</td>
                <td className="p-3 text-slate-500 dark:text-gray-400">{role.appAccess?.length || 0} apps</td>
                <td className="p-3 text-slate-500 dark:text-gray-400">{role.functionalityAccess || 'N/A'}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/roles/${role.id}`} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"><EditIcon /></Link>
                    <button onClick={() => handleDeleteRole(role.id)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"><TrashIcon /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
