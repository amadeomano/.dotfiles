import { type Employee } from '../tabs/PeopleTab/types';

export const usePeopleData = (): Employee[] => [
  {
    employeeId: 115490,
    status: 'NEW',
    paygroupName: 'Group 1',
    payGroupId: '1',
    lastPayDate: '2022-01-01',
    nextPayDate: '2022-02-01',
  },
];
