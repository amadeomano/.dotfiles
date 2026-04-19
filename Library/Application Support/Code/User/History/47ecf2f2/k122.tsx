import type { DocumentRow } from '../../components/DocumentsTable/columns';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import {
  payrollRunEmployeeFullname,
  type PayrollRun,
} from '../../utils/payrollRun';
import { downloadTableAsCSV, ReportModal } from './components/ReportModal';
import { useReportModalNavigation } from './components/useReportModalNavigation';
import {
  ReportTable,
  type ReportTableArgs,
  type ReportTableColumn,
} from './components/ReportTable';

export const ID = 'comp-by-ee';

export const useDocumentTableRow = (): DocumentRow => {
  const { build } = useCompByEEReport();
  const { run } = useCurrentPayrollRun();
  const { openModal } = useReportModalNavigation();

  return {
    name: 'Compensations by Employee',
    type: 'Report',
    preview: () => openModal(ID),
    download: () => {
      if (!run) return;
      const { columns, rows, key } = build();
      downloadTableAsCSV({ columns, rows }, `${key}.csv`);
    },
  };
};

type EmployeeResult = NonNullable<PayrollRun>['employeeResults'][number];
type RowData = {
  emp: EmployeeResult;
  comp: NonNullable<EmployeeResult['payslip']>['payments'][number];
};
const tableColumnsConfig: ReportTableColumn<RowData, unknown>[] = [
  {
    id: 'ref',
    header: 'Ref',
    accessor: ({ emp }) => emp.employeeId,
  },
  {
    id: 'employeeName',
    header: 'Employee',
    accessor: ({ emp }) => payrollRunEmployeeFullname(emp.employee),
  },
  {
    id: 'compensation',
    header: 'Compensation',
    enableSorting: false,
    accessor: ({ comp }) => comp.description,
  },
  {
    id: 'value',
    header: 'Value',
    type: 'currency',
    accessor: ({ comp }) => comp.amount,
  },
];

const useCompByEEReport = (): { build: () => ReportTableArgs } => {
  const { run, isFetching } = useCurrentPayrollRun();

  const build = () => {
    const reportTableArgs: ReportTableArgs = {
      columns: tableTransformer.map((column) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { preparationLookup: _omit, ...reportTableColumn } = column;
        return reportTableColumn;
      }),
      rows: [],
      isLoading: isFetching,
      title: `Compensations by EE - ${run?.taxYear}_${run?.period}`,
      key: `${run?.legalEntityId}_${run?.payGroupId}_report_${ID}_${run?.taxYear}_${run?.period}`,
    };

    // For dev purposes, 100x the data
    for (let i = 0; i < 100; i++) {
      for (const emp of run?.employeeResults ?? []) {
        for (const payment of emp.payslip?.payments ?? []) {
          reportTableArgs.rows.push(
            Object.fromEntries([
              ['_meta', { currency: 'GBP' }],
              ...tableTransformer.map((row) => {
                return [row.id, row.preparationLookup({ emp, comp: payment })];
              }),
            ]),
          );
        }
      }
    }

    return reportTableArgs;
  };

  return { build };
};

export const CompByEEReport = () => {
  const { build } = useCompByEEReport();
  const { closeModal } = useReportModalNavigation();
  const { title, columns, rows, key, isLoading } = build();
  return (
    <ReportModal
      title={title}
      onClose={closeModal}
      downloadCSVAction={() =>
        downloadTableAsCSV({ columns, rows }, `${key}.csv`)
      }
    >
      <ReportTable columns={columns} rows={rows} isLoading={isLoading} />
    </ReportModal>
  );
};
