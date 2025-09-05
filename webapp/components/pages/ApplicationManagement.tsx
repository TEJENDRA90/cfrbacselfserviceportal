import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, EditIcon, TrashIcon, ConfirmationDialog } from '../shared';
import { ApplicationEditorModal } from './ApplicationEditorModal';
import apiService from '../../lib/service';
import type { Application } from '../../../types';

interface ApplicationManagementProps {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
}

export const ApplicationManagement: React.FC<ApplicationManagementProps> = ({ 
  applications, 
  setApplications 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingApplication, setDeletingApplication] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // API call function
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get('/rbac/application');
      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      
      // Handle the response data - adjust based on your API response structure
      let applicationsData = [];
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        applicationsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        applicationsData = response.data;
      } else if (Array.isArray(response)) {
        applicationsData = response;
      } else {
        console.warn('Unexpected response format:', response);
        applicationsData = [];
      }
      
      console.log('Processed applications data:', applicationsData);
      setApplications(applicationsData);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => 
    applications.filter(app => {
      if (!app) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        (app.appName?.toLowerCase() || '').includes(searchLower) ||
        (app.appId?.toString() || '').includes(searchLower) ||
        (app.roleCollectionId?.toString() || '').includes(searchLower) ||
        (app.createdBy?.toLowerCase() || '').includes(searchLower)
      );
    }),
    [applications, searchTerm]
  );

  const handleAddApplication = () => {
    setEditingApplication(null);
    setIsModalOpen(true);
  };

  const handleEditApplication = (application: Application) => {
    setEditingApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingApplication(null);
  };

  const handleSaveApplication = async (applicationData: { appName: string; roleCollectionId: string }) => {
    if (editingApplication) {
      // Edit existing application with PUT call
      try {
        setLoading(true);
        setError(null);
        
        const payload = {
          appId: editingApplication.appId,
          appName: applicationData.appName,
          roleCollectionId: parseInt(applicationData.roleCollectionId)
        };
        
        console.log('Updating application with payload:', payload);
        const response = await apiService.put('/rbac/application', payload);
        console.log('Update application response:', response);
        
        // Refresh the applications list after successful update
        await fetchApplications();
        
      } catch (err) {
        console.error('Error updating application:', err);
        setError(err instanceof Error ? err.message : 'Failed to update application');
      } finally {
        setLoading(false);
      }
    } else {
      // Create new application with POST call
      try {
        setLoading(true);
        setError(null);
        
        const payload = {
          appName: applicationData.appName,
          roleCollectionId: parseInt(applicationData.roleCollectionId)
        };
        
        console.log('Creating application with payload:', payload);
        const response = await apiService.post('/rbac/application', payload);
        console.log('Create application response:', response);
        
        // Refresh the applications list after successful creation
        await fetchApplications();
        
      } catch (err) {
        console.error('Error creating application:', err);
        setError(err instanceof Error ? err.message : 'Failed to create application');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteApplication = (application: Application) => {
    setDeletingApplication(application);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingApplication) return;

    try {
      setIsDeleting(true);
      setError(null);
      
      console.log('Deleting application with ID:', deletingApplication.appId);
      const response = await apiService.del(`/rbac/application?appId=${deletingApplication.appId}`);
      console.log('Delete application response:', response);
      
      // Refresh the applications list after successful deletion
      await fetchApplications();
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setDeletingApplication(null);
      
    } catch (err) {
      console.error('Error deleting application:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingApplication(null);
  };

  const formatDate = (dateString: string) => {
    try {
      // Handle the API date format: "2025-09-03 13:55:26.062000000"
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Application</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-2">Manage applications and their role collections</p>
        </div>
        <Button onClick={handleAddApplication} variant="primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
            <path fillRule="evenodd" d="M12 4.5a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6A.75.75 0 0112 4.5z" clipRule="evenodd" />
          </svg>
          Add Application
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by app name, app ID, or role collection ID..."
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
              Loading applications...
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
                    Error loading applications
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={fetchApplications}
                      className="bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Try again
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
                  <th className="p-3">App ID</th>
                  <th className="p-3">App Name</th>
                  <th className="p-3">Role Collection ID</th>
                  <th className="p-3">Created By</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Modified At</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {filteredApplications.map(application => {
                  if (!application) return null;
                  return (
                    <tr key={application.appId || Math.random()} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900 dark:text-white">
                        {application.appId || 'N/A'}
                      </td>
                      <td className="p-3 text-slate-900 dark:text-white">
                        {application.appName || 'N/A'}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-gray-400">
                        {application.roleCollectionId || 'N/A'}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-gray-400">
                        {application.createdBy || 'N/A'}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-gray-400">
                        {application.createdAt ? formatDate(application.createdAt) : 'N/A'}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-gray-400">
                        {application.modifiedAt ? formatDate(application.modifiedAt) : 'N/A'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditApplication(application)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"><EditIcon /></button>
                          <button onClick={() => handleDeleteApplication(application)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"><TrashIcon /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredApplications.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 dark:text-gray-500">
              {searchTerm ? 'No applications found matching your search.' : 'No applications available.'}
            </p>
          </div>
        )}
      </Card>

      <ApplicationEditorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveApplication}
        application={editingApplication}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Application"
        message={`Are you sure you want to delete the application "${deletingApplication?.appName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};
