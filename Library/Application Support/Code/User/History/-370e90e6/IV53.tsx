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
      space="gap-large"
      alignVertical="center"
    >
      <div className={styles.avatar}>
        <Avatar name={payrollRunEmployeeFullname(employee)} size="large" />
      </div>

      <Stack space="gap-xsmall" className={styles.info}>
        <h4 className={styles.title}>{payrollRunEmployeeFullname(employee)}</h4>
      </Stack>
    </Inline>
  </Stack>
);
