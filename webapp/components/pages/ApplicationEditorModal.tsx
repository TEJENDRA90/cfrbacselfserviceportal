import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../shared';
import type { Application } from '../../../types';

interface ApplicationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (application: { appName: string; roleCollectionId: string }) => void;
  application?: Application | null;
}

export const ApplicationEditorModal: React.FC<ApplicationEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  application
}) => {
  const [formData, setFormData] = useState({
    appName: '',
    roleCollectionId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (application) {
      setFormData({
        appName: application.appName || '',
        roleCollectionId: String(application.roleCollectionId || '')
      });
    } else {
      setFormData({
        appName: '',
        roleCollectionId: ''
      });
    }
    setErrors({});
  }, [application, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate Application Name - should not be blank
    if (!formData.appName.trim()) {
      newErrors.appName = 'Application name is required';
    } else if (formData.appName.trim().length < 2) {
      newErrors.appName = 'Application name must be at least 2 characters';
    }

    // Validate Role Collection ID - should be numeric only
    const roleCollectionIdStr = String(formData.roleCollectionId).trim();
    if (!roleCollectionIdStr) {
      newErrors.roleCollectionId = 'Role Collection ID is required';
    } else if (!/^\d+$/.test(roleCollectionIdStr)) {
      newErrors.roleCollectionId = 'Role Collection ID must be a number only';
    } else if (parseInt(roleCollectionIdStr) <= 0) {
      newErrors.roleCollectionId = 'Role Collection ID must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation for Role Collection ID
    if (field === 'roleCollectionId' && value && !/^\d+$/.test(String(value))) {
      setErrors(prev => ({ ...prev, [field]: 'Only numbers are allowed' }));
    }
  };

  const isEditMode = !!application;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Application' : 'Create New Application'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mandatory Fields Section */}
        <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Mandatory Fields</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                Application Name
              </label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => handleInputChange('appName', e.target.value)}
                placeholder="Enter application name"
                className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-50"
              />
              {errors.appName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.appName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                Role Collection ID
              </label>
              <input
                type="text"
                value={formData.roleCollectionId}
                onChange={(e) => handleInputChange('roleCollectionId', e.target.value)}
                onKeyPress={(e) => {
                  // Only allow numeric input
                  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                    e.preventDefault();
                  }
                }}
                placeholder="Enter numeric ID only"
                className="mt-1 block w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.roleCollectionId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.roleCollectionId}</p>
              )}
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            {isEditMode ? 'Update Application' : 'Save Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
