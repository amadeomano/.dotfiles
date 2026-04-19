import React from 'react';

import { server } from '@personio-web/mocks/server';
import { render, screen } from '@testing-library/react';

import * as Facepile from 'designSystem/component/facepile';

import {
  useOrgUnitFirstMemberIds,
  useOrgUnitMemberAvatars,
  type ListOrgUnitsQueryResult,
} from '@personio-web/employees-organizations-gofer';
import { ListOrgUnitsHandlers } from '@personio-web/employees-organizations-gofer/mocking';
import { TestIds } from '../../../../../utils/test-ids';
import { MockOrgChartDataSourceContext } from '../../../../../../test-setup/mocks/MockOrgChartDataSourceContext';
import { getTranslation } from '../../../../../../test-setup/testHelpers';
import * as totalMembersCounter from './useTotalMembersCount';
import { Members } from './Members';

jest.mock('@personio-web/employees-organizations-gofer');

const mockFacepile = jest.spyOn(Facepile, 'Facepile');
const mockUseTotalMembersCount = jest.spyOn(
  totalMembersCounter,
  'useTotalMembersCount',
);

const mockUseOrgUnitFirstMemberIds =
  useOrgUnitFirstMemberIds as jest.MockedFunction<
    typeof useOrgUnitFirstMemberIds
  >;

const mockUseOrgUnitMemberAvatars =
  useOrgUnitMemberAvatars as jest.MockedFunction<
    typeof useOrgUnitMemberAvatars
  >;

const { t } = getTranslation('employees-organizations', {
  keyPrefix: 'org-chart.org-unit-card',
});

const { t: tAccessible } = getTranslation('employees-organizations', {
  keyPrefix: 'org-chart.org-unit-card.accessible-labels',
});

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

describe('Members', () => {
  const createMockOrgUnit = (overrides = {}): OrgUnit =>
    ({
      id: { id: 'test-org-unit-id' },
      directMemberCount: 4,
      name: 'Test Organization Unit',
      type: 'ORG_UNIT_TYPE_DEPARTMENT',
      ...overrides,
    } as OrgUnit);

  const createMockFirstMemberIds = (overrides = {}) => ({
    data: [
      { personId: 'person-1' },
      { personId: 'person-2' },
      { personId: 'person-3' },
      { personId: 'person-4' },
    ],
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  });

  const createMockMemberAvatars = (overrides = {}) => ({
    data: [
      {
        id: 'person-1',
        profilePicUrls: { paths: { small: 'https://example.com/john.jpg' } },
      },
      {
        id: 'person-2',
        profilePicUrls: { paths: { small: 'https://example.com/jane.jpg' } },
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  });

  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <MockOrgChartDataSourceContext
        completeHierarchyData={{
          data: {
            // @ts-expect-error - enough to satisfy the test
            hierarchy: {
              getNode: jest.fn().mockReturnValue({
                descendants: [
                  { id: 'descendant-1' },
                  { id: 'descendant-2' },
                  { id: 'descendant-3' },
                ],
              }),
            },
          },
        }}
      >
        {component}
      </MockOrgChartDataSourceContext>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    server.use(ListOrgUnitsHandlers.defaultHandler);

    mockUseOrgUnitFirstMemberIds.mockReturnValue(
      createMockFirstMemberIds() as never,
    );
    mockUseOrgUnitMemberAvatars.mockReturnValue(
      createMockMemberAvatars() as never,
    );
    mockUseTotalMembersCount.mockReturnValue(null);
  });

  describe('Basic Rendering', () => {
    it('should render members section when there are members', () => {
      const mockOrgUnit = createMockOrgUnit();

      renderWithContext(<Members orgUnit={mockOrgUnit} />);

      const cardMembers = screen.getByTestId(TestIds.OrgUnitCardMembers);
      expect(cardMembers).toHaveTextContent(t('members', { count: 4 }));
    });

    it('should render Facepile with correct props when directMemberCount > MAX_VISIBLE_AVATARS', () => {
      const mockOrgUnit = createMockOrgUnit({ directMemberCount: 4 });

      renderWithContext(<Members orgUnit={mockOrgUnit} />);

      expect(mockFacepile).toHaveBeenCalledWith(
        {
          totalItems: 102, // 100 + MAX_VISIBLE_AVATARS (2)
          items: [
            {
              id: 'person-1',
              src: 'https://example.com/john.jpg',
            },
            {
              id: 'person-2',
              src: 'https://example.com/jane.jpg',
            },
          ],
        },
        expect.anything(),
      );
    });

    it('should render Facepile with actual count when directMemberCount <= MAX_VISIBLE_AVATARS', () => {
      const mockOrgUnit = createMockOrgUnit({ directMemberCount: 2 });

      renderWithContext(<Members orgUnit={mockOrgUnit} />);

      expect(mockFacepile).toHaveBeenCalledWith(
        {
          totalItems: 2,
          items: [
            {
              id: 'person-1',
              src: 'https://example.com/john.jpg',
            },
            {
              id: 'person-2',
              src: 'https://example.com/jane.jpg',
            },
          ],
        },
        expect.anything(),
      );
    });

    it('should render member count text', () => {
      const mockOrgUnit = createMockOrgUnit({ directMemberCount: 5 });

      renderWithContext(<Members orgUnit={mockOrgUnit} />);

      expect(screen.getByText(t('members', { count: 5 }))).toBeInTheDocument();
    });

    it('should render member count text with total members count', () => {
      const mockOrgUnit = createMockOrgUnit({ directMemberCount: 5 });
      mockUseTotalMembersCount.mockReturnValue(10);

      renderWithContext(<Members orgUnit={mockOrgUnit} />);

      expect(
        screen.getByRole('region', {
          name: tAccessible('members', { direct: 5, total: 10 }),
        }),
      ).toHaveTextContent(t('members', { count: 5 }));
      expect(
        screen.getByRole('region', {
          name: tAccessible('members', { direct: 5, total: 10 }),
        }),
      ).toHaveTextContent(t('total-members', { count: 10 }));
    });

    it('should call useOrgUnitFirstMemberIds with correct orgUnit', () => {
      const mockOrgUnit = createMockOrgUnit();

      renderWithContext(<Members orgUnit={mockOrgUnit} />);

      expect(mockUseOrgUnitFirstMemberIds).toHaveBeenCalledWith(mockOrgUnit);
    });

    it('should call useOrgUnitMemberAvatars with correct personIds', () => {
      const mockOrgUnit = createMockOrgUnit();

      renderWithContext(<Members orgUnit={mockOrgUnit} />);

      expect(mockUseOrgUnitMemberAvatars).toHaveBeenCalledWith([
        'person-1',
        'person-2',
        'person-3',
        'person-4',
      ]);
    });

    it('should render "No members" when directMemberCount is 0 but totalMembersCount > 0', () => {
      const mockOrgUnit = createMockOrgUnit({ directMemberCount: 0 });
      mockUseTotalMembersCount.mockReturnValue(10);
      mockUseOrgUnitFirstMemberIds.mockReturnValue(
        createMockFirstMemberIds({ data: [] }) as never,
      );
      mockUseOrgUnitMemberAvatars.mockReturnValue(
        createMockMemberAvatars({ data: [] }) as never,
      );

      renderWithContext(<Members orgUnit={mockOrgUnit} />);

      const membersSection = screen.getByRole('region', {
        name: tAccessible('members', { direct: 0, total: 10 }),
      });
      expect(membersSection).toBeInTheDocument();
      expect(membersSection).toHaveTextContent(
        `${t('members_zero')}${t('total-members', { count: 10 })}`,
      );
    });
  });

  describe('Conditional Rendering', () => {
    it('should not render when there are no members', () => {
      mockUseOrgUnitFirstMemberIds.mockReturnValue(
        createMockFirstMemberIds({ data: [] }) as never,
      );
      mockUseOrgUnitMemberAvatars.mockReturnValue(
        createMockMemberAvatars({ data: [] }) as never,
      );

      const mockOrgUnit = createMockOrgUnit({ directMemberCount: 0 });
      const { container } = renderWithContext(
        <Members orgUnit={mockOrgUnit} />,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
