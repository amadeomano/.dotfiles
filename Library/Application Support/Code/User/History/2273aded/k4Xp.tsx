import { screen, waitFor } from '@testing-library/react';

import { getFeatureAccessHandlers } from '@personio-web/employees-organizations-data-feature-access/mocking';
import { listPositionIdsHandlers } from '@personio-web/employees-organizations-data-gofer/src/handlers';
import { server } from '@personio-web/mocks/server';

import {
  getTranslation,
  renderWithWrapper,
} from '../../../../test-setup/testHelpers';
import { TestIds } from '../../../utils';
import { setItemWithExpireDate } from '../../../utils/localStorageWithExpireDate';
import {
  OpenPositionsWithoutSupervisorButton,
  openTooltipByDefaultKey,
} from './OpenPositionsWithoutSupervisorButton';

const renderTestComponent = () => {
  renderWithWrapper(<OpenPositionsWithoutSupervisorButton />);
};

describe('OpenPositionsWithoutSupervisorButton', () => {
  beforeEach(() => {
    server.use(
      getFeatureAccessHandlers.getFeatureAccess200Handler__getPositionsAuthorized,
    );
  });

  const { t } = getTranslation('employees-organizations', {
    keyPrefix: 'org-chart.open-positions-without-supervisor.tooltip',
  });

  it('does not render when open positions without supervisor count is 0', () => {
    server.use(listPositionIdsHandlers.emptyHandler);
    renderTestComponent();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders correctly when open positions without supervisor count is greater than 0', async () => {
    server.use(listPositionIdsHandlers.defaultHandler);
    renderTestComponent();
    setItemWithExpireDate(openTooltipByDefaultKey, true);

    await waitFor(() => expect(screen.getByRole('button')).toBeInTheDocument());
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getAllByText(t('title', { count: 10 }))).toBeTruthy();
    expect(
      screen.getByTestId(TestIds.OpenPositionsWithoutSupervisor),
    ).toHaveAttribute('href', '/workforce-planning/positions');
  });

  it('should not render the tooltip by default when localStorage is set to false', async () => {
    server.use(listPositionIdsHandlers.defaultHandler);
    renderTestComponent();
    setItemWithExpireDate(openTooltipByDefaultKey, false);

    await waitFor(() => expect(screen.getByRole('button')).toBeInTheDocument());
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(
      screen.queryByText(t('title', { count: 10 })),
    ).not.toBeInTheDocument();
  });
});
