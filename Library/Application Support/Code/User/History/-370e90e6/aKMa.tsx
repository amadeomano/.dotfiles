import { Stack, Inline } from 'designSystem/component/layout';
import { Avatar } from 'designSystem/component/avatar';
import {
  type PayrollRunEmployee,
  payrollRunEmployeeFullname,
} from '../../../../utils/payrollRun';
import styles from './EmployeeGeneralInfo.module.scss';

type Props = { employee?: PayrollRunEmployee };
export const EmployeeGeneralInfo = ({ employee }: Props) => (
  <Stack space="gap-large">
    <Inline
      className={styles.infoHero}
      space="gap-xlarge"
      alignVertical="center"
    >
      <div className={styles.avatar}>
        <Avatar name={payrollRunEmployeeFullname(employee)} size="full" />
      </div>
      <Stack space="gap-xsmall">
        <h3>{payrollRunEmployeeFullname(employee)}</h3>
        <p>{payrollRunEmployeeFullname(employee)}</p>
      </Stack>
    </Inline>
  </Stack>
);
