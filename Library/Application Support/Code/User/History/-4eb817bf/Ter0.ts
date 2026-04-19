import {
  type PersonColumnData,
  usePersonColumnData,
  getPerson,
} from './usePersonColumnData';

// TODO: import type directly from the data module once [PAYME-331] is done
export type APIEmployee = {
  employeeId: number;
  status: 'NEW' | 'ACTIVE' | 'EXCLUDED' | 'LEAVING' | 'INACTIVE';
  payGroupId: string;
  paygroupName: string;
  lastPayDate: string;
  nextPayDate: string;
};

// TODO: remove this mock once the data is fetched from the API
const people: Employee[] = [
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
    paygroupName: 'Group 2',
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

export type Employee = APIEmployee & { person?: PersonColumnData };

export const usePeopleData = () => {
  // TODO: fetch data from the API
  const data = people;
  // TODO: return early if data is being loaded
  // if (isDataLoading) return { people: [], isLoading: true };

  const ids = data?.map(({ employeeId }) => employeeId.toString()) ?? [];
  const { persons, loading } = usePersonColumnData(ids);

  // TODO: update to loading state of the API
  const isLoading = loading || !data;

  if (isLoading) return { people: [], isLoading };

  const augmentedData = data.map((employee) => ({
    ...employee,
    person: getPerson(persons, employee.employeeId.toString()),
  }));

  return {
    people: augmentedData,
    isLoading,
  };
};
