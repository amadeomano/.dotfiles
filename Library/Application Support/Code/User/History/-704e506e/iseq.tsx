import { useGetPayrollPersonal } from '@personio-web/payroll-data-preliminary-payroll';
import { useNavigation } from '../../../hooks/useNavigation';
import { DynamicTable } from '../components/DynamicTable/DynamicTable';
import { useCustomizeTableContent } from '../components/DynamicTable/hooks';
import { BasicEmployeeSidepanel } from '../../../../../components/BasicEmployeeSidepanel/BasicEmployeeSidepanel';
import { useTranslation } from 'react-i18next';
import { MetaRow } from '../types';
import { getChangesEnum, getStatusEnum } from '../utils';
import { useCallback, useMemo } from 'react';

export const PersonalTab = () => {
  const { legalEntity, payrollGroup, period, employeeId, setParams } =
    useNavigation();
  const employee = employeeId as string;
  const subcompanyId = legalEntity as string;
  const accountGroup = payrollGroup as string;
  const yearAndMonth = period as string;
  const {
    data,
    isLoading: isLoadingRequest,
    isFetching,
  } = useGetPayrollPersonal({
    requestPathParams: { yearAndMonth },
    requestQuery: {
      subcompanyId,
      accountGroup,
    },
    enabled: Boolean(subcompanyId),
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
  const isLoadingTable = !(subcompanyId && period) || isLoadingRequest;

  const metas = data?.data?.rows?.map((row) => row.meta) || [];
  const employeeIds =
    metas.map((m) => `${String((m as Record<string, string>).employee_id)}`) ||
    [];

  const onNavigationClicked = (direction: string) => {
    const currentIndex = employeeIds.indexOf(employee);
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

  const enablePreviousButton = employeeIds.indexOf(employee) > 0;
  const enableNextButton =
    employeeIds.indexOf(employee) < employeeIds.length - 1;

  const { columnConfig, records } = useMemo(
    () => ({
      columnConfig: columns,
      records: rows,
    }),
    // the exhaustive-deps here doesn't means much because it only looks
    // to functions defined on the same scope. This code has other scopes such as custom hooks
    // because of that, I'm memoizing the whole computation based on "real" input
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.data?.rows, data?.data?.columns],
  );

  return (
    <div data-test-id="personal-tab">
      <DynamicTable
        columns={columnConfig}
        rows={records}
        totalRecords={data?.meta?.total || 0}
        isLoading={isLoadingTable}
        isFetching={isFetching}
        onRowClick={onRowClicked}
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
