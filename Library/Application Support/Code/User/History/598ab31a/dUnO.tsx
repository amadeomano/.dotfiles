import { render, screen, waitFor } from '@testing-library/react';
import { server } from '@personio-web/mocks/server';
import { TestWrapper } from '@personio-web/orchestrator-common/test-utils';
import { getPersonioTranslation } from '@personio-web/config-jest/helpers';
import { ListOrgUnitsHandlers } from '@personio-web/employees-organizations-gofer/mocking';

import { type OrgUnitResult } from '../../types';
import { FeatureFlags } from '../featureFlags';
import { toTranslate } from '../toTranslate';
import { TotalMembers } from './TotalMembers';

jest.mock('../../components/employee-list-link', () => ({
  EmployeeListLink: ({ children, ids, type }: any) => (
    <a
      data-test-id="employee-list-link"
      href={`/staff?ids=${ids.join(',')}&type=${type}`}
    >
      {children}
    </a>
  ),
}));

const createOrgUnitMock = (
  overrides: Partial<OrgUnitResult> = {},
): OrgUnitResult =>
  ({
    type: 'ORG_UNIT_TYPE_TEAM',
    teamId: { __typename: 'protocore_hrteamid_TeamId_v1', id: 'team-123' },
    name: 'Team name',
    descendants: [],
    ...overrides,
  } as OrgUnitResult);

describe('TotalMembers', () => {
  beforeEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  it('should render total members title and employee list link when feature flag is enabled and data is loaded', async () => {
    server.use(ListOrgUnitsHandlers.noChildrenHandler);
    const { t } = getPersonioTranslation('org-units');
    const teamOrgUnit = createOrgUnitMock();

    render(
      <TestWrapper features={{ [FeatureFlags.SHOW_MEMBERS_LIST]: 'on' }}>
        <TotalMembers orgUnit={teamOrgUnit} type="team" />
      </TestWrapper>,
    );

    await expect(
      screen.findByText(
        t('attributes.total-members', {
          count: 1,
        }),
      ),
    ).resolves.toBeInTheDocument();

    const employeeListLink = screen.getByTestId('employee-list-link');
    expect(employeeListLink).toBeInTheDocument();
    expect(employeeListLink).toHaveTextContent(
      t('', { defaultValue: toTranslate.peopleListLink.link }),
    );
  });

  it('should return null when feature flag is disabled', () => {
    const teamOrgUnit = createOrgUnitMock();

    const { container } = render(
      <TestWrapper features={{ [FeatureFlags.SHOW_MEMBERS_LIST]: 'off' }}>
        <TotalMembers orgUnit={teamOrgUnit} type="team" />
      </TestWrapper>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should return null when total members count is 0', async () => {
    server.use(ListOrgUnitsHandlers.emptyHandler);
    const teamOrgUnit = createOrgUnitMock();

    const { container } = render(
      <TestWrapper features={{ [FeatureFlags.SHOW_MEMBERS_LIST]: 'on' }}>
        <TotalMembers orgUnit={teamOrgUnit} type="team" />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
