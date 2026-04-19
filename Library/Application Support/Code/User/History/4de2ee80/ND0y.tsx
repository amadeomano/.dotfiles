import {
  useState,
  createContext,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

export type EmployeeDetailsPanelContextData = {
  employeeIds: number[];
  setEmployeeIds: (newIds: SetStateAction<number[]>) => void;
};

export const EmployeeDetailsPanelContext =
  createContext<EmployeeDetailsPanelContextData | null>(null);

export const EmployeeDetailsPanelContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [employeeIds, setEmployeeIds] = useState<number[]>([]);

  return (
    <EmployeeDetailsPanelContext.Provider
      value={{ employeeIds, setEmployeeIds }}
    >
      {children}
    </EmployeeDetailsPanelContext.Provider>
  );
};
