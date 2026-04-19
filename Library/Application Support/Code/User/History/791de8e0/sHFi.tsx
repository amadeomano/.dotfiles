import { useRouter } from 'next/router';
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

const navigateToEmployeeSalary = (employeeId: number) => () => {
  window.history.pushState({}, '', `/salary/employee-salary/${employeeId}`);
};

export const EmployeeCompensations = ({ employee }: Props) => {
  const router = useRouter();

  return (
    <Stack space="gap-xsmall">
      <h4>Gross Pay</h4>
      <List variant="ghost">
        {employee?.payslip?.payments.map((payment) => (
          <ListItem
            key={payment.description}
            onClick={navigateToEmployeeSalary(employee.employeeId)}
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
  );
};
