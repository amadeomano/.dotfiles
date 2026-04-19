import userEvent from '@testing-library/user-event';
import { server } from '@personio-web/mocks/server';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '@personio-web/orchestrator-common/test-utils';
import { getPersonioTranslation } from '@personio-web/config-jest/helpers';
import { ListOrgUnitMembersCustomHandlers } from '@personio-web/employees-organizations-gofer/mocking';

import { type OrgUnitResult } from '../../types';
import { FeatureFlags } from '../featureFlags';
import { toTranslate } from '../toTranslate';
import { MembersList } from './MembersList';
import { MEMBERS_LIST_PAGE_SIZE } from './useListMembers';

const Picker = jest.fn((props) => (
  <div data-test-id="mock-picker">
    {props.options.map((option: any) => option.label)}
  </div>
));
jest.mock('designSystem/component/picker', () => {
  const PickerModule = jest.requireActual('designSystem/component/picker');
  return {
    ...PickerModule,
    Picker: {
      ...PickerModule.Picker,
      render: jest.fn((props) => <Picker {...props} />),
    },
  };
});

jest.mock('designSystem/feature/smart-hover-card', () => ({
  SmartHoverCard: {
    Person: ({ children, id, href }: any) => (
      <div
        data-testid="smart-hover-card-person"
        data-person-id={id}
        data-href={href}
      >
        {children}
      </div>
    ),
  },
}));

jest.mock(
  '@personio-web/employees-organizations-hook-use-generate-person-link',
  () => ({
    useGeneratePersonLink: () =>
      jest.fn((personId: string) => `/employee/${personId}`),
  }),
);

const createOrgUnitMock = (
  overrides: Partial<OrgUnitResult> = {},
): OrgUnitResult =>
  ({
    type: 'ORG_UNIT_TYPE_TEAM',
    teamId: { __typename: 'protocore_hrteamid_TeamId_v1', id: 'team-123' },
    ...overrides,
  } as OrgUnitResult);

describe('MembersList', () => {
  beforeEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  it('should render members list successfully when feature flag is enabled and data is loaded', async () => {
    server.use(ListOrgUnitMembersCustomHandlers.defaultHandler);
    const { t } = getPersonioTranslation('design-system');

    const teamOrgUnit = createOrgUnitMock();

    render(
      <TestWrapper features={{ [FeatureFlags.SHOW_MEMBERS_LIST]: 'on' }}>
        <MembersList orgUnit={teamOrgUnit} type="team" />
      </TestWrapper>,
    );

    await expect(
      screen.findByTestId('mock-picker'),
    ).resolves.toBeInTheDocument();

    expect(Picker.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        options: expect.arrayContaining([expect.anything(), expect.anything()]), // two options
        multiple: false,
        selected: '',
        onChange: expect.any(Function),
        searchConfig: { enabled: false },
        virtualizationConfig: { enabled: false },
        paginationConfig: {
          enabled: true,
          pageSize: MEMBERS_LIST_PAGE_SIZE,
          hasMoreToLoad: true,
          isLoading: false,
          onLoadMore: expect.any(Function),
        },
      }),
    );

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);

    expect(
      screen.getByRole('button', { name: t('control-bar.trigger.sort') }),
    ).toBeInTheDocument();
  });

  it('should sort the list and clear sorting', async () => {
    server.use(ListOrgUnitMembersCustomHandlers.defaultHandler);
    const { t } = getPersonioTranslation('design-system');

    const teamOrgUnit = createOrgUnitMock();

    render(
      <TestWrapper features={{ [FeatureFlags.SHOW_MEMBERS_LIST]: 'on' }}>
        <MembersList orgUnit={teamOrgUnit} type="team" />
      </TestWrapper>,
    );

    await expect(
      screen.findByTestId('mock-picker'),
    ).resolves.toBeInTheDocument();

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);

    /**
     * 1. Set the sorting for the list
     */
    const sortTrigger = screen.getByRole('button', {
      name: t('control-bar.trigger.sort'),
    });
    userEvent.click(sortTrigger);

    const sortOptions = screen.getAllByRole('option');
    expect(sortOptions).toHaveLength(2);

    userEvent.click(sortOptions[0]);

    const updatedTrigger = screen.queryByRole('button', {
      name: t('control-bar.sorted-by', {
        value: toTranslate.sortByOptions.name,
      }),
    });
    expect(updatedTrigger).toBeInTheDocument();

    /**
     * 2. Clear the sorting of the list
     */
    const clearSortingTrigger = screen.getByRole('button', { name: 'Clear' });
    userEvent.click(clearSortingTrigger);

    const clearedTrigger = screen.queryByRole('button', {
      name: t('control-bar.sorted-by', {
        value: toTranslate.sortByOptions.name,
      }),
    });
    expect(clearedTrigger).not.toBeInTheDocument();
  });

  it('should render SmartHoverCard.Person wrapper for each member', async () => {
    server.use(ListOrgUnitMembersCustomHandlers.defaultHandler);

    const teamOrgUnit = createOrgUnitMock();

    render(
      <TestWrapper features={{ [FeatureFlags.SHOW_MEMBERS_LIST]: 'on' }}>
        <MembersList orgUnit={teamOrgUnit} type="team" />
      </TestWrapper>,
    );

    await expect(
      screen.findByTestId('mock-picker'),
    ).resolves.toBeInTheDocument();

    const hoverCards = screen.getAllByTestId('smart-hover-card-person');
    expect(hoverCards).toHaveLength(2);

    // Verify the first hover card has correct person ID and href
    expect(hoverCards[0]).toHaveAttribute('data-person-id', '1');
    expect(hoverCards[0]).toHaveAttribute('data-href', '/employee/1');
  });
});
