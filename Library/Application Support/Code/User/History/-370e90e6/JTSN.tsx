import {Stack, Inline} from 'designSystem/component/layout';
import {Avatar} from 'designSystem/component/avatar';
import { type PayrollRunEmployee, payrollRunEmployeeFullname } from '../../../../utils/payrollRun';
import './EmployeeGeneralInfo.module.scss';

export const EmployeeGeneralInfo = (employee: PayrollRunEmployee) => (
  
          <Stack className={styles.hoverCard} space="gap-large">
            <Inline
              className={styles.infoHero}
              space="gap-large"
              alignVertical="center"
            >
              <div className={styles.avatar}>
                <Avatar name={payrollRunEmployeeFullname(employee)} size="full" />
              </div>

              <Stack space="gap-xsmall" className={styles.info}>
                <h4 className={styles.title}>{person.name}</h4>
                {person.position && (
                  <span className={styles.subtitle}>{person.position}</span>
                )}
              </Stack>
            </Inline>
)