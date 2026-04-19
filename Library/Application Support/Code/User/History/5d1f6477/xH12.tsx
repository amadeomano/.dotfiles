import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { getLocale } from '@personio-web/i18n';

import { icons } from 'designSystem/component/icon';
import { HoverCard } from 'designSystem/component/hover-card';
import { type ColumnConfig, TableCell } from 'designSystem/component/table';

import { type Row } from './types';
import { type PropsWithChildren, useMemo } from 'react';

import styles from './ChangesTable.module.scss';

const MonetaryAttributesExp = [
  'fix_salary',
  'main_salary',
  'salary:', // other compensations
  'extra-payments', // one-time payments
];

type ValueColumnConfig = { value: string; label: string };
export type CategoryColumnConfig = 'personal_info' | 'salary_and_contract';
export type StatusColumnConfig = 'active' | 'inactive';
type SalaryTypeColumnConfig = 'fixed' | 'hourly';
type ChangesColumnConfig<T> = ColumnConfig<Row, T>;
type personTokenCellProps = {
  value: string;
  row: Row;
};
type changeCellProps = {
  value: {
    value: string;
    label: string;
  };
  row: Row;
  old: boolean;
};

const CustomCell = ({
  children,
  className,
}: PropsWithChildren<{ className: string }>) => {
  return <div className={className}>{children}</div>;
};
CustomCell.displayName = 'CustomCell';

export const PersonTokenCell = ({ value, row }: personTokenCellProps) => {
  const { t } = useTranslation('payroll');

  return useMemo(() => {
    const person = {
      name: `${row.employee.full_name}`,
      picture: row.employee.pictures?.large as string,
      office: {
        name: row.employee.office || '',
      },
      team: {
        name: row.employee.department || '',
      },
      contacts: [
        {
          id: 'personio',
          icon: icons.logoPersonio,
          label: t('employee-changes.profile'),
          href: `/staff/details/${row.employee.id}`,
          target: '_blank',
        },
      ],
    };
    return (
      <TableCell.Token
        value={value}
        avatar={{ src: row.employee.pictures?.small as string, name: value }}
        metadata={{
          testId: `employee-hover-card-${row.employee.id}-${row.created_at}`,
        }}
        renderHoverCard={({ children }) => (
          <HoverCard.Person href="" person={person}>
            {children}
          </HoverCard.Person>
        )}
      />
    );
  }, [value, row, t]);
};

const isMonetaryCell = (attribute: string): boolean => {
  return !!MonetaryAttributesExp.find((regex) =>
    new RegExp(regex).test(attribute),
  );
};

export const ChangeCell = ({ value, row, old }: changeCellProps) =>
  useMemo(() => {
    const classNames = [];
    if (old) classNames.push(styles.oldChanges);

    const defaultCell = (
      <TableCell.Text value={value.label || value.value || 'not set'} />
    );
    const monetaryCell = !isNaN(parseInt(value.value)) ? (
      <TableCell.Currency
        locale={getLocale()}
        currency={row.meta.currency_code || 'EUR'}
        value={parseInt(value.value)}
      />
    ) : (
      defaultCell
    );

    let mainCell = defaultCell;
    if (isMonetaryCell(row.attribute)) {
      classNames.push(styles.alignNumbersLeft);
      mainCell = monetaryCell;
    }
    return <CustomCell className={classNames.join(' ')}>{mainCell}</CustomCell>;
  }, [value, row, old]);

ChangeCell.displayName = 'CustomCell';

export const useColumnConfig = (): ChangesColumnConfig<any>[] => {
  const { t } = useTranslation('payroll');

  return useMemo(() => {
    const employeeIdColumn: ChangesColumnConfig<number> = {
      id: 'employee.id',
      header: t('employee-changes.column.employee_id'),
      icon: icons.badgeIdHorizontal,
      columnSize: 'small',
      accessor: (row) => row.employee.id,
      cell: ({ value }) => (
        <CustomCell className={styles.alignNumbersLeft}>
          <TableCell.Number value={value} />
        </CustomCell>
      ),
    };

    const personColumn: ChangesColumnConfig<string> = {
      id: 'employee.full_name',
      header: t('employee-changes.column.person'),
      icon: icons.personCircle,
      accessor: (row: Row) => row.employee.full_name,
      cell: PersonTokenCell,
    };

    const changeColumn: ChangesColumnConfig<string> = {
      id: 'attribute',
      header: t('employee-changes.column.change'),
      icon: icons.bolt,
      columnSize: 'small',
      accessor: (row: Row) => row.attribute,
      cell: ({ row, value }) => (
        <TableCell.Text value={row.meta.attribute_name || value} />
      ),
    };

    const attributeOldValueColumn: ChangesColumnConfig<ValueColumnConfig> = {
      id: 'old_value.value',
      header: t('employee-changes.column.old_value'),
      icon: icons.arrowUndo,
      accessor: (row: Row) => row.old_value as ValueColumnConfig,
      cell: ({ value, row }) => (
        <ChangeCell value={value} row={row} old={true} />
      ),
    };

    const attributeNewValueColumn: ChangesColumnConfig<ValueColumnConfig> = {
      id: 'new_value.value',
      header: t('employee-changes.column.new_value'),
      icon: icons.star,
      accessor: (row: Row) => row.new_value as ValueColumnConfig,
      cell: ({ value, row }) => (
        <ChangeCell value={value} row={row} old={false} />
      ),
    };

    const effectiveDateColumn: ChangesColumnConfig<string> = {
      id: 'effective_date',
      header: t('employee-changes.column.date'),
      icon: icons.calendarCheckmark,
      columnSize: 'small',
      accessor: (row: Row) => row.effective_date,
      cell: ({ value }) => (
        <TableCell.Date value={new Date(value)} locale={getLocale()} />
      ),
    };

    const createdAtColumn: ChangesColumnConfig<string> = {
      id: 'created_at',
      header: t('employee-changes.column.created_at'),
      icon: icons.calendar,
      columnSize: 'small',
      accessor: (row: Row) => row.created_at,
      cell: ({ value }) => (
        <TableCell.Date value={new Date(value)} locale={getLocale()} />
      ),
    };

    const categoryColumn: ChangesColumnConfig<CategoryColumnConfig> = {
      id: 'category',
      header: t('employee-changes.column.category'),
      icon: icons.bulletList,
      columnSize: 'small',
      accessor: (row: Row) => row.category as CategoryColumnConfig,
      cell: ({ value }) => (
        <TableCell.Enum value={t(`employee-changes.value.category_${value}`)} />
      ),
    };

    const statusColumn: ChangesColumnConfig<StatusColumnConfig> = {
      id: 'employee.status',
      header: t('employee-changes.column.status'),
      icon: icons.pulse,
      columnSize: 'small',
      accessor: (row: Row) => row.employee.status as StatusColumnConfig,
      cell: ({ value }) => (
        <TableCell.Enum
          value={t(`employee-changes.value.status_${value}`)}
          color={value === 'active' ? 'positive' : 'negative'}
        />
      ),
    };

    const officeColumn: ChangesColumnConfig<string> = {
      id: 'employee.office',
      header: t('employee-changes.column.office'),
      icon: icons.pin,
      columnSize: 'small',
      accessor: (row: Row) => row.employee.office || '',
      cell: ({ value }) => <TableCell.Text value={value} />,
    };

    const salaryTypeColumn: ChangesColumnConfig<SalaryTypeColumnConfig> = {
      id: 'employee.salary_type',
      header: t('employee-changes.column.salary_type'),
      icon: icons.compensation,
      columnSize: 'small',
      accessor: (row: Row) =>
        row.employee.salary_type as SalaryTypeColumnConfig,
      cell: ({ value }) => (
        <TableCell.Text
          value={
            value === null
              ? null
              : t(`employee-changes.value.salary_type_${value}`)
          }
        />
      ),
    };

    const departmentColumn: ChangesColumnConfig<string> = {
      id: 'employee.department',
      header: t('employee-changes.column.department'),
      icon: icons.house,
      columnSize: 'small',
      accessor: (row: Row) => row.employee.department || '',
      cell: ({ value }) => <TableCell.Text value={value} />,
    };

    return [
      employeeIdColumn,
      personColumn,
      changeColumn,
      attributeOldValueColumn,
      attributeNewValueColumn,
      effectiveDateColumn,
      createdAtColumn,
      categoryColumn,
      statusColumn,
      officeColumn,
      salaryTypeColumn,
      departmentColumn,
    ];
  }, [t]);
};
