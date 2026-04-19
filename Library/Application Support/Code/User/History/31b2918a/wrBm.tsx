import { type NextRouter } from 'next/router';
import uniqBy from 'lodash/uniqBy';
import { v4 as uuidv4 } from 'uuid';
import { getLocale } from '@personio-web/i18n';
import { Inline } from 'designSystem/component/layout';
import { Icon, icons } from 'designSystem/component/icon';
import {
  TableCell,
  type ColumnConfig,
  type FetchGroups,
  type Grouping,
} from 'designSystem/component/table';
import { type PayrollRun } from '../../../hooks/payroll-lifecycle/usePayrollRuns';
import {
  type PayGroup,
  getPayGroupById,
  getPayGroupScheduleName,
} from '../../../hooks/payroll-lifecycle/usePayGroups';
import { sortByStr, sortByNum, sortByDate } from './sortUtils';
import { usePayRunNavigator } from '../../../hooks/navigators/usePayRunNavigator';

type FetchParams = Parameters<FetchGroups>[0];
export type ColConfig = ColumnConfig<PayrollRun, unknown> & {
  sortHandler: (desc?: boolean) => (a: PayrollRun, b: PayrollRun) => number;
  getGroups?: (data: PayrollRun[], groupArgs: FetchParams) => Grouping[];
  getGroupData?: (groupArgs: Grouping) => (run: PayrollRun) => boolean;
};
export const COLUMNS = {
  title: 'title',
  people: 'people',
  schedule: 'schedule',
  status: 'status',
  approvedOn: 'approvedOn',
  taxPeriod: 'taxPeriod',
  taxYear: 'taxYear',
} as const;

const getTitle = (run: PayrollRun, payGroups: PayGroup[]): string => {
  const groupName = getPayGroupById(payGroups, run.payGroupId)?.name ?? '';
  const fmt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const payDay = Intl.DateTimeFormat(getLocale(), fmt).format(
    new Date(run.payDate),
  );
  return `${groupName} · ${payDay}`;
};
const TitleCell: ColConfig['cell'] = ({ value, row }) => {
  const { navigateToPayRun } = usePayRunNavigator();
  return (
    <TableCell.Link
      value={value as string}
      onClick={() => navigateToPayRun(row.id)}
    />
  );
};
export const titleColumn = (payGroups: PayGroup[]): ColConfig => ({
  id: COLUMNS.title,
  columnSize: 'mediumSmall',
  icon: icons.moneyStack,
  header: 'Payrun',
  accessor: (run) => getTitle(run, payGroups),
  cell: TitleCell,
  sortHandler: (desc) => (a, b) => sortByDate(a.payDate, b.payDate, desc),
});

export const peopleColumn: ColConfig = {
  id: COLUMNS.people,
  columnSize: 'small',
  icon: icons.people2,
  header: 'People',
  accessor: ({ employeeResults }) => employeeResults.length,
  cell: ({ value }) => <TableCell.Number value={value as number} />,
  sortHandler: (desc) => (a, b) =>
    sortByNum(a.employeeResults.length, b.employeeResults.length, desc),
};

export const scheduleColumn: (payGroups: PayGroup[]) => ColConfig = (
  payGroups,
) => ({
  id: COLUMNS.schedule,
  columnSize: 'small',
  icon: icons.calendar,
  header: 'Schedule',
  enableGrouping: true,
  accessor: ({ payGroupId }) =>
    getPayGroupScheduleName(getPayGroupById(payGroups, payGroupId)),
  cell: ({ value }) => (
    <TableCell.Enum icon={icons.infoCircle} value={value as string} />
  ),
  sortHandler: (desc) => (a, b) =>
    sortByStr(
      getPayGroupScheduleName(getPayGroupById(payGroups, a.payGroupId)),
      getPayGroupScheduleName(getPayGroupById(payGroups, b.payGroupId)),
      desc,
    ),
  getGroups: (data, { groupId, sort }) => {
    const groups = uniqBy(data, 'payGroupId');
    groups.sort(scheduleColumn(payGroups).sortHandler(sort === 'desc'));
    return groups.map((run) => ({
      uniqueId: uuidv4(),
      id: groupId,
      label: scheduleColumn(payGroups).header ?? '',
      value: scheduleColumn(payGroups).accessor(run, 0) as string,
    }));
  },
  getGroupData:
    ({ value }) =>
    (run) =>
      scheduleColumn(payGroups).accessor(run, 0) === value,
});

export const StatusIcon = ({ status }: { status: PayrollRun['status'] }) => {
  switch (status) {
    case 'DRAFT':
      return <Icon icon={icons.circleStatus50} color="secondary-accent" />;
    case 'APPROVED':
      return <Icon icon={icons.checkmarkCircle} color="secondary-positive" />;
  }
};

export const Status = ({ status }: { status: PayrollRun['status'] }) => (
  <Inline alignVertical="center" space="gap-xsmall">
    <StatusIcon status={status} />
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
    <TableCell.Custom
      value={<Status status={value as PayrollRun['status']} />}
    />
  ),
  sortHandler: (desc) => (a, b) => sortByStr(a.status, b.status, desc),
  getGroups: (data, { groupId, sort }) => {
    const groups = uniqBy(data, 'status');
    groups.sort(statusColumn.sortHandler(sort === 'desc'));
    return groups.map((run) => ({
      uniqueId: uuidv4(),
      id: groupId,
      label: statusColumn.header ?? '',
      value: statusColumn.accessor(run, 0) as string,
    }));
  },
  getGroupData:
    ({ value }) =>
    (run) =>
      statusColumn.accessor(run, 0) === value,
};

export const approvedOnColumn: ColConfig = {
  id: COLUMNS.approvedOn,
  columnSize: 'mediumSmall',
  icon: icons.calendarCheckmark,
  header: 'Approved on',
  accessor: ({ approvedDate }) => approvedDate,
  cell: ({ value }) => (
    <TableCell.Date
      locale={getLocale()}
      value={value ? new Date(value as string) : undefined}
    />
  ),
  sortHandler: (desc) => (a, b) =>
    sortByDate(a.approvedDate, b.approvedDate, desc),
};

export const taxPeriodColumn: ColConfig = {
  id: COLUMNS.taxPeriod,
  columnSize: 'small',
  icon: icons.calendar,
  header: 'Tax period',
  enableGrouping: true,
  accessor: ({ period }) => `M${period}`,
  cell: ({ value }) => <TableCell.Text value={value as string} />,
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
};

export const taxYearColumn: ColConfig = {
  id: COLUMNS.taxYear,
  columnSize: 'mediumSmall',
  icon: icons.calendar,
  header: 'Tax year',
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
};
