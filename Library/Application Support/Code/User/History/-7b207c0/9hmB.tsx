import { render, screen } from '@testing-library/react';
import { ParallelModeStatus } from './ParallelModeStatus';
import * as hook from '../../hooks/useParallelMode';

const mockUseParallelMode = jest.spyOn(hook, 'useParallelMode');

describe('ParallelModeStatus', () => {
  it('should render nothing if mode or status is not present', () => {
    mockUseParallelMode.mockReturnValue({ mode: undefined, status: undefined });
    const { container } = render(<ParallelModeStatus />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing if mode is LIVE and status is LIVE_ACKNOWLEDGED', () => {
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
    render(<ParallelModeStatus />);

    expect(
      screen.getByRole('heading', {
        name: 'Congratulations! Everest Group LTD payroll is live',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Once you approve a payroll run we’ll distribute documents to employees and report data to HMRC',
      ),
    ).toBeInTheDocument();
  });

  it('should render LocalBanner with correct props for mode PARALLEL and status IDLE', () => {
    mockUseParallelMode.mockReturnValue({ mode: 'PARALLEL', status: 'IDLE' });
    render(<ParallelModeStatus />);

    // Check that the correct title and body are displayed
    expect(
      screen.getByRole('heading', 'Legal entity in parallel run'),
    ).toBeInTheDocument();
    expect(
      getByText(
        'Try and compare Personio Payroll with your current payroll provider using real data. No documents will be distributed and no data will be reported to third parties',
      ),
    ).toBeInTheDocument();
  });

  // Add more tests for other combinations of mode and status as needed
});
