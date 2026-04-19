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

// TODO: remove mock data for real data
const mock: PayGroup[] = [
  {
    id: '1',
    name: 'Monthly payroll',
    employeeCount: 2,
    employees: [{ value: 115497 }, { value: 115490 }],
  } as PayGroup,
  {
    id: '2',
    name: 'Weekly payroll',
    employeeCount: 10,
    employees: [{ value: 115520 }],
  } as PayGroup,
];

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
      nextPayDate: pg.nextPayDate,
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
