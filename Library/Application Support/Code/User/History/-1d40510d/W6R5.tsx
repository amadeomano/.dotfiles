import { getLocale } from '@personio-web/i18n';
import { TableCell } from 'designSystem/component/table';
import type { ColumnConfig } from 'designSystem/component/table';
import { TFunction } from 'i18next';
import {
  AbsencesRow,
  PaymentsRow,
  PersonalChangesRow,
  SalaryRow,
  EmployeeChangesRowWithAttribute,
} from '../../components/BasicEmployeeSidepanel/types';

const columnValue = <T extends EmployeeChangesRowWithAttribute>(
  header: string,
  type: 'text' | 'currency' | 'date',
  property: keyof T,
  options?: {
    dataFormat?: string;
  },
): ColumnConfig<T, any> => ({
  id: String(property).replace(/_/g, '-'),
  header: header,
  columnSize: 'small',
  enableSorting: false,
  accessor: (row) => row,
  cell: ({ value }) => {
    switch (type) {
      case 'currency':
        return (
          <TableCell.Currency
            value={value[property]}
            locale={getLocale()}
            currency={value.currency || 'EUR'}
          />
        );
      case 'text':
        return <TableCell.Text value={value[property] ?? '-'} />;
      case 'date':
        if (value[property]) {
          return (
            <TableCell.Date
              value={new Date(value[property]!) || '-'}
              locale={getLocale()}
              dateFormat={options?.dataFormat}
            />
          );
        }
        return <TableCell.Text value={value[property] ?? '-'} />;
    }
  },
});

const validFromDateFormat = 'dd.MM.yy';
const editOnDateFormat = 'dd.MM.yy - HH:mm';

export function salaryChangesColumnsConfig<
  T extends PersonalChangesRow | SalaryRow,
>(t: TFunction<'payroll'>): ColumnConfig<T, any>[] {
  return [
    columnValue(t('employee-drawer-table-th-attribute'), 'text', 'attribute'),
    columnValue(
      t('employee-drawer-table-th-old-value'),
      'currency',
      'old_value',
    ),
    columnValue(
      t('employee-drawer-table-th-new-value'),
      'currency',
      'new_value',
    ),
    columnValue(
      t('employee-drawer-table-th-valid-from'),
      'date',
      'valid_from',
      {
        dataFormat: validFromDateFormat,
      },
    ),
    columnValue(t('employee-drawer-table-th-edited-on'), 'date', 'updated_at', {
      dataFormat: editOnDateFormat,
    }),
  ];
}
export function personalChangesColumnsConfig<
  T extends PersonalChangesRow | SalaryRow,
>(t: TFunction<'payroll'>): ColumnConfig<T, any>[] {
  return [
    columnValue(t('employee-drawer-table-th-attribute'), 'text', 'attribute'),
    columnValue(t('employee-drawer-table-th-old-value'), 'text', 'old_value'),
    columnValue(t('employee-drawer-table-th-new-value'), 'text', 'new_value'),
    columnValue(
      t('employee-drawer-table-th-valid-from'),
      'date',
      'valid_from',
      {
        dataFormat: validFromDateFormat,
      },
    ),
    columnValue(t('employee-drawer-table-th-edited-on'), 'date', 'updated_at', {
      dataFormat: editOnDateFormat,
    }),
  ];
}

export const paymentsColumnsConfig = (
  t: TFunction<'payroll'>,
): ColumnConfig<PaymentsRow, PaymentsRow[keyof PaymentsRow]>[] => [
  columnValue(t('employee-drawer-table-th-attribute'), 'text', 'attribute'),
  columnValue(t('employee-drawer-table-th-new-value'), 'currency', 'new_value'),
  columnValue(t('employee-drawer-table-th-edited-on'), 'date', 'updated_at', {
    dataFormat: editOnDateFormat,
  }),
];

export const absencesColumnsConfig = (
  t: TFunction<'payroll'>,
): ColumnConfig<AbsencesRow, AbsencesRow[keyof AbsencesRow]>[] => [
  columnValue(t('employee-drawer-table-th-absence-type'), 'text', 'type'),
  columnValue(t('employee-drawer-table-th-absence-start'), 'text', 'start'),
  columnValue(t('employee-drawer-table-th-absence-end'), 'text', 'end'),
  columnValue(
    t('employee-drawer-table-th-absence-duration'),
    'text',
    'duration',
  ),
  columnValue(t('employee-drawer-table-th-absence-unit'), 'text', 'unit'),
];
