import { useState } from 'react';
import { getLocale } from '@personio-web/i18n';
import { Select } from 'designSystem/component/select';
import { FormField } from 'designSystem/component/form-field';
import { Inline } from 'designSystem/component/layout';
import {
  useTable,
  Table,
  TableCell,
  type ColumnConfig,
} from 'designSystem/component/table';
import {
  type ListPayrollRunsData,
  type ListSystemCompensationSchemasData,
} from '@personio-web/payroll-data-payroll-me';
import type { DocumentRow } from '../../components/DocumentsTable/columns';
import { type ReportModalData } from './components/ReportModal';
import { useReportModalNavigation } from './components/useReportModalNavigation';
import { usePayrollRuns } from './hooks/usePayrollRuns';
import { useGbNavigation } from '../../hooks/usePayrollGbBreadcrumbsNavigation';
import { useEmployerCompensationSchemas } from '../../components/ManageTab/CompensationTab/useEmployerCompensationSchemas';

export const REPORT_ID = 'differences-rec';

type DiffRecReportRow = {
  compensationType: ListSystemCompensationSchemasData['data'][number]['schemaType'];
  compensation: string;
  selectedPeriodValue: unknown;
  currentPeriodValue: unknown;
  difference: unknown;
  varianceExpectations: number;
};

export const useDifferencesRecReportDocumentRow = (): DocumentRow => {
  const { openModal } = useReportModalNavigation();

  return {
    name: 'Differences Rec Report',
    type: 'Report',
    preview: () => {
      openModal(REPORT_ID);
    },
  };
};

export const useDifferencesRecReportModalData = (): ReportModalData | null => {
  const { getActiveReport } = useReportModalNavigation();
  if (getActiveReport() !== REPORT_ID) return null;
  return {
    title: 'Differences Rec Report',
    key: 'differences-rec',
    content: <DifferencesRecReport />,
  };
};

const getPeriodName = (period: ListPayrollRunsData['data'][number]) =>
  period.payDate
    ? Intl.DateTimeFormat(getLocale(), {
        month: 'long',
        year: 'numeric',
      }).format(new Date(date))
    : '';

const getPayRunByPeriod = (
  runs?: ListPayrollRunsData['data'],
  period?: number,
) => runs?.find((run) => run.period === period);

const filterOutPeriod = (runs?: ListPayrollRunsData['data'], period?: number) =>
  runs?.filter((run) => run.period !== period);

const sumCompensationsOfType = (
  payrun?: ListPayrollRunsData['data'][number],
  type?: DiffRecReportRow['compensationType'],
) =>
  payrun?.employeeResults.reduce(
    (acc, emp) =>
      acc +
      Number.parseFloat(
        emp.payslip?.payments.find(({ systemType }) => systemType === type)
          ?.amount ?? '0',
      ),
    0,
  ) ?? 0;

const reportColumns = (
  selectedPeriod: string,
  currentPeriod: string,
): ColumnConfig<DiffRecReportRow, unknown>[] => [
  {
    id: 'compensation',
    header: 'Compensation',
    accessor: (row) => row.compensation,
    cell: ({ value }) => <TableCell.Text value={value as string} />,
  },
  {
    id: 'selectedPeriodValue',
    header: selectedPeriod,
    accessor: () => undefined,
    cell: ({ row }) => (
      <TableCell.Number value={row.selectedPeriodValue as number} />
    ),
  },
  {
    id: 'currentPeriodValue',
    accessor: () => currentPeriod,
    header: currentPeriod,
    cell: ({ row }) => (
      <TableCell.Number value={row.currentPeriodValue as number} />
    ),
  },
  {
    id: 'difference',
    accessor: (row) => row.difference,
    cell: ({ value }) => <TableCell.Number value={value as number} />,
  },
  {
    id: 'varianceExpectations',
    accessor: (row) => row.varianceExpectations,
    cell: ({ value }) => <TableCell.Number value={value as number} />,
  },
];

const DifferencesRecReport = () => {
  const { payrollRuns, isFetching: isPayRunLoading } = usePayrollRuns();
  const { period = 0, legalEntityId } = useGbNavigation();
  const { compensationSchemas, isFetching: isCompSchemasLoading } =
    useEmployerCompensationSchemas(legalEntityId);
  const table = useTable();
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>();

  const reportData: DiffRecReportRow[] =
    compensationSchemas?.data.map((schema) => {
      const currentPeriodValue = sumCompensationsOfType(
        getPayRunByPeriod(payrollRuns?.data, period),
        schema.systemSchemaType,
      );
      const selectedPeriodValue = sumCompensationsOfType(
        getPayRunByPeriod(payrollRuns?.data, period),
        schema.systemSchemaType,
      );
      return {
        compensationType: schema.systemSchemaType,
        compensation: schema.description,
        currentPeriodValue,
        selectedPeriodValue,
        difference: currentPeriodValue - selectedPeriodValue,
        varianceExpectations: 0,
      };
    }) ?? [];

  return (
    <>
      <Inline space="gap-default">
        <FormField.Select
          title="Comparison Period"
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
        >
          <Select.TriggerValue placeholder="Comparison Period" />
          <Select.Viewport>
            {filterOutPeriod(payrollRuns?.data, period)?.map((run) => (
              <Select.Item value={run.period.toString()}>
                {getPeriodName(run.payDate)}
              </Select.Item>
            ))}
          </Select.Viewport>
        </FormField.Select>
        <FormField.Input
          disabled
          title="Current Period"
          value={getPeriodName(
            getPayRunByPeriod(payrollRuns?.data, period)?.payDate,
          )}
        />
      </Inline>
      <Table
        table={table}
        isLoading={isPayRunLoading || isCompSchemasLoading}
        columnConfig={reportColumns(
          getPeriodName(
            getPayRunByPeriod(
              payrollRuns?.data,
              selectedPeriod ? Number(selectedPeriod) : undefined,
            )?.payDate,
          ),
          getPeriodName(getPayRunByPeriod(payrollRuns?.data, period)?.payDate),
        )}
        getRowId={(row) => row.compensationType}
        data={reportData}
      />
    </>
  );
};
