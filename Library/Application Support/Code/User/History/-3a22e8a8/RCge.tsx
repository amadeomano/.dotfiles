import { type PropsWithChildren } from 'react';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Action, Dialog } from 'designSystem/component/dialog';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import type { ReportTableData, BaseData } from './ReportTable';
import { icons } from 'designSystem/component/icon';
import { downloadTextAsFile } from '../../../utils/fileDownload';

export type ReportModalProps = {
  title: string;
  onClose?: () => void;
  downloadCSVAction?: () => void;
};

export const ReportModal = ({
  children,
  onClose,
  title,
  downloadCSVAction,
}: PropsWithChildren<ReportModalProps>) => {
  return (
    <Dialog.Promo open onOpenChange={onClose}>
      <Dialog.NavigationBar title={title}>
        {downloadCSVAction && (
          <Action.More>
            <DropdownMenu.Item
              icon={icons.rectangleHorizontalArrowDown}
              name="Download CSV"
              onSelect={downloadCSVAction}
            />
            {/* Additional download formats will go here */}
          </Action.More>
        )}
      </Dialog.NavigationBar>
      <Dialog.Content>{children}</Dialog.Content>
      <Dialog.Footer>
        <ActionBar>
          {/* Default download format will be exposed here in addition to dropdown in header */}
          {downloadCSVAction && (
            <Actions.Secondary
              disabled={false}
              variant="ghost"
              onClick={downloadCSVAction}
            >
              Download CSV
            </Actions.Secondary>
          )}
          <Actions.Primary onClick={onClose}>Close</Actions.Primary>
        </ActionBar>
      </Dialog.Footer>
    </Dialog.Promo>
  );
};

const convertTableToCSV = <T extends BaseData>(table: ReportTableData<T>) => {
  let csv = '';
  const separator = ',';
  csv += table.columns.map((column) => column.header).join(separator);
  csv += '\n';
  csv += table.rows
    .map((row) =>
      table.columns
        .map((column, index) => column.accessor(row, index))
        .join(separator),
    )
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
