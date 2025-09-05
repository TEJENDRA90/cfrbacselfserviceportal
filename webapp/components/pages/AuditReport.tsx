import React, { useState, useMemo } from 'react';
import { Card, Button, StatusBadge, ExportIcon } from '../shared';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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

type AuditRecord = UserRole & {
  userName: string;
  userId: string;
  roleName: string;
  assignmentType: 'Default' | 'Exception';
  status: Status;
};

interface AuditReportProps {
  users: User[];
  roles: Role[];
}

export const AuditReport: React.FC<AuditReportProps> = ({ users, roles }) => {
  const [filters, setFilters] = useState({
    userSearch: '',
    startDate: '',
    endDate: '',
    assignmentType: 'All',
    roleId: 'All'
  });
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const resetFilters = () => {
    setFilters({
      userSearch: '',
      startDate: '',
      endDate: '',
      assignmentType: 'All',
      roleId: 'All'
    });
  }

  const filteredAuditRecords = useMemo((): AuditRecord[] => {
    let records: AuditRecord[] = [];
    users.forEach(user => {
      user.roles.forEach(userRole => {
        const role = roles.find(r => r.id === userRole.roleId);
        records.push({
          ...userRole,
          userId: user.id,
          userName: user.name,
          roleName: role?.name || 'Unknown Role',
          assignmentType: userRole.assignedBy === 'Auto' ? 'Default' : 'Exception',
          status: getRoleStatus(userRole),
        });
      });
    });
    
    return records.filter(record => {
      const userMatch = filters.userSearch ? 
        record.userName.toLowerCase().includes(filters.userSearch.toLowerCase()) || 
        record.userId.toLowerCase().includes(filters.userSearch.toLowerCase()) 
        : true;
      
      const startDateMatch = filters.startDate ? new Date(record.assignedOn) >= new Date(filters.startDate) : true;
      const endDateMatch = filters.endDate ? new Date(record.assignedOn) <= new Date(filters.endDate) : true;
      
      const typeMatch = filters.assignmentType === 'All' ? true : record.assignmentType === filters.assignmentType;
      const roleMatch = filters.roleId === 'All' ? true : record.roleId === filters.roleId;

      return userMatch && startDateMatch && endDateMatch && typeMatch && roleMatch;
    }).sort((a,b) => new Date(b.assignedOn).getTime() - new Date(a.assignedOn).getTime());

  }, [users, roles, filters]);
  
  const getExportData = () => {
    return filteredAuditRecords.map(r => ({
      "User ID": r.userId,
      "User Name": r.userName,
      "Role Name": r.roleName,
      "Assignment Type": r.assignmentType,
      "Assigned By": r.assignedBy,
      "Assigned On": r.assignedOn,
      "Start Date": r.startDate || 'N/A',
      "End Date": r.endDate || 'N/A',
      "Reason": r.reason || 'N/A',
      "Status": r.status,
      "Removed On": r.removedOn || 'N/A',
    }));
  };

  const handleExportCSV = (e: React.MouseEvent) => {
    e.preventDefault();
    if (filteredAuditRecords.length === 0) return;
    
    const data = getExportData();
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${(row[header as keyof typeof row] ?? '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `audit-report-${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };
  
  const handleExportXLSX = (e: React.MouseEvent) => {
    e.preventDefault();
    if (filteredAuditRecords.length === 0) return;
    
    const worksheet = XLSX.utils.json_to_sheet(getExportData());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Report");
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `audit-report-${date}.xlsx`);
    setIsExportMenuOpen(false);
  };

  const handleExportPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    if (filteredAuditRecords.length === 0) return;
    
    const doc = new jsPDF({ orientation: 'landscape' });
    const tableColumn = [ "User", "Role", "Type", "Assigned By", "Assigned On", "Status", "Reason"];
    const tableRows: (string | null | undefined)[][] = [];

    filteredAuditRecords.forEach(record => {
      const recordData = [
        `${record.userName} (${record.userId})`,
        record.roleName,
        record.assignmentType,
        record.assignedBy,
        record.assignedOn,
        record.status,
        record.reason || 'N/A'
      ];
      tableRows.push(recordData);
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20
    });
    doc.text("Audit Report", 14, 15);
    const date = new Date().toISOString().split('T')[0];
    doc.save(`audit-report-${date}.pdf`);
    setIsExportMenuOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Audit Report</h1>
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="userSearch" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">User Name/ID</label>
            <input type="text" name="userSearch" id="userSearch" value={filters.userSearch} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500" placeholder="Search user..." />
          </div>
          <div>
            <label htmlFor="assignmentType" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Assignment Type</label>
            <select name="assignmentType" id="assignmentType" value={filters.assignmentType} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500">
              <option value="All">All Types</option>
              <option value="Default">Default</option>
              <option value="Exception">Exception</option>
            </select>
          </div>
          <div>
            <label htmlFor="roleId" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Role</label>
            <select name="roleId" id="roleId" value={filters.roleId} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500">
              <option value="All">All Roles</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 items-end">
            <Button onClick={resetFilters} variant="secondary" className="w-full">Reset</Button>
            <div className="relative">
              <Button onClick={() => setIsExportMenuOpen(prev => !prev)} disabled={filteredAuditRecords.length === 0} className="w-full">
                <ExportIcon/> Export
              </Button>
              {isExportMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                  <ul className="py-1">
                    <li><button onClick={handleExportCSV} className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-600">as CSV</button></li>
                    <li><button onClick={handleExportXLSX} className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-600">as XLSX</button></li>
                    <li><button onClick={handleExportPDF} className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-600">as PDF</button></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Assigned After</label>
            <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Assigned Before</label>
            <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-gray-700/50 text-xs text-slate-500 dark:text-gray-300 uppercase tracking-wider">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Type</th>
              <th className="p-3">Assigned By</th>
              <th className="p-3">Assigned On</th>
              <th className="p-3">Validity Period</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
            {filteredAuditRecords.length > 0 ? filteredAuditRecords.map((record, index) => (
              <tr key={`${record.userId}-${record.roleId}-${record.assignedOn}-${index}`} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3 font-medium text-slate-900 dark:text-white">{record.userName} <span className="text-slate-400 dark:text-gray-500">({record.userId})</span></td>
                <td className="p-3 text-blue-600 dark:text-blue-400">{record.roleName}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${record.assignmentType === 'Default' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'}`}>
                    {record.assignmentType}
                  </span>
                </td>
                <td className="p-3 text-slate-500 dark:text-gray-400">{record.assignedBy}</td>
                <td className="p-3 text-slate-500 dark:text-gray-400">{record.assignedOn}</td>
                <td className="p-3 text-slate-500 dark:text-gray-400">{record.startDate && record.endDate ? `${record.startDate} to ${record.endDate}` : 'N/A'}</td>
                <td className="p-3 text-slate-500 dark:text-gray-400 italic">{record.reason || 'N/A'}</td>
                <td className="p-3"><StatusBadge status={record.status} /></td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="text-center p-6 text-slate-500 dark:text-gray-500">No audit records found for the selected criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
