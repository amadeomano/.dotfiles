import { screen, fireEvent, act } from '@testing-library/react';

import { getFeatureAccessHandlers } from '@personio-web/employees-organizations-data-feature-access/mocking';
import { server } from '@personio-web/mocks/server';

import { renderWithWrapper } from '../../../../test-setup/testHelpers';
import { MockOrgChartDataSourceContext } from '../../../../test-setup/mocks/MockOrgChartDataSourceContext';
import {
  HiddenCardsTrigger,
  type HiddenCardsTriggerProps,
} from './HiddenCardsTrigger';

const mockIsDialogOfType = jest.fn();
const mockOpenDialog = jest.fn();
const mockCloseDialog = jest.fn();

jest.mock(
  '@personio-web/employees-organizations-hook-use-dialog-context',
  () => ({
    useDialogContext: () => ({
      isDialogOfType: () => mockIsDialogOfType(),
      openDialog: (...args: []) => mockOpenDialog(...args),
      closeDialog: () => mockCloseDialog(),
    }),
  }),
);

const renderTestComponent = (props: Partial<HiddenCardsTriggerProps>) => {
  return act(() => renderWithWrapper(<HiddenCardsTrigger {...props} />));
};

describe('HiddenCardsTrigger', () => {
  it('does not render when hidden people count is 0', async () => {
    await renderTestComponent({ hiddenCardsCount: 0 });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render when use does not have access', async () => {
    server.use(
      getFeatureAccessHandlers.getFeatureAccess200Handler__getInclusionsUnauthorized,
    );
    await renderTestComponent({ hiddenCardsCount: 0 });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders correctly when hidden people count is greater than 0', async () => {
    server.use(
      getFeatureAccessHandlers.getFeatureAccess200Handler__getInclusionsAuthorized,
    );
    await renderTestComponent({ hiddenCardsCount: 5 });

    await screen.findByRole('button');
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls openDialog when the button is clicked', async () => {
    server.use(
      getFeatureAccessHandlers.getFeatureAccess200Handler__getInclusionsAuthorized,
    );
    mockIsDialogOfType.mockReturnValue(false);
    await renderTestComponent({ hiddenCardsCount: 5 });

    await screen.findByRole('button');
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOpenDialog).toHaveBeenCalledWith('org-chart.other-people', {});
  });

  it('calls closeDialog when the button is clicked', async () => {
    server.use(
      getFeatureAccessHandlers.getFeatureAccess200Handler__getInclusionsAuthorized,
    );
    mockIsDialogOfType.mockReturnValue(true);
    await renderTestComponent({ hiddenCardsCount: 5 });

    await screen.findByRole('button');
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockCloseDialog).toHaveBeenCalled();
  });
});
