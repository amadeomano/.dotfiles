import { ColumnConfig, TableCell } from 'designSystem/component/table';
import { IconSVGComponent, icons } from 'designSystem/component/icon';
import type { ParseKeys, TFunction } from 'i18next';

import { A3PeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';

export const getBlockersIcon = (
  blockers: PeopleData['blockers'],
): IconSVGComponent | undefined =>
  blockers.length ? icons.exclamationMarkCircle : undefined;

export const getBlockersTooltip = (
  blockers: PeopleData['blockers'],
  t: TFunction<'payroll-integrations'>,
): string | undefined =>
  blockers.length
    ? blockers.length > 1
      ? `${blockers.length}: ${blockers
          .map((blocker) =>
            t(
              `athree.hub.people-table.${blocker.message}` as ParseKeys<'payroll-integrations'>,
            ),
          )
          .join(', ')}`
      : t(
          `athree.hub.people-table.${blockers[0].message}` as ParseKeys<'payroll-integrations'>,
        )
    : undefined;

export const getPersonId = (data: PeopleData) => data.person.id;

export const getColumnsConfig: (
  t: TFunction<'payroll-integrations'>,
) => ColumnConfig<PeopleData, string | number | PeopleData['blockers']>[] = (
  t,
) => [
  {
    id: 'person',
    header: t('athree.hub.people-table.columns.person'),
    columnSize: 'medium',
    icon: icons.person,
    accessor: (row) => `${row.person.firstName} ${row.person.lastName}`,
    cell: ({ value, row }) => (
      <TableCell.Token
        value={value as string}
        avatar={{
          name: value as string,
        }}
        href={`/staff/details/${row.person.id}`}
      />
    ),
  },
  {
    id: 'employeeCode',
    header: t('athree.hub.people-table.columns.employee-code'),
    columnSize: 'small',
    icon: icons.tag,
    accessor: (row) => row.employeeCode,
    cell: ({ value }) => <TableCell.Number value={value as number} />,
  },
  {
    id: 'blockers',
    header: t('athree.hub.people-table.columns.blockers'),
    columnSize: 'small',
    icon: icons.flag,
    accessor: (row) => row.blockers,
    cell: ({ value, row }) =>
      (value as PeopleData['blockers']).length ? (
        <TableCell.Enum
          icon={getBlockersIcon(value as PeopleData['blockers'])}
          color="red"
          value={`${(value as PeopleData['blockers']).length}`}
          tooltip={{
            content: getBlockersTooltip(value as PeopleData['blockers'], t),
          }}
          onClick={() => window.open(`/staff/details/${row.person.id}`)}
        />
      ) : (
        <TableCell.Text value="" />
      ),
  },
  {
    id: 'office',
    header: t('athree.hub.people-table.columns.office'),
    columnSize: 'small',
    icon: icons.pin,
    accessor: (row) => row.office.officeName,
    cell: ({ value }) => <TableCell.Text value={value as string} />,
  },
];
