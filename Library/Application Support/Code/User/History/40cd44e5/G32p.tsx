import { icons } from 'designSystem/component/icon';
import { TableCell, type ColumnConfig } from 'designSystem/component/table';

export type DocumentRow = {
  name: string;
  download?: () => void;
  preview?: () => void;
  type: 'BACS' | 'Report' | 'HMRC';
  enabled?: boolean;
};

const nameColumn: ColumnConfig<DocumentRow, string> = {
  id: 'name',
  header: 'File name',
  accessor: (row) => row.name,
  cell: ({ value, row }) =>
    row.preview !== undefined ? (
      <TableCell.Link onClick={row.preview} value={value} />
    ) : (
      <TableCell.Text value={value} />
    ),
};

const typeColum: ColumnConfig<DocumentRow, string> = {
  id: 'type',
  header: 'Document Type',
  accessor: (row) => row.type,
  cell: ({ value }) => <TableCell.Enum value={value} />,
};

const downloadColumn: ColumnConfig<DocumentRow, unknown> = {
  id: 'download',
  header: 'Actions',
  accessor: (row) => row.name,
  cell: ({ row }) =>
    row.download ? (
      <TableCell.Button
        value="Download"
        icon={icons.rectangleHorizontalArrowDown}
        onClick={row.download}
      />
    ) : (
      <TableCell.Text value="–" />
    ),
};

export const columnsConfig: ColumnConfig<DocumentRow, unknown | string>[] = [
  nameColumn,
  typeColum,
  downloadColumn,
];
