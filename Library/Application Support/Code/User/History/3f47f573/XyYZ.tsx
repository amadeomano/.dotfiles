import { icons } from 'designSystem/component/icon';
import {
  TableCell,
  ButtonCellProps,
  ColumnConfig,
} from 'designSystem/component/table';
import {
  getBacsFileName,
  useRetrieveBacsDocument,
} from '../features/reports/useRetrieceBacsDocument';
import { useCurrentPayrollRun } from '../data/useCurrentPayrollRun';

export type DocumentRow = { name: string };

const nameColumn: ColumnConfig<DocumentRow, unknown> = {
  id: 'name',
  header: 'File name',
  accessor: (row) => row.name,
  cell: ({ value }) => <TableCell.Text value={value as string} />,
};

const downloadOrPreviewColumn = (
  onClick: ButtonCellProps['onClick'],
): ColumnConfig<DocumentRow, unknown> => ({
  id: 'download',
  header: 'Actions',
  accessor: (row) => row.name,
  cell: () => (
    <TableCell.Button
      value="download"
      icon={icons.rectangleHorizontalArrowDown}
      onClick={onClick}
    />
  ),
});

export const useDocumentsTableProvider = () => {
  const { run, isFetching: isLoading } = useCurrentPayrollRun();
  const { performDownload } = useRetrieveBacsDocument();
  const columns = [nameColumn, downloadOrPreviewColumn(performDownload)];
  const data = [{ name: getBacsFileName(run) }];
  return { columns, data, isLoading };
};
