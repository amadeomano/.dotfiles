import { type PropsWithChildren } from 'react';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Action, Dialog } from 'designSystem/component/dialog';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { useRouter } from 'next/router';
import { ReportTable, type ReportTableData } from './ReportTable';
import { icons } from 'designSystem/component/icon';
import { useGrossToNetReport } from '../useGrossToNetReport';
import { downloadTextAsFile } from '../../../utils/fileDownload';
import { useCompByEEReport } from '../useCompByEEReport';
import omit from 'lodash/omit';

export const useReportModalNavigation = () => {
  const router = useRouter();

  return {
    openModal(report: string) {
      router.push({ query: { ...router.query, report } });
    },

    closeModal() {
      router.replace({ query: omit(router.query, ['report']) });
    },
  };
};

export const FreeReportModal = ({
  report: reportId,
  children,
}: PropsWithChildren<{ report: string }>) => {
  const { closeModal } = useReportModalNavigation();

  return (
    <Dialog.Promo open onOpenChange={closeModal}>
      <Dialog.NavigationBar title={reportTableArgs.title}>
        <Action.More>
          <DropdownMenu.Item
            icon={icons.rectangleHorizontalArrowDown}
            name="Download CSV"
            onSelect={() =>
              downloadTableAsCSV(
                reportTableArgs,
                `Pay_${reportTableArgs.key}.csv`,
              )
            }
          />
          {/* Additional download formats will go here */}
        </Action.More>
      </Dialog.NavigationBar>
      <Dialog.Content>
        <ReportTable {...reportTableArgs} />
      </Dialog.Content>
      <Dialog.Footer>
        <ActionBar>
          {/* Default download format will be exposed here in addition to dropdown in header */}
          <Actions.Secondary
            disabled={false}
            variant="ghost"
            onClick={() =>
              downloadTableAsCSV(
                reportTableArgs,
                `Pay_${reportTableArgs.key}.csv`,
              )
            }
          >
            Download CSV
          </Actions.Secondary>
          <Actions.Primary onClick={closeModal}>Close</Actions.Primary>
        </ActionBar>
      </Dialog.Footer>
    </Dialog.Promo>
  );
};

const convertTableToCSV = (table: ReportTableData) => {
  let csv = '';
  const separator = ',';
  csv += table.columns.map((column) => column.header).join(separator);
  csv += '\n';
  csv += table.rows
    .map((row) => table.columns.map((column) => row[column.id]).join(separator))
    .join('\n');
  return csv;
};

export const downloadTableAsCSV = (
  table: ReportTableData,
  filename: string,
) => {
  const csv = convertTableToCSV(table);
  downloadTextAsFile(csv, filename, 'text/csv');
};
