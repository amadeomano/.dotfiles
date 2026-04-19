// TODO: add tests
import { getLocale } from '@personio-web/i18n';
import { icons } from 'designSystem/component/icon';
import { TableCell, type ColumnConfig } from 'designSystem/component/table';
import { sortByNum, sortByStr, sortByDate } from './sortUtils';
import { type Employee } from '../../../hooks/usePeopleData';
import { PersonCell } from './components/PersonCell';

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

export const personColumn = (): ColConfig = {
  id: COLUMNS.person,
  columnSize: 'mediumSmall',
  icon: icons.personCircle,
  header: 'Person',
  accessor: ({ employeeId }) => employeeId,
  cell: PersonCell(),
  sortHandler: (desc) => (a, b) => sortByNum(a.employeeId, b.employeeId, desc),
  // sortByStr(getPersonName(a), getPersonName(b), desc),
};

export const statusColumn: ColConfig = {
  id: COLUMNS.status,
  columnSize: 'small',
  icon: icons.circleStatus50,
  header: 'Status',
  enableGrouping: true,
  accessor: ({ status }) => status,
  cell: ({ value }) => <TableCell.Enum value={value as Employee['status']} />,
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
  sortHandler: (desc) => (a, b) =>
    sortByDate(a.lastPayDate, b.lastPayDate, desc),
};

export const nextPayDayColumn: ColConfig = {
  id: COLUMNS.nextPayDay,
  columnSize: 'small',
  icon: icons.moneyBag,
  header: 'Next pay day',
  accessor: ({ nextPayDate }) => nextPayDate,
  cell: ({ value }) => (
    <TableCell.Date
      locale={getLocale()}
      value={value ? new Date(value as string) : undefined}
    />
  ),
  sortHandler: (desc) => (a, b) =>
    sortByDate(a.nextPayDate, b.nextPayDate, desc),
};
