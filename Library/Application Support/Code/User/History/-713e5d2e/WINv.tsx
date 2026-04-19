import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PayrollModalLayout } from '../PayrollModalLayout';

describe('PayrollModalLayout', () => {
  it('should render the modal with the correct title', () => {
    render(<PayrollModalLayout title="Test Modal" />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    render(<PayrollModalLayout title="Test Modal" onClose={onClose} />);
    userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render children content inside the modal', () => {
    render(
      <PayrollModalLayout title="Test Modal">
        <div>Child Content</div>
      </PayrollModalLayout>,
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should not render the modal when isOpen is false', () => {
    render(<PayrollModalLayout title="Test Modal" isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should render the modal when isOpen is true', () => {
    render(<PayrollModalLayout title="Test Modal" isOpen={true} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });
});
