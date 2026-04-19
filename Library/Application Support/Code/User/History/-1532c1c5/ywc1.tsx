import type { DocumentRow } from '../../tabs/DocumentsTab/tableConfig';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import { ReportModal } from './components/ReportModal';
import { useEmployerCompensationSchemas } from '../../tabs/ManageTab/CompensationTab/useEmployerCompensationSchemas';
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

type TaxProps = keyof Pick<
  PayrollRunPayslip,
  'taxResults' | 'ytdTaxResults' | 'previousYtdTaxResults'
>;
type SummableProp = keyof PayrollRunPayslip[TaxProps][number];
type TaxType = PayrollRunPayslip[TaxProps][number]['tax'];
const makeSumTaxBy =
  (empResults: EmployeeResult[]) =>
  (taxProp: TaxProps, taxType: TaxType, summableProp: SummableProp) =>
    empResults
      .flatMap((emp) => emp.payslip?.[taxProp])
      .filter((prop) => prop?.tax === taxType)
      .map((taxPeriod) => taxPeriod?.[summableProp])
      .reduce(toSum, 0)
      .toString();

type AccProps = keyof Pick<
  PayrollRunPayslip,
  'accumulators' | 'ytdAccumulators' | 'previousYtdAccumulators'
>;
const makeSumAccBy =
  (empResults: EmployeeResult[]) => (accProp: AccProps, summableProp: string) =>
    empResults
      .map((emp) => emp.payslip)
      .map((payslip) => payslip?.[accProp]?.[summableProp])
      .reduce(toSum, 0)
      .toString();

const makeSumPayBy = (empResults: EmployeeResult[]) => (type: string) =>
  empResults
    .flatMap((emp) => emp.payslip?.payments)
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
        BFWDTValue: sumTaxBy('previousYtdTaxResults', 'PAYE', 'taxablePay'),
        CurrentValue: sumTaxBy('taxResults', 'PAYE', 'taxablePay'),
        CFWDValue: sumTaxBy('ytdTaxResults', 'PAYE', 'taxablePay'),
      },
      {
        rowTitle: 'Tax Payed',
        BFWDTValue: sumTaxBy(
          'previousYtdTaxResults',
          'PAYE',
          'employeeContribution',
        ),
        CurrentValue: sumTaxBy('taxResults', 'PAYE', 'employeeContribution'),
        CFWDValue: sumTaxBy('ytdTaxResults', 'PAYE', 'employeeContribution'),
      },
      {
        rowTitle: 'Niable Pay',
        BFWDTValue: sumTaxBy('previousYtdTaxResults', 'NI', 'taxablePay'),
        CurrentValue: sumTaxBy('taxResults', 'NI', 'taxablePay'),
        CFWDValue: sumTaxBy('ytdTaxResults', 'NI', 'taxablePay'),
      },
      {
        rowTitle: 'NI EES',
        BFWDTValue: sumTaxBy(
          'previousYtdTaxResults',
          'NI',
          'employeeContribution',
        ),
        CurrentValue: sumTaxBy('taxResults', 'NI', 'employeeContribution'),
        CFWDValue: sumTaxBy('ytdTaxResults', 'NI', 'employeeContribution'),
      },
      {
        rowTitle: 'NI ERS',
        BFWDTValue: sumTaxBy(
          'previousYtdTaxResults',
          'NI',
          'employerContribution',
        ),
        CurrentValue: sumTaxBy('taxResults', 'NI', 'employerContribution'),
        CFWDValue: sumTaxBy('ytdTaxResults', 'NI', 'employerContribution'),
      },
      {
        rowTitle: 'Student Loan',
        BFWDTValue: sumAccBy('previousYtdAccumulators', 'STUDENT_LOAN'),
        CurrentValue: sumAccBy('accumulators', 'STUDENT_LOAN'),
        CFWDValue: sumAccBy('ytdAccumulators', 'STUDENT_LOAN'),
      },
      {
        rowTitle: 'Post Graduate Loan',
        BFWDTValue: sumAccBy('previousYtdAccumulators', 'POSTGRADUATE_LOAN'),
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
