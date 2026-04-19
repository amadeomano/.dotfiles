import { render, screen } from '@testing-library/react';
import { TestWrapper } from '@personio-web/orchestrator-common/test-utils';
import { getPersonioTranslation } from '@personio-web/config-jest/helpers';

import { type OrgUnitResult } from '../../../types';
import { FeatureFlags } from '../../featureFlags';
import { toTranslate } from '../../toTranslate';
import { DirectPeopleListLink } from './DirectPeopleListLink';

jest.mock('./LegacyLink', () => ({
  LegacyLink: ({ orgUnit }: any) => (
    <div data-test-id="legacy-link">Legacy Link for {orgUnit.teamId?.id}</div>
  ),
}));

jest.mock('../../../components/employee-list-link', () => ({
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
    directMemberCount: 5,
    ...overrides,
  } as OrgUnitResult);

describe('DirectPeopleListLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render new UI with direct members title and employee list link when feature flag is enabled', async () => {
    const { t } = getPersonioTranslation('org-units');
    const teamOrgUnit = createOrgUnitMock({ directMemberCount: 3 });

    render(
      <TestWrapper features={{ [FeatureFlags.SHOW_MEMBERS_LIST]: 'on' }}>
        <DirectPeopleListLink orgUnit={teamOrgUnit} type="team" />
      </TestWrapper>,
    );

    await expect(
      screen.findByRole('heading', { level: 5 }),
    ).resolves.toHaveTextContent(
      t('', {
        defaultValue: toTranslate.peopleListLink.directMembersTitle,
        count: 3,
      }),
    );

    await expect(screen.findAllByRole('heading')).resolves();

    screen.debug();

    const employeeListLink = screen.getByTestId('employee-list-link');
    expect(employeeListLink).toBeInTheDocument();
    expect(employeeListLink).toHaveTextContent(
      t('', { defaultValue: toTranslate.peopleListLink.link }),
    );

    expect(screen.queryByTestId('legacy-link')).not.toBeInTheDocument();
  });

  it('should render legacy link when feature flag is disabled', () => {
    const teamOrgUnit = createOrgUnitMock({ directMemberCount: 3 });

    render(
      <TestWrapper features={{ [FeatureFlags.SHOW_MEMBERS_LIST]: 'off' }}>
        <DirectPeopleListLink orgUnit={teamOrgUnit} type="team" />
      </TestWrapper>,
    );

    expect(screen.getByTestId('legacy-link')).toBeInTheDocument();

    expect(screen.queryByRole('heading', { level: 5 })).not.toBeInTheDocument();
    expect(screen.queryByTestId('employee-list-link')).not.toBeInTheDocument();
  });

  it('should return null when directMemberCount is 0', () => {
    const teamOrgUnit = createOrgUnitMock({ directMemberCount: 0 });

    const { container } = render(
      <TestWrapper features={{ [FeatureFlags.SHOW_MEMBERS_LIST]: 'on' }}>
        <DirectPeopleListLink orgUnit={teamOrgUnit} type="team" />
      </TestWrapper>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
