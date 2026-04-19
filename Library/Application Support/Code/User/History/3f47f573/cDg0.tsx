import { icons } from 'designSystem/component/icon';
import { TableCell, ColumnConfig } from 'designSystem/component/table';

export type DocumentRow = {
  name: string;
  action?: () => void;
  type: 'BACS' | 'Report';
};

export const nameColumn: ColumnConfig<DocumentRow, unknown> = {
  id: 'name',
  header: 'File name',
  accessor: (row) => row.name,
  cell: ({ value }) => <TableCell.Text value={value as string} />,
};

export const typeColum: ColumnConfig<DocumentRow, unknown> = {
  id: 'type',
  header: 'Document Type',
  accessor: (row) => row.type,
  cell: ({ value }) => <TableCell.Enum value={value as string} />,
};

export const downloadColumn: ColumnConfig<DocumentRow, unknown> = {
  id: 'download',
  header: 'Actions',
  accessor: (row) => row.name,
  cell: ({ row }) => (
    <TableCell.Button
      value={row.type === 'BACS' ? 'Download' : 'Preview'}
      icon={
        row.type === 'BACS' ? icons.rectangleHorizontalArrowDown : icons.eye
      }
      onClick={row.action}
    />
  ),
};
