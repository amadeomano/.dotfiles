import uniqBy from 'lodash/uniqBy';
import { v4 as uuidv4 } from 'uuid';
import { getLocale } from '@personio-web/i18n';
import { Inline } from 'designSystem/component/layout';
import { Icon, icons } from 'designSystem/component/icon';
import { SmartHoverCard } from 'designSystem/feature/smart-hover-card';
import { TableCell, type ColumnConfig } from 'designSystem/component/table';
import {
  type PayGroup,
  getPayGroupById,
  getPayGroupScheduleName,
} from '../../../hooks/payroll-lifecycle/usePayGroups';
import { sortByStr, sortByNum, sortByDate } from './sortUtils';
import { type Employee } from '../types';

export type ColConfig = ColumnConfig<Employee, unknown> & {
  sortHandler: (desc?: boolean) => (a: Employee, b: Employee) => number;
};
export const COLUMNS = {
  person: 'person',
  status: 'status',
  payGroup: 'payGroup',
  lastPaid: 'lastPaid',
  nextPayDay: 'nextPayDay',
} as const;

const getPersonName = (employee: Employee): string => {
  return `${employee.firstName} ${employee.lastName}`;
};
const PersonCell: ColConfig['cell'] = ({ value, row }) => {
  return (
    <TableCell.Token
      avatar={{ name: value as string }}
      value={value as string}
      renderHoverCard={({ children }) => (
        <SmartHoverCard.Person id={row.employeeId.toString()}>
          {children}
        </SmartHoverCard.Person>
      )}
    />
  );
};
export const personColumn: ColConfig = {
  id: COLUMNS.person,
  columnSize: 'mediumSmall',
  icon: icons.personCircle,
  header: 'Person',
  accessor: (employee) => getPersonName(employee),
  cell: PersonCell,
  sortHandler: (desc) => (a, b) =>
    sortByStr(getPersonName(a), getPersonName(b), desc),
};

export const Status = ({ status }: { status: Employee['status'] }) => (
  <Inline alignVertical="center" space="gap-xsmall">
    {status}
  </Inline>
);
export const statusColumn: ColConfig = {
  id: COLUMNS.status,
  columnSize: 'small',
  icon: icons.circleStatus50,
  header: 'Status',
  enableGrouping: true,
  accessor: ({ status }) => status,
  cell: ({ value }) => (
    <TableCell.Custom value={<Status status={value as Employee['status']} />} />
  ),
  sortHandler: (desc) => (a, b) => sortByStr(a.status, b.status, desc),
};

export const payGroupColumn: ColConfig = {
  id: COLUMNS.payGroup,
  columnSize: 'mediumSmall',
  icon: icons.calendarCheckmark,
  header: 'Approved on',
  accessor: ({ paygroupName }) => paygroupName,
  cell: ({ value }) => <TableCell.Token value={value as string} />,
  sortHandler: (desc) => (a, b) =>
    sortByStr(a.paygroupName, b.paygroupName, desc),
};

export const lastPaidColumn: ColConfig = {
  id: COLUMNS.lastPaid,
  columnSize: 'small',
  icon: icons.moneyBag,
  header: 'Last Paid',
  accessor: ({ lastPayDate }) => lastPayDate,
  cell: ({ value }) => (
    <TableCell.Date
      locale={getLocale()}
      value={value ? new Date(value as string) : undefined}
    />
  ),
  sortHandler: (desc) => (a, b) => sortByNum(a.period, b.period, desc),
  getGroups: (data, { groupId, sort }) => {
    const groups = uniqBy(data, 'period');
    groups.sort(taxPeriodColumn.sortHandler(sort === 'desc'));
    return groups.map((run) => ({
      uniqueId: uuidv4(),
      id: groupId,
      label: taxPeriodColumn.header ?? '',
      value: taxPeriodColumn.accessor(run, 0) as string,
    }));
  },
  getGroupData:
    ({ value }) =>
    (run) =>
      taxPeriodColumn.accessor(run, 0) === value,
  defaultGroupProps: {
    id: COLUMNS.taxPeriod,
    label: TAX_PERIOD_LABEL,
    sort: 'desc',
    uniqueId: '1',
  },
};

const TAX_YEAR_LABEL = 'Tax year';
export const taxYearColumn: ColConfig = {
  id: COLUMNS.taxYear,
  columnSize: 'mediumSmall',
  icon: icons.calendar,
  header: TAX_YEAR_LABEL,
  enableGrouping: true,
  accessor: ({ taxYear }) => `${taxYear}-${taxYear + 1}`,
  cell: ({ value }) => <TableCell.Text value={value as string} />,
  sortHandler: (desc) => (a, b) => sortByNum(a.taxYear, b.taxYear, desc),
  getGroups: (data, { groupId, sort }) => {
    const groups = uniqBy(data, 'taxYear');
    groups.sort(taxYearColumn.sortHandler(sort === 'desc'));
    return groups.map((run) => ({
      uniqueId: uuidv4(),
      id: groupId,
      label: taxYearColumn.header ?? '',
      value: taxYearColumn.accessor(run, 0) as string,
    }));
  },
  getGroupData:
    ({ value }) =>
    (run) =>
      taxYearColumn.accessor(run, 0) === value,
  defaultGroupProps: {
    id: COLUMNS.taxYear,
    label: TAX_YEAR_LABEL,
    sort: 'desc',
    uniqueId: '0',
  },
};
