import {
  type FetchLegalEntityDataData,
  type ListPayGroupsData,
} from '@personio-web/payroll-data-payroll-me-types';
import { useGbNavigation } from '../../hooks/usePayrollGbBreadcrumbsNavigation';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import { useCurrentPayrollGroup } from '../../data/useCurrentPayrollGroup';
import { useReportModalNavigation } from './components/useReportModalNavigation';
import { downloadTableAsCSV } from './components/downloadTableAsCSV';
import { useLegalEntityData } from '../../data/useLegalEntityData';
import { type DocumentRow } from '../../components/DocumentsTable/columns';
import { type PayrollRun } from '../../utils/payrollRun';
import { ReportModal } from './components/ReportModal';
import {
  ReportTable,
  type ReportTableColumn,
  type ReportTableArgs,
} from './components/ReportTable';

export const ID = 'hmrc-p32';
type RowData = {
  rowTitle: string;
  value: string;
};
type EmployeeResult = PayrollRun['employeeResults'][number];
type PayrollRunPayslip = NonNullable<EmployeeResult['payslip']>;

export const useDocumentTableRow = (): DocumentRow => {
  const { build } = useHMRCP32Report();
  const { run } = useCurrentPayrollRun();
  const { openModal } = useReportModalNavigation();

  return {
    name: 'HMRC P32',
    type: 'Report',
    preview: () => openModal(ID),
    download: () => {
      if (!run) return;
      const { columns, rows, key } = build();
      downloadTableAsCSV({ columns, rows }, `${key}.csv`);
    },
  };
};

const tableColumnsConfig: ReportTableColumn<RowData>[] = [
  {
    id: 'item',
    header: 'Title',
    accessor: (rowData) => rowData.rowTitle,
  },
  {
    id: 'value',
    header: 'Value',
    type: 'string',
    accessor: (rowData) => rowData.value,
  },
];

const toFloat = (num: string, fallback = 0) => {
  const number = parseFloat(num);
  return isNaN(number) ? fallback : number;
};
const toSum = (sum = 0, current = '0') => sum + toFloat(current, 0);

const getPayeRefNumber = (
  configData: FetchLegalEntityDataData['configurationData'],
): string =>
  configData.find(({ key }) => key === 'UK_PAYE_REFERENCE_NUMBER')?.value ?? '';

const getTaxPeriod = (periodNumber?: number, yearNumber?: number): string =>
  [periodNumber?.toString().padStart(2, '0'), yearNumber].join('/');

const makeSumAccBy = (empResults: EmployeeResult[]) => (sumProp: string) =>
  empResults
    .map((emp) => emp.payslip)
    .map((payslip) => payslip?.accumulators?.[sumProp])
    .reduce(toSum, 0)
    .toString();

type SumProp = keyof PayrollRunPayslip['taxResults'][number];
const makeSumTaxBy =
  (empResults: EmployeeResult[]) => (type: string, sumProp: SumProp) =>
    empResults
      .flatMap((emp) => emp.payslip?.taxResults)
      .filter((prop) => prop?.tax === type)
      .map((taxPeriod) => taxPeriod?.[sumProp])
      .reduce(toSum, 0)
      .toString();

const makeSumDeductionBy = (empResults: EmployeeResult[]) => (type: string) =>
  empResults
    .flatMap((emp) => emp.payslip?.deductions)
    .filter((deduction) => deduction?.description === type)
    .map((deduction) => deduction?.amount)
    .reduce(toSum, 0)
    .toString();

const useHMRCP32Report = (): { build: () => ReportTableArgs<RowData> } => {
  const { period } = useGbNavigation();
  const { run, isFetching: isPayRunLoading } = useCurrentPayrollRun();
  const { configurationData, isLoading: isLEConfigLoading } =
    useLegalEntityData();

  const build = () => {
    const reportTableArgs: ReportTableArgs<RowData> = {
      columns: tableColumnsConfig,
      rows: [],
      isLoading: isPayRunLoading || isLEConfigLoading,
      title: `HMRC-P32-Report-${run?.taxYear}_${run?.period}`,
      key: `${run?.legalEntityId}_${run?.payGroupId}_report_${ID}_${run?.taxYear}_${run?.period}`,
    };

    if (!run || !configurationData) return reportTableArgs;

    const sumAccBy = makeSumAccBy(run.employeeResults);
    const sumTaxBy = makeSumTaxBy(run.employeeResults);
    const sumDedBy = makeSumDeductionBy(run.employeeResults);

    const accumulators = [
      sumDedBy('PAYE'),
      sumAccBy('STUDENT_LOAN'),
      sumAccBy('POSTGRADUATE_LOAN'),
    ] as const;

    const taxPays = [
      sumTaxBy('NI', 'employeeContribution'),
      sumTaxBy('NI', 'employerContribution'),
      '0', // TODO: TaxPayment: https://docs.google.com/spreadsheets/d/1kuRspZ9l8vQdcHIIQVQq51fNeuoWXJhjwVJdREwIEsk/edit?disco=AAABVJeDGrA
    ] as const;

    const rows: RowData[] = [
      { rowTitle: 'Tax reference', value: getPayeRefNumber(configurationData) },
      { rowTitle: 'Tax period', value: getTaxPeriod(period, run.taxYear) },
      { rowTitle: ' ', value: ' ' },
      { rowTitle: 'Tax', value: accumulators[0] },
      { rowTitle: 'Student Loan', value: accumulators[1] },
      { rowTitle: 'Post Graduate Loan', value: accumulators[2] },
      { rowTitle: 'Total', value: accumulators.reduce(toSum, 0).toString() },
      { rowTitle: ' ', value: ' ' },
      { rowTitle: 'Employee NI', value: taxPays[0] },
      { rowTitle: 'Employer NI', value: taxPays[1] },
      { rowTitle: 'Employment allowance used', value: taxPays[2] },
      { rowTitle: 'Total', value: taxPays.reduce(toSum, 0).toString() },
      { rowTitle: ' ', value: ' ' },
      // TODO: TaxPayment: https://docs.google.com/spreadsheets/d/1kuRspZ9l8vQdcHIIQVQq51fNeuoWXJhjwVJdREwIEsk/edit?disco=AAABVJeDGrA
      { rowTitle: 'Statutory recoverables', value: '-' },
      { rowTitle: 'SMP Recovered', value: '-' },
      { rowTitle: 'SMP Compensation', value: '-' },
      { rowTitle: 'SAP Recovered', value: '-' },
      { rowTitle: 'SAP Compensation', value: '-' },
      { rowTitle: 'SPP Recovered', value: '-' },
      { rowTitle: 'SPP Compensation', value: '-' },
      { rowTitle: 'SPL Recovered', value: '-' },
      { rowTitle: 'SPL Compensation', value: '-' },
      { rowTitle: 'SPBP Recovered', value: '-' },
      { rowTitle: 'SPBP Compensation', value: '-' },
    ];

    reportTableArgs.rows = rows;
    return reportTableArgs;
  };
  return { build };
};

export const HMRCP32Report = () => {
  const { closeModal } = useReportModalNavigation();
  const { build } = useHMRCP32Report();
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
