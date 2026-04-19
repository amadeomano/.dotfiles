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
import { useEmployerCompensationSchemas } from '../../components/ManageTab/CompensationTab/useEmployerCompensationSchemas';
import type { ListEmployerCompensationSchemasData } from '@personio-web/payroll-data-payroll-me-types';

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

const useEEByCompReport = (): { build: () => ReportTableArgs } => {
  const { run, isFetching } = useCurrentPayrollRun();
  const { compensationSchemas } = useEmployerCompensationSchemas();

  const build = () => {
    type EmployeeResult = NonNullable<PayrollRun>['employeeResults'][number];
    type Row = {
      comp: ListEmployerCompensationSchemasData['data'][number];
      emp: EmployeeResult;
    };

    const tableTransformer: Array<
      ReportTableColumn & {
        preparationLookup: (rawData: Row) => string | number | boolean;
      }
    > = [
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
        preparationLookup: ({ emp, comp }) =>
          emp.payslip?.payments.find(
            (p) => p.systemType === comp.systemSchemaType,
          )?.amount ?? 0,
      },
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
    ];

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

    for (const compSchema of compensationSchemas?.data ?? []) {
      const row: typeof reportTableArgs.rows = {
        _meta: { currency: 'GBP' },
      ;
      console.log(row);
      for (const emp of run?.employeeResults.filter((emp) =>
        emp.payslip?.payments.some(
          (pay) => pay.systemType === compSchema.systemSchemaType,
        ),
      ) ?? []) {
        // For dev purposes, 5x the data
        for (let i = 0; i < 5; i++) {
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
