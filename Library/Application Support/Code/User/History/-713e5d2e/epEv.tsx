import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getPersonioTranslation } from '@personio-web/config-jest/helpers';
import { PayrollModalLayout } from '../PayrollModalLayout';

describe('PayrollModalLayout', () => {
  const onClose = jest.fn();

  it('should render the layout with the correct title', () => {
    render(<PayrollModalLayout title="Test Modal" onClose={onClose} />);
    expect(
      screen.getByRole('heading', { name: 'Test Modal' }),
    ).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    const { t: tDS } = getPersonioTranslation('design-system');
    render(<PayrollModalLayout title="Test Modal" onClose={onClose} />);
    userEvent.click(
      screen.getByRole('button', {
        name: tDS('page.navigation-bar.close-aria-label'),
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render children content inside the modal', () => {
    render(
      <PayrollModalLayout title="Test Modal" onClose={onClose}>
        <div>Child Content</div>
      </PayrollModalLayout>,
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
