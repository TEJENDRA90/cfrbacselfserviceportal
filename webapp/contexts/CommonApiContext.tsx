import React, { createContext, useContext, ReactNode } from 'react';
import apiService from '../lib/service';

// Define the shape of our Common API context
interface CommonApiContextType {
  // VPP Filter API
  vpp2Filter: () => Promise<any>;
  // Company ID List API
  getCompanyIdList: () => Promise<any>;
  // VPP Get Job Title API
  getJobTitle: () => Promise<any>;
  // VPP Day Type Access API
  getDayTypeAccess: () => Promise<any>;
}

// Create the context
const CommonApiContext = createContext<CommonApiContextType | undefined>(undefined);

// Custom hook to use the Common API context
export const useCommonApi = () => {
  const context = useContext(CommonApiContext);
  if (context === undefined) {
    throw new Error('useCommonApi must be used within a CommonApiProvider');
  }
  return context;
};

// Common API Provider component
interface CommonApiProviderProps {
  children: ReactNode;
}

export const CommonApiProvider: React.FC<CommonApiProviderProps> = ({ children }) => {
  // VPP Filter API function with hardcoded values
  const vpp2Filter = async () => {
    try {
      // Hardcoded filter values
      const filter = {
        property: "function",
        function: ["NAU1"],
        operation: [],
        ship: [],
        department: [],
        puserId: "P000058"
      };
      
      const response = await apiService.post('/vpp/vpp2Filter', filter);
      return response.data;
    } catch (error) {
      console.error('Error calling vpp2Filter:', error);
      throw error;
    }
  };

  // Company ID List API function
  const getCompanyIdList = async () => {
    try {
      const response = await apiService.get('/companyIdList');
      return response.data.data
      ;
    } catch (error) {
      console.error('Error calling getCompanyIdList:', error);
      throw error;
    }
  };


  // VPP Get Job Title API function
  const getJobTitle = async () => {
    try {
      const response = await apiService.get('/vpp/getJobTitle');
      return response.data.jobTitles;
    } catch (error) {
      console.error('Error calling getJobTitle:', error);
      throw error;
    }
  };

  // VPP Day Type Access API function
  const getDayTypeAccess = async () => {
    try {
      const response = await apiService.get('/vpp/planningValueDropDown?puserId=P000058');
      return response.data.data;
    } catch (error) {
      console.error('Error calling getDayTypeAccess:', error);
      throw error;
    }
  };

  // Context value
  const value: CommonApiContextType = {
    vpp2Filter,
    getCompanyIdList,
    getJobTitle,
    getDayTypeAccess,
  };

  return (
    <CommonApiContext.Provider value={value}>
      {children}
    </CommonApiContext.Provider>
  );
};

export default CommonApiContext;
