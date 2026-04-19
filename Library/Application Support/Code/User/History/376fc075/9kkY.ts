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
  faces: Face[];
};

// TODO: remove mock data for real data
const mock: AssignablePayGroup[] = [
  {
    id: '1',
    name: 'Group 1',
    employeeCount: 2,
    faces: [
      {
        id: '1',
        name: 'John Doe',
        src: 'https://randomuser.me/api/portraits
  }
]

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
