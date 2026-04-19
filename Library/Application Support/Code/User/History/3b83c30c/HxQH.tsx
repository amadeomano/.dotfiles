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

const createOrgUnitMock = (
  overrides: Partial<OrgUnitResult> = {},
): OrgUnitResult =>
  ({
    type: 'ORG_UNIT_TYPE_TEAM',
    teamId: { __typename: 'protocore_hrteamid_TeamId_v1', id: 'team-123' },
    name: 'Team name',
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
});
