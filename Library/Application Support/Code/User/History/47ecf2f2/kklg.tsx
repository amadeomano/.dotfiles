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

export const REPORT_ID = 'comp-by-ee';

export const useDocumentTableRow = (): DocumentRow => {
  const { build } = useCompByEEReport();
  const { run } = useCurrentPayrollRun();
  const { openModal } = useReportModalNavigation();

  return {
    name: 'Compensations by Employee',
    type: 'Report',
    preview: () => openModal(REPORT_ID),
    download: () => {
      if (!run) return;
      const { columns, rows, key } = build();
      downloadTableAsCSV({ columns, rows }, `${key}.csv`);
    },
  };
};

const useCompByEEReport = (): { build: () => ReportTableArgs } => {
  const { run, isFetching } = useCurrentPayrollRun();

  const build = () => {
    type EmployeeResult = NonNullable<PayrollRun>['employeeResults'][number];
    type Row = {
      emp: EmployeeResult;
      comp: NonNullable<EmployeeResult['payslip']>['payments'][number];
    };

    const tableTransformer: Array<
      ReportTableColumn & {
        preparationLookup: (rawData: Row) => string | number | boolean;
      }
    > = [
      {
        id: 'ref',
        header: 'Ref',
        preparationLookup: ({ emp }) => emp.employeeId,
      },
      {
        id: 'employeeName',
        header: 'Employee',
        preparationLookup: ({ emp }) =>
          payrollRunEmployeeFullname(emp.employee),
      },
      {
        id: 'compensation',
        header: 'Compensation',
        isSortable: false,
        preparationLookup: ({ comp }) => comp.description,
      },
      {
        id: 'value',
        header: 'Value',
        type: 'currency',
        preparationLookup: ({ comp }) => comp.amount,
      },
    ];

    const reportTableArgs: ReportTableArgs = {
      columns: tableTransformer.map((column) => {
        const { preparationLookup: _omit, ...reportTableColumn } = column;
        return reportTableColumn;
      }),
      rows: [],
      isLoading: isFetching,
      title: `Compensations by EE - ${run?.taxYear}_${run?.period}`,
      key: `${run?.legalEntityId}_${run?.payGroupId}_report_${REPORT_ID}_${run?.taxYear}_${run?.period}`,
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
    <ReportModal title={title} onClose={closeModal}>
      <ReportTable columns={columns} rows={rows} isLoading={isLoading} />
    </ReportModal>
  );
};
