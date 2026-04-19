import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Action, Dialog } from 'designSystem/component/dialog';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { type ReportTableData } from './ReportTable';
import { icons } from 'designSystem/component/icon';
import { downloadTextAsFile } from '../../../utils/fileDownload';
import {
  REPORT_ID as GROSS_TO_NET,
  useGrossToNetReportModalData,
} from '../useGrossToNetReport';
import {
  REPORT_ID as COMP_BY_EE,
  useCompByEEReportModalData,
} from '../useCompByEEReport';
import {
  REPORT_ID as DEF_REC,
  useDifferencesRecReportModalData,
} from '../useDifferencesRecReport';
import { useReportModalNavigation } from './useReportModalNavigation';

export type ReportModalData = {
  title: string;
  key: string;
  tableData?: ReportTableData;
  content: JSX.Element;
};

export const ReportModal = () => {
  const { closeModal, getActiveReport } = useReportModalNavigation();
  const activeReport = getActiveReport();

  const allReports = {
    [GROSS_TO_NET]: useGrossToNetReportModalData(),
    [COMP_BY_EE]: useCompByEEReportModalData(),
  };

  if (!activeReport || !(activeReport in allReports)) {
    closeModal();
    return <></>;
  }

  const reportData = allReports;

  return (
    <Dialog.Promo open onOpenChange={closeModal}>
      {reportData?.tableData && (
        <Dialog.NavigationBar title={reportData?.title}>
          <Action.More>
            <DropdownMenu.Item
              icon={icons.rectangleHorizontalArrowDown}
              name="Download CSV"
              onSelect={() =>
                downloadTableAsCSV(
                  reportData?.tableData,
                  `Pay_${reportData?.key}.csv`,
                )
              }
            />
            {/* Additional download formats will go here */}
          </Action.More>
        </Dialog.NavigationBar>
      )}
      <Dialog.Content>
        {reportData?.content}
        {/* <ReportTable {...reportTableArgs} /> */}
      </Dialog.Content>
      <Dialog.Footer>
        <ActionBar>
          {/* Default download format will be exposed here in addition to dropdown in header */}
          {reportData?.tableData && (
            <Actions.Secondary
              disabled={false}
              variant="ghost"
              onClick={() =>
                downloadTableAsCSV(
                  reportData?.tableData,
                  `Pay_${reportData?.key}.csv`,
                )
              }
            >
              Download CSV
            </Actions.Secondary>
          )}
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
  table?: ReportTableData,
  filename?: string,
) => {
  if (!table || !filename) return;
  const csv = convertTableToCSV(table);
  downloadTextAsFile(csv, filename, 'text/csv');
};
