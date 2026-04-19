import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getPersonioTranslation } from '@personio-web/config-jest/helpers';
import { PayrollModalLayout } from '..';

describe('PayrollLayout', () => {
  it('renders the title', () => {
    render(<PayrollModalLayout title="Test Title" onClose={jest.fn()} />);
    expect(
      screen.getByRole('heading', { name: 'Test Title' }),
    ).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <PayrollModalLayout title="Test Title" onClose={jest.fn()}>
        <h1>Content</h1>
      </PayrollModalLayout>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    const { t: tDS } = getPersonioTranslation('design-system');
    const onClose = jest.fn();
    render(<PayrollModalLayout title="" onClose={onClose} />);
    userEvent.click(
      screen.getByRole('button', {
        name: tDS('page.navigation-bar.close-aria-label'),
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe('primaryAction Prop', () => {
    const primaryAction = {
      title: 'Primary Action',
      onClick: jest.fn(),
    };

    it('should render the primary action', () => {
      render(
        <PayrollModalLayout
          title=""
          onClose={jest.fn()}
          primaryAction={primaryAction}
        />,
      );
      expect(
        screen.getByRole('button', { name: 'Primary Action' }),
      ).toBeInTheDocument();
    });

    it('should call onClick when the primary action is clicked', () => {
      render(
        <PayrollModalLayout
          title=""
          onClose={jest.fn()}
          primaryAction={primaryAction}
        />,
      );
      userEvent.click(screen.getByRole('button', { name: 'Primary Action' }));
      expect(primaryAction.onClick).toHaveBeenCalled();
    });
  });

  describe('moreActions Prop', () => {
    const moreActions = [
      { title: 'Action 1', onClick: jest.fn() },
      { title: 'Action 2', onClick: jest.fn() },
    ];

    it('should render the more actions', () => {
      render(
        <PayrollModalLayout
          title=""
          onClose={jest.fn()}
          moreActions={moreActions}
        />,
      );
      expect(
        screen.getByRole('button', { name: 'more options' }),
      ).toBeInTheDocument();
    });

    it('should call onClick when a more action is clicked', () => {
      render(
        <PayrollModalLayout
          title=""
          onClose={jest.fn()}
          moreActions={moreActions}
        />,
      );
      userEvent.click(screen.getByRole('button', { name: 'more options' }));
      userEvent.click(screen.getByRole('menuitem', { name: 'Action 1' }));
      expect(moreActions[0].onClick).toHaveBeenCalled();
    });
  });
});
