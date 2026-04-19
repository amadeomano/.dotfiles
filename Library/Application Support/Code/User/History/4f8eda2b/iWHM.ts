import { EmployeeDetailsPanelContext } from './EmployeeDetailsPanelContext';

export const useEmployeeDetailsPanelContex = () => {
  const context = useContext(EmployeeListNavigatorContext);
  if (!context)
    throw new Error(
      'useEmployeeListNavigatorContext must be used within a EmployeeListNavigatorContextProvider',
    );
  return context;
};
