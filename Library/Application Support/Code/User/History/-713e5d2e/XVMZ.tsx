import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getPersonioTranslation } from '@personio-web/config-jest/helpers';
import { type ActionProps, PayrollModalLayout } from '../PayrollModalLayout';

const onClose = jest.fn();
const primaryAction: ActionProps = {
  title: 'Approve',
  isLoading: false,
  isVisible: true,
  onClick: jest.fn(),
};

const moreActions: ActionProps[] = [{ title: 'Refresh', onClick: jest.fn() }];

const props = {
  title: 'Payrun Details',
  primaryAction,
  moreActions,
  onClose,
};

describe('PayrollModalLayout', () => {
  it('should render the layout with the correct title', () => {
    render(<PayrollModalLayout {...props} />);
    expect(
      screen.getByRole('heading', { name: props.title }),
    ).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    const { t: tDS } = getPersonioTranslation('design-system');
    render(<PayrollModalLayout {...props} />);
    userEvent.click(
      screen.getByRole('button', {
        name: tDS('page.navigation-bar.close-aria-label'),
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render children content inside the modal', () => {
    render(
      <PayrollModalLayout {...props}>
        <div>Child Content</div>
      </PayrollModalLayout>,
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  test('should render correctly the action buttons', () => {
    render(<PayrollModalLayout {...props} />);
    const moreActionsBtn = screen.getByTestId(
      'more-actions-more-action-trigger',
    );
    expect(screen.getByText(primaryAction.title)).toBeInTheDocument();
    expect(moreActionsBtn).toBeInTheDocument();

    userEvent.click(moreActionsBtn);

    expect(screen.getByText(moreActions[0].title)).toBeInTheDocument();
  });

  it('should not display the approve action if the payrun is approved', () => {
    render(
      <PayrollModalLayout
        {...{
          ...props,
          primaryAction: {
            ...primaryAction,
            isVisible: false,
          },
        }}
      />,
    );
    expect(screen.queryByText(primaryAction.title)).not.toBeInTheDocument();
  });
});
