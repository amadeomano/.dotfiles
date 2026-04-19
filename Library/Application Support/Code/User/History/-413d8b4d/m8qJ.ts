import { getLocale } from '@personio-web/i18n';
import type { BaseData } from 'designSystem/component/table';
import type { ReportTableData, CurrencyValue } from './ReportTable';
import { downloadTextAsFile } from '../../../utils/fileDownload';

const getCellValue =
  <T extends BaseData>(row: T) =>
  (column: ReportTableData<T>['columns'][number], index: number) => {
    const value = column.accessor(row, index);
    return column.type === 'currency' ? (value as CurrencyValue).value : value;
  };

const convertTableToCSV = <T extends BaseData>(table: ReportTableData<T>) => {
  let csv = '';
  const separator = ',';
  csv += table.columns.map((column) => column.header).join(separator);
  csv += '\n';
  csv += table.rows
    .map((row) => table.columns.map(getCellValue(row)).join(separator))
    .join('\n');
  return csv;
};

export const downloadTableAsCSV = <T extends BaseData>(
  table?: ReportTableData<T>,
  filename?: string,
) => {
  if (!table || !filename) return;
  const csv = convertTableToCSV(table);
  downloadTextAsFile(csv, filename, 'text/csv');
};
