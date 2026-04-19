import { useState, useEffect } from 'react';
import { useRenderEmployeePayslip } from '@personio-web/payroll-data-payroll-me';
import { renderEmployeePayslipAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { icons } from 'designSystem/component/icon';
import { Table, TableCell, useTable } from 'designSystem/component/table';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import {
  useGetDefaultHeaders,
  useWrapMutation,
} from '../../hooks/temporary/useWrapQuery';
import { DocumentPreview } from '../../features/DocumentPreview';
import {
  payrollRunEmployeeError,
  payrollRunEmployeeFullname,
} from '../../utils/payrollRun';
import { BasicEmployeeSidepanel } from '../../../../components/BasicEmployeeSidepanel/BasicEmployeeSidepanel';
import { ListEmployeePensions } from './EmployeePensions/ListEmployeePensions';
import { usePayrollRunNavigation } from './usePayrollRunNavigation';

const useDownloadPayslip = () => {
  const { mutateAsync } = useWrapMutation(
    useRenderEmployeePayslip,
    renderEmployeePayslipAPI,
    { responseType: 'blob' }, // TODO: How to fix responseType inside request-sync's useRenderEmployeePayslip?
  );
  const defaultHeaders = useGetDefaultHeaders();

  return async (
    payslipId: string,
    employeeId: string,
    performDownload = true,
  ): Promise<string> => {
    const data = await mutateAsync({
      requestPathParams: {
        payslipId: payslipId,
        employeeId: Number(employeeId),
      },
      requestHeaders: defaultHeaders,
      responseType: 'blob',
    });

    const file = new Blob([data], { type: 'application/pdf' });
    const referenceURL = URL.createObjectURL(file);
    if (performDownload) {
      const link = document.createElement('a');
      link.href = referenceURL;
      link.download = `Payslip_preview_${employeeId}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Clean up after download
      document.body.removeChild(link);
      URL.revokeObjectURL(referenceURL);
    }
    return referenceURL;
  };
};

export const PayrollRunTab = () => {
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const { navigateToEmployee, navigateToListing, activeEmployeeId } =
    usePayrollRunNavigation();
  const { run, isFetching } = useCurrentPayrollRun();

  useEffect(() => {
    const metaTag = document.createElement('meta');
    metaTag.httpEquiv = 'Content-Security-Policy';
    metaTag.content =
      "frame-src 'self' blob: https://*.personio.de http://localhost:*;";

    document.head.appendChild(metaTag);
    return () => {
      document.head.removeChild(metaTag);
    };
  }, []);

  // `filters: []` is here to suppress `Warn trace: `useCustomCompareEffect` should not be used
  // with dependencies that are all primitive values. Use React.useEffect instead.`,
  // which is raised by Table component in unit tests
  const table = useTable({ state: { filters: [] } });

  const downloadSlip = useDownloadPayslip();
  const handlePreviewClose = () => {
    URL.revokeObjectURL(previewFile as string);
    setPreviewFile(null);
  };

  return (
    <div data-test-id="gb-payroll-run-tab">
      <Table
        table={table}
        pinnedColumns={1}
        getRowId={(row) => String(row.employeeId)}
        columnConfig={[
          {
            id: 'employeeId',
            header: 'Employee ID',
            accessor: (row) => String(row.employeeId),
            cell: ({ value: employeeId }) => {
              return (
                <TableCell.Link
                  value={employeeId}
                  onClick={() => navigateToEmployee(employeeId)}
                />
              );
            },
            columnSize: 'small',
          },
          {
            id: 'employee',
            header: 'Person',
            accessor: (emp) => payrollRunEmployeeFullname(emp.employee),
            cell: ({ value: name }) => {
              return <TableCell.Text value={name} />;
            },
            columnSize: 'medium',
          },
          {
            id: 'grossPay',
            header: 'Gross pay',
            accessor: (row) => String(row.payslip?.grossPay ?? ''),
            cell: ({ value }) => {
              return (
                <TableCell.Currency
                  value={Number(value)}
                  currency={'GBP'}
                  locale={'en-GB'}
                  {...(Number(value) === 0 && {
                    tooltip: {
                      content: 'Empty value',
                      variant: 'warning',
                    },
                  })}
                />
              );
            },
            columnSize: 'small',
          },
          {
            id: 'payDue',
            header: 'Pay due',
            accessor: (row) => String(row.payslip?.netPay ?? ''),
            cell: ({ value }) => {
              return (
                <TableCell.Currency
                  value={Number(value)}
                  currency={'GBP'}
                  locale={'en-GB'}
                  {...(Number(value) === 0 && {
                    tooltip: {
                      content: 'Empty value',
                      variant: 'warning',
                    },
                  })}
                />
              );
            },
            columnSize: 'small',
          },
          {
            id: 'payslipPreview',
            header: 'Payslip',
            accessor: () => '',
            cell: ({ row: employeeResult }) => {
              return (
                <TableCell.Button
                  value="Preview"
                  icon={icons.eye}
                  disabled={!run?.id}
                  onClick={async () => {
                    const fileUrl = await downloadSlip(
                      employeeResult.payslip?.id ?? '',
                      String(employeeResult.employeeId),
                      false,
                    );
                    setPreviewFile(fileUrl);
                  }}
                />
              );
            },
            columnSize: 'small',
          },
          {
            id: 'messages',
            header: 'Messages',
            accessor: (row) => payrollRunEmployeeError(row),
            cell: ({ value: errorMessage }) => (
              <TableCell.Text
                value={errorMessage ?? 'Successful'}
                icon={
                  errorMessage
                    ? icons.exclamationMarkTriangle
                    : icons.checkmarkCircleFilled
                }
              />
            ),
            columnSize: 'large',
          },
        ]}
        isLoading={isFetching}
        data={run?.employeeResults ?? []}
      />
      <DocumentPreview documentUrl={previewFile} onClose={handlePreviewClose} />
      <BasicEmployeeSidepanel
        employeeId={activeEmployeeId}
        onClose={navigateToListing}
      >
        <ListEmployeePensions employeeId={activeEmployeeId} />
      </BasicEmployeeSidepanel>
    </div>
  );
};
