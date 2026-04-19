import { useContext } from 'react';
import { EmployeeDetailsPanelContext } from './EmployeeDetailsPanelContext';

export const useEmployeeDetailsPanelContex = () => {
  const context = useContext(EmployeeDetailsPanelContext);
  if (!context)
    throw new Error(
      'useEmployeeListNavigatorContext must be used within a EmployeeListNavigatorContextProvider',
    );
  return context;
};
