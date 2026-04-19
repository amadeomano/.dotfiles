import React from 'react';
import { render } from '@testing-library/react';
import { ParallelModeStatus } from './ParallelModeStatus'; // Adjust the import path as necessary
import { useParallelMode } from '../../hooks/useParallelMode';
import { LocalBanner } from 'designSystem/component/local-banner';

// Mock the useParallelMode hook
jest.mock('../../hooks/useParallelMode');

describe('ParallelModeStatus', () => {
  const mockUseParallelMode = useParallelMode as jest.MockedFunction<
    typeof useParallelMode
  >;

  it('should render null if mode or status is not present', () => {
    mockUseParallelMode.mockReturnValue({ mode: null, status: null });
    const { container } = render(<ParallelModeStatus />);
    expect(container.firstChild).toBeNull();
  });

  it('should render null if mode is LIVE and status is LIVE_ACKNOWLEDGED', () => {
    mockUseParallelMode.mockReturnValue({
      mode: 'LIVE',
      status: 'LIVE_ACKNOWLEDGED',
    });
    const { container } = render(<ParallelModeStatus />);
    expect(container.firstChild).toBeNull();
  });

  it('should render LocalBanner with correct props for mode LIVE and status LIVE_GRANTED', () => {
    mockUseParallelMode.mockReturnValue({
      mode: 'LIVE',
      status: 'LIVE_GRANTED',
    });
    const { getByText } = render(<ParallelModeStatus />);

    // Check that the correct title and body are displayed
    expect(
      getByText('Congratulations! Everest Group LTD payroll is live '),
    ).toBeInTheDocument();
    expect(
      getByText(
        'Once you approve a payroll run we’ll distribute documents to employees and report data to HMRC',
      ),
    ).toBeInTheDocument();
  });

  it('should render LocalBanner with correct props for mode PARALLEL and status IDLE', () => {
    mockUseParallelMode.mockReturnValue({ mode: 'PARALLEL', status: 'IDLE' });
    const { getByText } = render(<ParallelModeStatus />);

    // Check that the correct title and body are displayed
    expect(getByText('Legal entity in parallel run')).toBeInTheDocument();
    expect(
      getByText(
        'Try and compare Personio Payroll with your current payroll provider using real data. No documents will be distributed and no data will be reported to third parties',
      ),
    ).toBeInTheDocument();
  });

  // Add more tests for other combinations of mode and status as needed
});
