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
import { ReportModal } from './components/ReportModal';
import { useReportModalNavigation } from './components/useReportModalNavigation';
import { usePayrollRuns } from './hooks/usePayrollRuns';
import { useGbNavigation } from '../../hooks/usePayrollGbBreadcrumbsNavigation';
import { useEmployerCompensationSchemas } from '../../components/ManageTab/CompensationTab/useEmployerCompensationSchemas';

export const ID = 'differences-rec';

type DiffRecReportRow = {
  compensationType: ListSystemCompensationSchemasData['data'][number]['schemaType'];
  compensation: string;
  selectedPeriodValue: unknown;
  currentPeriodValue: unknown;
  difference: unknown;
  varianceExpectations: number;
};

export const useDocumentTableRow = (): DocumentRow => {
  const { openModal } = useReportModalNavigation();

  return {
    name: 'Differences Rec Report',
    type: 'Report',
    preview: () => openModal(ID),
  };
};

const getPeriodName = (payRun?: ListPayrollRunsData['data'][number]) =>
  payRun?.payDate
    ? Intl.DateTimeFormat(getLocale(), {
        month: 'long',
        year: 'numeric',
      }).format(new Date(payRun.payDate))
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

const getReportColumns = (
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
    header: `Selected: ${selectedPeriod}`,
    columnSize: 'small',
    accessor: () => undefined,
    cell: ({ row }) => (
      <TableCell.Number value={row.selectedPeriodValue as number} />
    ),
  },
  {
    id: 'currentPeriodValue',
    accessor: () => `Current: ${currentPeriod}`,
    header: currentPeriod,
    columnSize: 'small',
    cell: ({ row }) => (
      <TableCell.Number value={row.currentPeriodValue as number} />
    ),
  },
  {
    id: 'difference',
    header: 'Difference',
    columnSize: 'small',
    accessor: (row) => row.difference,
    cell: ({ value }) => <TableCell.Number value={value as number} />,
  },
  {
    id: 'varianceExpectations',
    header: 'Variance Expectations',
    columnSize: 'small',
    accessor: (row) => row.varianceExpectations,
    cell: ({ value }) => <TableCell.Number value={value as number} />,
  },
];

export const DifferencesRecReport = () => {
  const { payrollRuns, isFetching: isPayRunLoading } = usePayrollRuns();
  const { period = 0, legalEntityId } = useGbNavigation();
  const { compensationSchemas, isFetching: isCompSchemasLoading } =
    useEmployerCompensationSchemas(legalEntityId);
  const table = useTable();
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>();
  const { closeModal } = useReportModalNavigation();

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
    <ReportModal title="Differences Rec Report" onClose={closeModal}>
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
                {getPeriodName(run)}
              </Select.Item>
            ))}
          </Select.Viewport>
        </FormField.Select>
        <FormField.Input
          disabled
          title="Current Period"
          value={getPeriodName(getPayRunByPeriod(payrollRuns?.data, period))}
        />
      </Inline>
      <Table
        table={table}
        isLoading={isPayRunLoading || isCompSchemasLoading}
        columnConfig={getReportColumns(
          getPeriodName(
            getPayRunByPeriod(
              payrollRuns?.data,
              selectedPeriod ? Number(selectedPeriod) : undefined,
            ),
          ),
          getPeriodName(getPayRunByPeriod(payrollRuns?.data, period)),
        )}
        getRowId={(row) => row.compensationType}
        data={reportData}
      />
    </ReportModal>
  );
};
