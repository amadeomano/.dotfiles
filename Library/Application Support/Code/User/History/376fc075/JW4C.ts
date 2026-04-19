import { getLocale } from '@personio-web/i18n';
import { type FacepileProps } from 'designSystem/component/facepile';
import { type PayGroup } from '../../../../hooks/payroll-lifecycle/usePayGroups';
import {
  usePersonColumnData,
  getPerson,
} from '../../../../hooks/usePersonColumnData';

type Face = FacepileProps['items'][number];
type AssignablePayGroup = {
  id: PayGroup['id'];
  name: PayGroup['name'];
  employeeCount: PayGroup['employeeCount'];
  nextPayDate?: string;
  faces: Face[];
};

// TODO: remove mock data for real data
const mock: PayGroup[] = [
  {
    id: '1',
    name: 'Monthly payroll',
    employeeCount: 2,
    nextPayDate: '2024-12-30',
    employees: [{ value: 115497 }, { value: 115490 }],
  } as PayGroup,
  {
    id: '2',
    name: 'Weekly payroll',
    employeeCount: 10,
    nextPayDate: '2024-11-28',
    employees: [{ value: 115520 }],
  } as PayGroup,
];

const getPrintableDate = (date?: string) =>
  date
    ? Intl.DateTimeFormat(getLocale(), {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })?.format(new Date(date))
    : '';

export const useAssignablePayGroups = (): AssignablePayGroup[] => {
  // const { payGroups } = usePayGroups();
  const payGroups = { data: mock };

  const employeeIds =
    payGroups?.data
      .flatMap((pg) => pg.employees)
      .map((emp) => emp.value.toString()) ?? [];
  const { persons } = usePersonColumnData(employeeIds);

  const assignableGroups: AssignablePayGroup[] =
    payGroups?.data.map((pg) => ({
      id: pg.id,
      name: pg.name,
      nextPayDate: getPrintableDate(pg.nextPayDate),
      employeeCount: pg.employeeCount,
      faces: pg.employees
        .map((emp) => emp.value)
        .map<Face>((empId) => ({
          id: empId.toString(),
          name: getPerson(persons, empId.toString())?.name,
          src: getPerson(persons, empId.toString())?.avatar,
        })),
    })) ?? [];

  return assignableGroups;
};

export const getGroupById = (list: AssignablePayGroup[], id?: string) =>
  list.find((group) => group.id === id);
