import { getLocale } from '@personio-web/i18n';
import { formatCurrency } from '@personio-web/currency';
import { Icon, icons } from 'designSystem/component/icon';
import { Stack } from 'designSystem/component/layout';
import { IconButton } from 'designSystem/component/button';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAccessories,
} from 'designSystem/component/list';
import { type PayrollRun } from '../../../../../../hooks/payroll-lifecycle/usePayrollRuns';

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

export const EmployeeCompensations = ({ employee }: Props) => {
  return (
    <Stack space="gap-xsmall">
      <h4>Gross Pay</h4>
      <List variant="ghost">
        {employee?.payslip?.payments.map((payment) => (
          <ListItem key={payment.description}>
            <ListItemText>{payment.description}</ListItemText>
            <ListItemAccessories>
              <span>{getAmount(getNumericValue(payment.amount))}</span>
              <Icon icon={icons.chevronRight} color="tertiary" />
            </ListItemAccessories>
          </ListItem>
        ))}
        <ListItem>
          <ListItemText>Total gross pay</ListItemText>
          <ListItemAccessories>
            <span>
              {getAmount(
                getTotalPayments(employee?.payslip?.payments)?.toString(),
              )}
            </span>
            <Icon icon={icons.chevronRight} color="tertiary" />
          </ListItemAccessories>
        </ListItem>
      </List>
    </Stack>
  );
};
