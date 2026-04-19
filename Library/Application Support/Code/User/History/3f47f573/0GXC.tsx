import { icons } from 'designSystem/component/icon';
import { TableCell, ColumnConfig } from 'designSystem/component/table';

export type DocumentRow = { name: string; action: () => void };

export const nameColumn: ColumnConfig<DocumentRow, unknown> = {
  id: 'name',
  header: 'File name',
  accessor: (row) => row.name,
  cell: ({ value }) => <TableCell.Text value={value as string} />,
};

export const downloadColumn: ColumnConfig<DocumentRow, unknown> = {
  id: 'download',
  header: 'Actions',
  accessor: (row) => row.name,
  cell: ({ row }) => (
    <TableCell.Button
      value="download"
      icon={icons.rectangleHorizontalArrowDown}
      onClick={row.action}
    />
  ),
};

export const useDocumentsTableProvider = () => {
  return { columns, data, isLoading };
};
