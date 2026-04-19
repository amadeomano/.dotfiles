import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageModalLayout from '../PageModalLayout';

describe('PageModalLayout', () => {
  it('should render the modal with the correct title', () => {
    render(<PageModalLayout title="Test Modal" />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    render(<PageModalLayout title="Test Modal" onClose={onClose} />);
    userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render children content inside the modal', () => {
    render(
      <PageModalLayout title="Test Modal">
        <div>Child Content</div>
      </PageModalLayout>,
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should not render the modal when isOpen is false', () => {
    render(<PageModalLayout title="Test Modal" isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should render the modal when isOpen is true', () => {
    render(<PageModalLayout title="Test Modal" isOpen={true} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });
});
