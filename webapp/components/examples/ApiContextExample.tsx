import React, { useState } from 'react';
import { useCommonApi } from '../../contexts/CommonApiContext';
import { Card, Button } from '../shared';

// Example component showing how to use the CommonApiContext
export const ApiContextExample: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Use the Common API context
  const { vpp2Filter, getCompanyIdList, getJobTitle } = useCommonApi();

  const handleShowContext = () => {
    setMessage('CommonApiContext is available with VPP filter functionality!');
  };

  const handleVppFilter = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Call the function with hardcoded values
      const response = await vpp2Filter();
      setResult(response);
      setMessage('VPP filter call successful!');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCompanyIdList = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Call the company ID list API
      const response = await getCompanyIdList();
      setResult(response);
      setMessage('Company ID List call successful!');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };


  const handleGetJobTitle = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Call the VPP get job title API
      const response = await getJobTitle();
      setResult(response);
      setMessage('VPP Get Job Title call successful!');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Common API Context Example</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Context Usage</h2>
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-gray-300">
              The CommonApiContext includes VPP filter, Company ID List, and VPP Get Job Title functionality.
            </p>
            
            <Button onClick={handleShowContext}>
              Show Context Info
            </Button>
            
            {message && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-blue-800 dark:text-blue-200">{message}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">VPP Filter API</h2>
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-gray-300">
              Test the VPP filter API call with hardcoded data.
            </p>
            
            <Button onClick={handleVppFilter} disabled={loading}>
              {loading ? 'Calling API...' : 'Call VPP Filter'}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Company ID List API</h2>
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-gray-300">
              Test the Company ID List API call.
            </p>
            
            <Button onClick={handleGetCompanyIdList} disabled={loading}>
              {loading ? 'Calling API...' : 'Get Company ID List'}
            </Button>
          </div>
        </Card>


        <Card>
          <h2 className="text-lg font-semibold mb-4">VPP Get Job Title API</h2>
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-gray-300">
              Test the VPP Get Job Title API call.
            </p>
            
            <Button onClick={handleGetJobTitle} disabled={loading}>
              {loading ? 'Calling API...' : 'Get Job Title'}
            </Button>
          </div>
        </Card>
      </div>
      
      {result && (
        <div className="mt-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">API Response:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
};