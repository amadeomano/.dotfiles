import { useCallback, useMemo } from 'react';
import type { DocumentRow } from '../../components/DocumentsTable/columns';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import { ReportModal } from './components/ReportModal';
import { useEmployerCompensationSchemas } from '../../components/ManageTab/CompensationTab/useEmployerCompensationSchemas';
import { useGbNavigation } from '../../hooks/usePayrollGbBreadcrumbsNavigation';
import { useReportModalNavigation } from './components/useReportModalNavigation';
import { type PayrollRun } from '../../utils/payrollRun';
import {
  ReportTable,
  type ReportTableColumn,
  type ReportTableArgs,
} from './components/ReportTable';
import { downloadTableAsCSV } from './components/downloadTableAsCSV';

export const ID = 'YTD-rec';
type RowData = {
  rowTitle: string;
  BFWDTValue: string;
  CurrentValue: string;
  CFWDValue: string;
};
type EmployeeResult = PayrollRun['employeeResults'][number];
type PayrollRunPayslip = NonNullable<EmployeeResult['payslip']>;

export const useDocumentTableRow = (): DocumentRow => {
  const { openModal } = useReportModalNavigation();
  const { run } = useCurrentPayrollRun();
  const { build } = useYTDReport();

  return {
    name: 'YTD Report',
    type: 'Report',
    preview: () => {
      openModal(ID);
    },
    download: () => {
      if (!run) return;
      const { columns, rows, key } = build();
      downloadTableAsCSV({ columns, rows }, `${key}.csv`);
    },
  };
};

const toFloat = (num: string, fallback = 0) => {
  const number = parseFloat(num);
  return isNaN(number) ? fallback : number;
};
const toSum = (sum = 0, current = '0') => sum + toFloat(current, 0);

// TODO: add 'previousYtdTaxResults' in both BE and FE
type TaxProps = keyof Pick<
  PayrollRunPayslip,
  'taxResults' | 'ytdTaxResults' | 'previousYtdTaxResults'
>;
// TODO: https://gitlab.personio-internal.de/personio/payroll/international-service/-/merge_requests/736
type SumProp = Exclude<keyof PayrollRunPayslip[TaxProps][number], 'tax'>;
const makeSumTaxBy =
  (empResults: EmployeeResult[]) =>
  (taxProp: TaxProps, type: string, sumProp: SumProp) =>
    empResults
      ?.map((emp) => emp.payslip)
      .flatMap((payslip) => payslip?.[taxProp])
      // TODO: https://gitlab.personio-internal.de/personio/payroll/international-service/-/merge_requests/736
      .filter((prop) => (prop?.tax as unknown as string) === type)
      .map((taxPeriod) => taxPeriod?.[sumProp])
      .reduce(toSum, 0)
      .toString();

type AccProps = keyof Pick<
  PayrollRunPayslip,
  'accumulators' | 'ytdAccumulators'
>;
const makeSumAccBy =
  (empResults: EmployeeResult[]) => (accProp: AccProps, sumProp: string) =>
    empResults
      .map((emp) => emp.payslip)
      .map((payslip) => payslip?.[accProp][sumProp])
      .reduce(toSum, 0)
      .toString();

const makeSumPayBy = (empResults: EmployeeResult[]) => (type: string) =>
  empResults
    .map((emp) => emp.payslip)
    .flatMap((payslip) => payslip?.payments)
    .filter((payment) => payment?.description === type)
    .map((payment) => payment?.amount)
    .reduce(toSum, 0)
    .toString();

const tableColumnsConfig: ReportTableColumn<RowData>[] = [
  {
    id: 'item',
    header: '',
    accessor: (rowData) => rowData.rowTitle,
  },
  {
    id: 'BFWD-YTD',
    header: 'BFWD YTD',
    type: 'currency',
    accessor: (rowData) => ({
      currency: 'EUR',
      value: rowData.BFWDTValue,
    }),
  },
  {
    id: 'currentPeriodValues',
    header: 'This period values',
    type: 'currency',
    accessor: (rowData) => ({
      currency: 'EUR',
      value: rowData.CurrentValue,
    }),
  },
  {
    id: 'CFWD-YTD',
    header: 'CFWD YTD',
    type: 'currency',
    accessor: (rowData) => ({
      currency: 'EUR',
      value: rowData.CFWDValue,
    }),
  },
];

const useYTDReport = (): { build: () => ReportTableArgs<RowData> } => {
  const { legalEntityId } = useGbNavigation();
  const { run, isFetching: isPayRunLoading } = useCurrentPayrollRun();
  const { compensationSchemas, isFetching: isCompSchemasLoading } =
    useEmployerCompensationSchemas(legalEntityId);

  const build = () => {
    const reportTableArgs: ReportTableArgs<RowData> = {
      columns: tableColumnsConfig,
      // rows: reportData,
      rows: [],
      isLoading: isPayRunLoading || isCompSchemasLoading,
      title: `YDT-Report-${run?.taxYear}_${run?.period}`,
      key: `${run?.legalEntityId}_${run?.payGroupId}_report_${ID}_${run?.taxYear}_${run?.period}`,
    };

    if (!run) return reportTableArgs;

    const sumTaxBy = makeSumTaxBy(run.employeeResults);
    const sumAccBy = makeSumAccBy(run.employeeResults);
    const sumPayBy = makeSumPayBy(run.employeeResults);
    const rows: RowData[] = [
      {
        rowTitle: 'Taxable Pay',
        BFWDTValue: '',
        CurrentValue: sumTaxBy('taxResults', 'PAYE', 'taxablePay'),
        CFWDValue: sumTaxBy('ytdTaxResults', 'PAYE', 'taxablePay'),
      },
      {
        rowTitle: 'Tax Payed',
        BFWDTValue: '',
        CurrentValue: sumTaxBy('taxResults', 'PAYE', 'employeeContribution'),
        CFWDValue: sumTaxBy('ytdTaxResults', 'PAYE', 'employeeContribution'),
      },
      {
        rowTitle: 'Niable Pay',
        BFWDTValue: '',
        CurrentValue: sumTaxBy('taxResults', 'NI', 'taxablePay'),
        CFWDValue: sumTaxBy('ytdTaxResults', 'NI', 'taxablePay'),
      },
      {
        rowTitle: 'NI EES',
        BFWDTValue: '',
        CurrentValue: sumTaxBy('taxResults', 'NI', 'employeeContribution'),
        CFWDValue: sumTaxBy('ytdTaxResults', 'NI', 'employeeContribution'),
      },
      {
        rowTitle: 'NI ERS',
        BFWDTValue: '',
        CurrentValue: sumTaxBy('taxResults', 'NI', 'employerContribution'),
        CFWDValue: sumTaxBy('ytdTaxResults', 'NI', 'employerContribution'),
      },
      {
        rowTitle: 'Student Loan',
        BFWDTValue: '',
        CurrentValue: sumAccBy('accumulators', 'STUDENT_LOAN'),
        CFWDValue: sumAccBy('ytdAccumulators', 'STUDENT_LOAN'),
      },
      {
        rowTitle: 'Post Graduate Loan',
        BFWDTValue: '',
        CurrentValue: sumAccBy('accumulators', 'POSTGRADUATE_LOAN'),
        CFWDValue: sumAccBy('ytdAccumulators', 'POSTGRADUATE_LOAN'),
      },
    ];

    const comps = compensationSchemas?.data.map<RowData>(({ description }) => ({
      rowTitle: description,
      BFWDTValue: '-',
      CurrentValue: sumPayBy(description),
      CFWDValue: '-',
    }));

    reportTableArgs.rows = rows.concat(comps ?? []);
    return reportTableArgs;
  };

  return { build };
};

export const YTDReport = () => {
  const { closeModal } = useReportModalNavigation();
  const { build } = useYTDReport();
  const { title, columns, rows, key, isLoading } = build();

  return (
    <ReportModal
      title={title}
      onClose={closeModal}
      downloadCSVAction={() =>
        downloadTableAsCSV({ columns, rows }, `${key}.csv`)
      }
    >
      <ReportTable
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        pageSize={100}
      />
    </ReportModal>
  );
};
