import type { DocumentRow } from '../../components/DocumentsTable/columns';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import {
  payrollRunEmployeeFullname,
  type PayrollRun,
} from '../../utils/payrollRun';
import { ReportModal } from './components/ReportModal';
import { downloadTableAsCSV } from './components/downloadTableAsCSV';
import { useReportModalNavigation } from './components/useReportModalNavigation';
import {
  ReportTable,
  type ReportTableArgs,
  type ReportTableColumn,
} from './components/ReportTable';
import { useEmployerCompensationSchemas } from '../../components/ManageTab/CompensationTab/useEmployerCompensationSchemas';
import type { ListEmployerCompensationSchemasData } from '@personio-web/payroll-data-payroll-me-types';
import { useGbNavigation } from '../../hooks/usePayrollGbBreadcrumbsNavigation';

export const ID = 'ee-by-comp';

export const useDocumentTableRow = (): DocumentRow => {
  const { build } = useEEByCompReport();
  const { run } = useCurrentPayrollRun();
  const { openModal } = useReportModalNavigation();

  return {
    name: 'Employee by Compensations',
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
  comp: ListEmployerCompensationSchemasData['data'][number];
  emp: EmployeeResult;
};
const tableColumnsConfig: ReportTableColumn<RowData>[] = [
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
    accessor: ({ emp, comp }) => ({
      currency: 'EUR',
      value:
        emp.payslip?.payments.find((p) => p.description === comp.description)
          ?.amount ?? '0',
    }),
  },
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
];

const useEEByCompReport = (): { build: () => ReportTableArgs<RowData> } => {
  const { legalEntityId } = useGbNavigation();
  const { run, isFetching: isPayRunLoading } = useCurrentPayrollRun();
  const { compensationSchemas, isFetching: isCompSchemasLoading } =
    useEmployerCompensationSchemas(legalEntityId);

  const build = () => {
    const reportTableArgs: ReportTableArgs<RowData> = {
      columns: tableTransformer.map((column) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { preparationLookup: _omit, ...reportTableColumn } = column;
        return reportTableColumn;
      }),
      rows: [],
      isLoading: isPayRunLoading || isCompSchemasLoading,
      title: `Compensations by EE - ${run?.taxYear}_${run?.period}`,
      key: `${run?.legalEntityId}_${run?.payGroupId}_report_${ID}_${run?.taxYear}_${run?.period}`,
    };

    for (const compSchema of compensationSchemas?.data ?? []) {
      for (const emp of run?.employeeResults.filter((emp) =>
        emp.payslip?.payments.some(
          (pay) => pay.description === compSchema.description,
        ),
      ) ?? []) {
        // For dev purposes, 5x the data
        for (let i = 0; i < 5; i++) {
          reportTableArgs.rows.push(
            Object.fromEntries([
              ['_meta', { currency: 'GBP' }],
              ...tableTransformer.map((row) => {
                return [
                  row.id,
                  row.preparationLookup({ emp, comp: compSchema }),
                ];
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

export const EEByCompReport = () => {
  const { build } = useEEByCompReport();
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
