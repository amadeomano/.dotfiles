import { type FacepileAvatarProps } from 'designSystem/component/facepile';
import {
  type PayGroup,
  usePayGroups,
} from '../../../../hooks/payroll-lifecycle/usePayGroups';
import {
  usePersonColumnData,
  getPerson,
} from '../../../../hooks/usePersonColumnData';

type AssignablePayGroup = {
  id: PayGroup['id'];
  name: PayGroup['name'];
  employeeCount: PayGroup['employeeCount'];
  faces: FacepileAvatarProps[];
};

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
        .map<FacepileAvatarProps>((empId) => ({
          name: getPerson(persons, empId.toString())?.name ?? '',
          src: getPerson(persons, empId.toString())?.avatar ?? undefined,
        })),
    })) ?? [];
};
