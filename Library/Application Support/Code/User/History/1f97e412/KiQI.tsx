import { useGetPayrollSalary } from '@personio-web/payroll-data-preliminary-payroll';

import { DynamicTable } from '../components/DynamicTable/DynamicTable';
import { useCustomizeTableContent } from '../components/DynamicTable/hooks';
import { getStatusEnum } from '../utils';
import { useTranslation } from 'react-i18next';
import { MetaRow } from '../types';
import { useNavigation } from '../../../hooks/useNavigation';
import { useCallback, useMemo } from 'react';
import { BasicEmployeeSidepanel } from '../../../../../components/BasicEmployeeSidepanel/BasicEmployeeSidepanel';

export const SalaryTab = () => {
  const { legalEntity, period, payrollGroup, employeeId, setParams } =
    useNavigation();
  const { data, isLoading, isFetching } = useGetPayrollSalary({
    requestPathParams: { yearAndMonth: period as string },
    requestQuery: {
      subcompanyId: legalEntity as string,
      accountGroup: payrollGroup as string,
    },
  });
  const { t } = useTranslation('payroll');

  const { rows, columns } = useCustomizeTableContent({
    columns: data?.data?.columns,
    rows: data?.data?.rows,
    customColumns: [
      {
        accessor: 'status',
        header: t('payroll-table.header.status'),
        type: 'enum',
        toCell: (row) => getStatusEnum(row.meta as NonNullable<MetaRow>, t),
      },
    ],
  });

  const metas = data?.data?.rows?.map((row) => row.meta) || [];
  const employeeIds =
    metas.map((m) => `${String((m as Record<string, string>).employee_id)}`) ||
    [];

  const onNavigationClicked = (direction: string) => {
    const currentIndex = employeeIds.indexOf(employeeId!);
    const nextEmployeeId =
      employeeIds[currentIndex + (direction == 'forward' ? 1 : -1)];
    setParams({ employeeId: nextEmployeeId });
  };

  const onClose = useCallback(() => {
    setParams({ employeeId: undefined });
  }, [setParams]);

  const onRowClicked = useCallback(
    (metaRow: NonNullable<MetaRow>) => {
      const employeeId = metaRow.employee_id;
      if (employeeId) setParams({ employeeId: String(employeeId) });
    },
    [setParams],
  );

  const enablePreviousButton = employeeIds.indexOf(employeeId!) > 0;
  const enableNextButton =
    employeeIds.indexOf(employeeId!) < employeeIds.length - 1;

  const { columnConfig, records } = useMemo(
    () => ({
      columnConfig: columns,
      records: rows,
    }),
    // check reason at Personal.tsx
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.data?.rows, data?.data?.columns],
  );

  return (
    <div data-test-id="salary-tab">
      <DynamicTable
        columns={columnConfig}
        rows={records}
        totalRecords={data?.meta?.total || 0}
        isLoading={isLoading}
        onRowClick={onRowClicked}
        isFetching={isFetching}
      />
      <BasicEmployeeSidepanel
        employeeId={employeeId}
        onClose={onClose}
        options={{
          controls: {
            moveForward: {
              enabled: enableNextButton,
            },
            moveBack: {
              enabled: enablePreviousButton,
            },
          },
          actions: {
            onMoveForward: () => onNavigationClicked('forward'),
            onMoveBack: () => onNavigationClicked('back'),
          },
        }}
      />
    </div>
  );
};
