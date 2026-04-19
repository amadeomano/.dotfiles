import { getLocale } from '@personio-web/i18n';
import { type FacepileProps } from 'designSystem/component/facepile';
import {
  type PayGroup,
  usePayGroups,
} from '../../../../hooks/payroll-lifecycle/usePayGroups';
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

const getPrintableDate = (date?: string) =>
  date
    ? Intl.DateTimeFormat(getLocale(), {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })?.format(new Date(date))
    : '';

export const useAssignablePayGroups = (): AssignablePayGroup[] => {
  const { payGroups } = usePayGroups();

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
