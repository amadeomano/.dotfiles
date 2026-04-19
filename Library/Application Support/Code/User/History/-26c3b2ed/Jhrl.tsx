import type { ReactNode } from 'react';
import type { ParseKeys, TFunction } from 'i18next';
import { getLocale } from '@personio-web/i18n';
import { Icon, icons, IconSVGComponent } from 'designSystem/component/icon';
import { Inline } from 'designSystem/component/layout';
import { ColumnConfig, TableCell } from 'designSystem/component/table';
import { XeroPeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';
import { Tooltip } from 'designSystem/component/tooltip';
import { TableColumns } from '../../commons/columns';

export const getBlockersIcon = (
  blockers: PeopleData['blockers'],
): IconSVGComponent | undefined =>
  blockers.length ? icons.exclamationMarkCircle : undefined;

export const getBlockersTooltip = (
  blockers: PeopleData['blockers'],
  t: TFunction<'payroll-integrations'>,
): ReactNode => (
  <ul>
    {blockers.map((blocker) => (
      <li key={blocker.attributeName}>
        {t(
          `xero.hub.people-table.${blocker.message}` as ParseKeys<'payroll-integrations'>,
        )}
      </li>
    ))}
  </ul>
);

export const getDisplayableSalaryType = (
  salaryType: PeopleData['grossSalary']['type'],
) => {
  const displayableTypes = new Map<typeof salaryType, string>([
    ['FIXED', 'Fixed'],
    ['HOURLY', 'Hourly'],
  ]);
  return displayableTypes.get(salaryType);
};

export const getPersonId = (data: PeopleData) => data.person.id;

type Column = ColumnConfig<
  PeopleData,
  string | number | null | PeopleData['blockers'] | PeopleData['grossSalary']
>;
export const getColumnsConfig: (
  t: TFunction<'payroll-integrations'>,
  omitColumns?: Partial<{ [key in keyof PeopleData]: boolean }>,
) => Column[] = (t, omitColumns) => {
  const columns: Column[] = [
    {
      id: 'person',
      header: t(`xero.hub.people-table.columns.person`),
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
    TableColumns.STATUS(t) as Column,
    {
      id: 'employeeNumber',
      header: t(`xero.hub.people-table.columns.employee-number`),
      columnSize: 'small',
      icon: icons.badgeIdHorizontal,
      accessor: (row) => row.employeeNumber,
      cell: ({ value }) => <TableCell.Number value={value as number} />,
    },
    {
      id: 'salaryType',
      header: t(`xero.hub.people-table.columns.salary-type`),
      columnSize: 'small',
      icon: icons.compensation,
      accessor: (row) => row.grossSalary.type,
      cell: ({ value }) =>
        value === 'HOURLY' ? (
          // TODO: remove this check once synchronising hourly wages is supported
          <TableCell.Enum
            color="gray"
            icon={icons.exclamationMarkTriangle}
            tooltip={{
              content: t('commons.hub.people-table.tooltips.hourly-wages'),
            }}
            value={getDisplayableSalaryType(
              value as PeopleData['grossSalary']['type'],
            )}
          />
        ) : (
          <TableCell.Text
            value={getDisplayableSalaryType(
              value as PeopleData['grossSalary']['type'],
            )}
          />
        ),
    },
    {
      id: 'blockers',
      header: t(`xero.hub.people-table.columns.tasks`),
      columnSize: 'small',
      icon: icons.checkList,
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
      id: 'grossSalary',
      header: t(`xero.hub.people-table.columns.gross-salary`),
      columnSize: 'small',
      icon: icons.moneyBag,
      accessor: (row) => row.grossSalary,
      cell: ({ value }) => {
        const CurrencyCell = (
          <TableCell.Currency
            currency={(value as PeopleData['grossSalary']).currency ?? 'GBP'}
            locale={getLocale()}
            value={(value as PeopleData['grossSalary']).amount}
          />
        );

        return (value as PeopleData['grossSalary']).proratedExternally ? (
          <TableCell.Custom
            value={
              (
                <Inline alignVertical={'center'} space={'gap-xsmall'}>
                  <Tooltip
                    content={t(
                      'commons.hub.people-table.tooltips.prorated-salary',
                    )}
                  >
                    <Icon icon={icons.infoCircle} color={'tertiary'} />
                  </Tooltip>
                  {CurrencyCell}
                </Inline>
              ) as any
            }
          />
        ) : (
          CurrencyCell
        );
      },
    },
  ];

  if (!omitColumns) return columns;

  return columns.filter((column) => !omitColumns[column.id]);
};
