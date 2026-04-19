import { useRouter, type NextRouter } from 'next/router';
import { getLocale } from '@personio-web/i18n';
import { formatCurrency } from '@personio-web/currency';
import { Icon, icons } from 'designSystem/component/icon';
import { Stack } from 'designSystem/component/layout';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAccessories,
} from 'designSystem/component/list';
import { type PayrollRun } from '../../../../../../hooks/payroll-lifecycle/usePayrollRuns';
import e from 'cors';

type Props = {
  employee?: PayrollRun['employeeResults'][number];
};

const getNumericValue = (value: string) =>
  isNaN(Number(value)) ? 0 : Number(value);

const getAmount = (amount: number) => {
  return formatCurrency(getLocale(), 'GBP', amount);
};

const getTotalPayments = (
  payments?: NonNullable<
    PayrollRun['employeeResults'][number]['payslip']
  >['payments'],
) =>
  payments?.reduce((acc, payment) => acc + getNumericValue(payment.amount), 0);

const navigateToEmployeeSalary =
  (router: NextRouter, employeeId: number, query?: string) => () =>
    router.push(
      `/salary/employee-salary/${employeeId}${query ? '?' + query : ''}`,
    );

export const EmployeeCompensations = ({ employee }: Props) => {
  const router = useRouter();

  return (
    <Stack space="section-medium">
      <Stack space="gap-default">
        <h4>Gross Pay</h4>
        <List variant="ghost">
          {employee?.payslip?.payments.map((payment) => (
            <ListItem
              key={payment.description}
              onClick={navigateToEmployeeSalary(
                router,
                employee.employeeId,
                'baseSalaryDrawer=open',
              )}
            >
              <ListItemText>{payment.description}</ListItemText>
              <ListItemAccessories>
                <span>{getAmount(getNumericValue(payment.amount))}</span>
                <Icon icon={icons.chevronRight} color="tertiary" />
              </ListItemAccessories>
            </ListItem>
          ))}
          <ListItem>
            <ListItemText>
              <b>Total gross pay</b>
            </ListItemText>
            <ListItemAccessories>
              <b>
                {getAmount(getTotalPayments(employee?.payslip?.payments) ?? 0)}
              </b>
            </ListItemAccessories>
          </ListItem>
        </List>
      </Stack>
      <Stack space="gap-default">
        <h4>Deductions</h4>
        <List variant="ghost">
          {employee?.payslip?.deductions.map((deduction) => (
            <ListItem
              key={deduction.description}
              onClick={navigateToEmployeeSalary(router, employee.employeeId)}
            >
              <ListItemText>{deduction.description}</ListItemText>
              <ListItemAccessories>
                <span>{getAmount(getNumericValue(deduction.amount))}</span>
                <Icon icon={icons.chevronRight} color="tertiary" />
              </ListItemAccessories>
            </ListItem>
          ))}
          <ListItem>
            <ListItemText>
              <b>Total deductions</b>
            </ListItemText>
            <ListItemAccessories>
              <b>
                {getAmount(
                  getTotalPayments(employee?.payslip?.deductions) ?? 0,
                )}
              </b>
            </ListItemAccessories>
          </ListItem>
        </List>
      </Stack>
      <Stack space="gap-default">
        <h4>Contributions</h4>
        <List variant="ghost">
          {employee?.payslip?.contributions.map((contrib) => (
            <ListItem
              key={contrib.description}
              onClick={navigateToEmployeeSalary(
                router,
                employee.employeeId,
                'tab=recurring&recurringSummaryDrawer=open',
              )}
            >
              <ListItemText>{contrib.description}</ListItemText>
              <ListItemAccessories>
                <span>{getAmount(getNumericValue(contrib.amount))}</span>
                <Icon icon={icons.chevronRight} color="tertiary" />
              </ListItemAccessories>
            </ListItem>
          ))}
          <ListItem>
            <ListItemText>
              <b>Total contributions</b>
            </ListItemText>
            <ListItemAccessories>
              <b>
                {getAmount(
                  getTotalPayments(employee?.payslip?.contributions) ?? 0,
                )}
              </b>
            </ListItemAccessories>
          </ListItem>
        </List>
      </Stack>
    </Stack>
  );
};
