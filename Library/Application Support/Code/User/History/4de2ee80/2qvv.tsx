import {
  useState,
  createContext,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

type EmployeeListNavigatorContextType = {
  employeeIds: number[];
  setEmployeeIds: (newIds: SetStateAction<number[]>) => void;
};
export const EmployeeListNavigatorContext =
  createContext<EmployeeListNavigatorContextType | null>(null);
const EmployeeListNavigatorContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [employeeIds, setEmployeeIds] = useState<number[]>([]);

  return (
    <EmployeeListNavigatorContext.Provider
      value={{ employeeIds, setEmployeeIds }}
    >
      {children}
    </EmployeeListNavigatorContext.Provider>
  );
};
