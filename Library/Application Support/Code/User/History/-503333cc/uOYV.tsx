import { renderWithWrapper } from '@personio-web/orchestrator-common/test-utils';
import { PayrunApprovalProcessingDialog } from './PayrunApprovalProcessingDialog';
import { useApprovePayrollRun } from '../../hooks/useApprovePayrollRun';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('../../hooks/useApprovePayrollRun');

const onApprovePayrollRunMock = jest.fn();

const props = {
  isOpen: true,
  onClose: onApprovePayrollRunMock,
  payRunId: '1',
};

describe('PayrunApprovalProcessingDialog', () => {
  test('should display the loading screen if the request is ongoing', () => {
    (useApprovePayrollRun as jest.Mock).mockReturnValue({
      isLoading: true,
      status: 'loading',
      approvePayrollRun: onApprovePayrollRunMock,
    });

    renderWithWrapper(<PayrunApprovalProcessingDialog {...props} />);

    expect(
      screen.getByText('This might take a few moments'),
    ).toBeInTheDocument();
  });

  test('should display the error screen if the request fails', () => {
    (useApprovePayrollRun as jest.Mock).mockReturnValue({
      isLoading: false,
      status: 'error',
      approvePayrollRun: onApprovePayrollRunMock,
    });

    renderWithWrapper(<PayrunApprovalProcessingDialog {...props} />);
    const tryAgainButton = screen.getByText('Try again');

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(tryAgainButton).toBeInTheDocument();

    userEvent.click(tryAgainButton);
    expect(onApprovePayrollRunMock).toHaveBeenCalled();
  });

  test('should display the confirmation screen if the request is successful', () => {
    (useApprovePayrollRun as jest.Mock).mockReturnValue({
      isLoading: false,
      status: 'success',
      approvePayrollRun: onApprovePayrollRunMock,
    });

    renderWithWrapper(<PayrunApprovalProcessingDialog {...props} />);
    const viewDocumentsButton = screen.getByText('Payrun succesfully approved');

    expect(viewDocumentsButton).toBeInTheDocument();
  });
});
