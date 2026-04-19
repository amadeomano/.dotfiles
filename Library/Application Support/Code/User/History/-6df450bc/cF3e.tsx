import { ReactDOM, type PropsWithChildren } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { getPersonioTranslation } from '@personio-web/config-jest/helpers';
import { renderWithWrapper } from '@personio-web/orchestrator-common/test-utils';
import { server } from '@personio-web/mocks/server';
import { getFeatureAccessHandlers } from '@personio-web/employees-organizations-data-feature-access/mocking';
import { getEmployeeListColumnsHandlers } from '@personio-web/employees-organizations-data-people-list/mocking';

import { FeatureFlags } from '../consts/featureFlags';
import { OrgChart } from '../';

jest.mock('d3-timer', () => ({
  timer: jest.fn(),
}));

const HeadMock: FC<HeadMockProps> = ({ children }) => {
  return <>{ReactDOM.createPortal(children, document.head)}</>;
};

describe('OrgChart', () => {
  beforeEach(() => {
    server.use(getFeatureAccessHandlers.defaultHandler);
    server.use(getEmployeeListColumnsHandlers.defaultHandler);
  });
  const { t } = getPersonioTranslation('navigation');
  const { t: tOrgUnits } = getPersonioTranslation('org-units');

  it('should render content', async () => {
    renderWithWrapper(<OrgChart />);

    await waitFor(() =>
      expect(screen.getByText(t('main.org-chart'))).toBeInTheDocument(),
    );
  });

  it('should render not authorized component when user has no access', async () => {
    server.use(
      getFeatureAccessHandlers.getFeatureAccess200Handler__getOrgchartUnauthorized,
    );
    renderWithWrapper(<OrgChart />);

    expect(screen.queryByText(t('main.org-chart'))).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByText(tOrgUnits('access-rights-error.title')),
      ).toBeInTheDocument(),
    );
  });
});
