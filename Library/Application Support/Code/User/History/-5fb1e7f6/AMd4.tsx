import { type DocumentRow } from '../../components/DocumentsTable/columns';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import {
  type PayrollRunRow,
  payrollRunEmployeeFullname,
} from '../../utils/payrollRun';
import { ReportModal } from './components/ReportModal';
import { downloadTableAsCSV } from './components/downloadTableAsCSV';
import { useReportModalNavigation } from './components/useReportModalNavigation';
import {
  type ReportTableArgs,
  type ReportTableColumn,
  ReportTable,
} from './components/ReportTable';

export const ID = 'gross-to-net';

export const useDocumentTableRow = (): DocumentRow => {
  const { build } = useGrossToNetReport();
  const { run } = useCurrentPayrollRun();
  const { openModal } = useReportModalNavigation();

  return {
    name: 'Gross to Net Report',
    type: 'Report',
    preview: () => openModal(ID),
    download: () => {
      if (!run) return;
      const { columns, rows, key } = build();
      downloadTableAsCSV({ columns, rows }, `${key}.csv`);
    },
  };
};

const useGrossToNetReport = (): {
  build: () => ReportTableArgs<PayrollRunRow>;
} => {
  const { run, isFetching } = useCurrentPayrollRun();

  const build = () => {
    const tableTransformer: ReportTableColumn<PayrollRunRow>[] = [
      {
        id: 'name',
        header: 'Employee',
        accessor: (emp) => payrollRunEmployeeFullname(emp.employee),
      },
      {
        id: 'payrollId',
        header: 'Payroll Id',
        accessor: () => '-',
        defaultHidden: true,
      },
      {
        id: 'employeeId',
        header: 'Employee ID',
        accessor: (emp) => String(emp.employeeId),
        defaultHidden: true,
      },
      {
        id: 'ni-number',
        header: 'NI Number',
        enableSorting: false,
        accessor: (emp) =>
          emp.jurisdictionAttributes?.nationalInsuranceNumber ?? '–',
      },
      {
        id: 'tax-code',
        header: 'Tax code',
        accessor: (emp) => emp.jurisdictionAttributes?.taxCode ?? '–',
      },
      {
        id: 'pay-gross',
        header: 'Gross pay',
        type: 'currency',
        accessor: (emp) => ({
          currency: 'EUR',
          value: emp.payslip?.grossPay ?? '',
        }),
      },
      {
        id: 'pay-gross-taxable',
        header: 'Gross for PAYE',
        type: 'currency',
        accessor: (emp) => ({
          currency: 'EUR',
          value:
            emp.payslip?.taxResults?.find(
              (taxResult) =>
                (taxResult as unknown as { tax: string }).tax === 'PAYE',
            )?.taxablePay ?? '',
        }),
      },
      {
        id: 'pay-gross-niable',
        header: 'Gross for NI',
        type: 'currency',
        accessor: (emp) => ({
          currency: 'EUR',
          value:
            emp.payslip?.taxResults?.find(
              (taxResult) =>
                (taxResult as unknown as { tax: string }).tax === 'NI',
            )?.taxablePay ?? '',
        }),
      },
      {
        id: 'pay-gross-pensable',
        header: 'Gross for Pension',
        type: 'currency',
        accessor: (emp) => ({
          currency: 'EUR',
          value:
            // TODO: Gross for Pension
            emp.payslip?.taxResults?.find(
              (taxResult) =>
                (taxResult as unknown as { tax: string }).tax === 'PENSION',
            )?.taxablePay ?? '',
        }),
      },
      {
        id: 'tax-paye',
        header: 'PAYE',
        type: 'currency',
        accessor: (emp) => ({
          currency: 'EUR',
          value:
            emp.payslip?.taxResults?.find(
              (taxResult) =>
                (taxResult as unknown as { tax: string }).tax === 'PAYE',
            )?.employeeContribution ?? '',
        }),
      },
      {
        id: 'tax-ni-employee',
        header: 'EE NI',
        type: 'currency',
        accessor: (emp) => ({
          currency: 'EUR',
          value:
            // TODO: taxResults type missing in openapi
            emp.payslip?.taxResults?.find(
              (taxResult) =>
                (taxResult as unknown as { tax: string }).tax === 'NI',
            )?.employeeContribution ?? '',
        }),
      },
      {
        id: 'tax-ni-employer',
        header: 'ER NI',
        type: 'currency',
        preparationLookup: (emp) =>
          // TODO: taxResults type missing in openapi
          emp.payslip?.taxResults?.find(
            (taxResult) =>
              (taxResult as unknown as { tax: string }).tax === 'NI',
          )?.employerContribution ?? '',
      },
      // 2025 todo: Class 1A NI
      // {
      //   id: 'tax-ni-c1a',
      //   header: 'C1A NI',
      //   type: 'currency',
      //   preparationLookup: (emp) =>
      //     emp.payslip?.accumulators['NI_CLASS_1A'] ?? '',
      // },
      {
        id: 'student-loan',
        header: 'Student Loan',
        type: 'currency',
        preparationLookup: (emp) =>
          emp.payslip?.accumulators['STUDENT_LOAN'] ?? '',
      },
      {
        id: 'postgraduate-loan',
        header: 'Postgraduate Loan',
        type: 'currency',
        preparationLookup: (emp) =>
          emp.payslip?.accumulators['POSTGRADUATE_LOAN'] ?? '',
      },
      {
        id: 'pension-ee',
        header: 'EE Pension',
        type: 'currency',
        preparationLookup: (emp) =>
          emp.payslip?.deductions?.find(
            // TODO: systemType type missing in openapi
            (item) =>
              (item as unknown as { systemType: string }).systemType ===
              'NET_PENSION',
          )?.amount ?? '',
      },
      {
        id: 'pension-er',
        header: 'ER Pension',
        type: 'currency',
        preparationLookup: (emp) =>
          emp.payslip?.contributions?.find(
            // TODO: systemType type missing in openapi
            (item) =>
              (item as unknown as { systemType: string }).systemType ===
              'EMPLOYER_PENSION',
          )?.amount ?? '',
      },
      {
        id: 'other-deductions',
        header: 'Other deductions',
        type: 'currency',
        preparationLookup: (emp) =>
          sumFromStringValues(
            emp.payslip?.deductions
              ?.filter(
                // TODO: systemType type missing in openapi
                (item) =>
                  !['NET_PENSION', 'EMPLOYEE_NI', 'PAYE'].includes(
                    (item as unknown as { systemType: string }).systemType,
                  ),
              )
              ?.map((item) => item.amount) ?? [],
          ),
      },
      {
        id: 'pay-net',
        header: 'Net pay',
        type: 'currency',
        preparationLookup: (emp) => emp.payslip?.netPay ?? '',
      },
      // Deductions from Net
      // Final Pay
    ];

    const reportTableArgs: ReportTableArgs = {
      columns: tableTransformer.map((column) => {
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        const { preparationLookup: _omit, ...reportTableColumn } = column;
        return reportTableColumn;
      }),
      rows: [],
      isLoading: isFetching,
      title: `Gross to Net - ${run?.taxYear}_${run?.period}`,
      key: `${run?.legalEntityId}_${run?.payGroupId}_report_gross-to-net_${run?.taxYear}_${run?.period}`,
    };

    // For dev purposes, 100x the data
    for (let i = 0; i < 100; i++) {
      for (const emp of run?.employeeResults ?? []) {
        reportTableArgs.rows.push(
          Object.fromEntries([
            ['_meta', { currency: 'GBP' }],
            ...tableTransformer.map((row) => {
              return [row.id, row.preparationLookup(emp)];
            }),
          ]),
        );
      }
    }

    return reportTableArgs;
  };

  return { build };
};

function sumFromStringValues(valueStrings: string[]) {
  return valueStrings
    .reduce((previous, current) => previous + parseFloat(current), 0)
    .toFixed(2);
}

export const GrossToNetReport = () => {
  const { build } = useGrossToNetReport();
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
