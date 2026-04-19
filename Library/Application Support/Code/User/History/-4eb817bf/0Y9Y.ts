import {
  type PersonColumnData,
  usePersonColumnData,
} from './usePersonColumnData';

// TODO: import type directly from the data module once [PAYME-331] is done
export type Employee = {
  employeeId: number;
  status: 'NEW' | 'ACTIVE' | 'EXCLUDED' | 'LEAVING' | 'INACTIVE';
  payGroupId: string;
  paygroupName: string;
  lastPayDate: string;
  nextPayDate: string;
} & { person?: PersonColumnData };

// TODO: remove once the data is fetched from the API
export const people: Employee[] = [
  {
    employeeId: 115490,
    status: 'NEW',
    paygroupName: 'Group 1',
    payGroupId: '1',
    lastPayDate: '2022-01-01',
    nextPayDate: '2022-02-01',
  },
  {
    employeeId: 115497,
    status: 'NEW',
    paygroupName: 'Group 1',
    payGroupId: '1',
    lastPayDate: '2022-01-01',
    nextPayDate: '2022-02-01',
  },
  {
    employeeId: 115520,
    status: 'NEW',
    paygroupName: 'Group 1',
    payGroupId: '1',
    lastPayDate: '2022-01-01',
    nextPayDate: '2022-02-01',
  },
];

export const usePeopleData = () => {
  // TODO: fetch data from the API
  const data = people;

  const ids = data?.map(({ employeeId }) => employeeId.toString()) ?? [];
  const { persons, loading } = usePersonColumnData(ids);

  // TODO: update to loading state of the API
  const isLoading = loading || !data;

  if (isLoading) return { people: [], isLoading };

  const augmentedData = data.map((employee) => ({
    ...employee,
    person: persons.find((p) => p.id === employee.employeeId.toString()),
  }));

  return {
    people,
    isLoading,
  };
};
