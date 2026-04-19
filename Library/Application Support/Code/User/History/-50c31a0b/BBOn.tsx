import React from 'react';
import { render, screen, within } from '@testing-library/react';

import { type ListOrgUnitsQueryResult } from '@personio-web/employees-organizations-gofer';
import { MockOrgChartDataSourceContext } from '../../../../../../test-setup/mocks/MockOrgChartDataSourceContext';
import { Leads } from './Leads';

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

describe('Leads', () => {
  const createMockOrgUnit = (overrides = {}): OrgUnit =>
    ({
      id: { id: 'test-org-unit-id' },
      name: 'Test Organization Unit',
      orgUnitLeadsList: [],
      ...overrides,
    } as unknown as OrgUnit);

  const createMockLead = (
    id: string,
    name: string,
    positionTitle?: string,
  ) => ({
    personId: { id },
    person: {
      preferredName: { value: name },
      profilePicUrls: { paths: { small: `https://example.com/${id}.jpg` } },
      currentPrimaryEmployment: positionTitle
        ? { positionTitle: { value: positionTitle } }
        : undefined,
    },
  });

  const renderWithContext = (
    component: React.ReactElement,
    contextOverrides = {},
  ) => {
    return render(
      <MockOrgChartDataSourceContext
        completeHierarchyData={{
          data: {
            source: 'Department' as const,
            leadsCount: 2,
            // @ts-expect-error - enough to satisfy the test
            hierarchy: { getNode: jest.fn() },
          },
        }}
        {...contextOverrides}
      >
        {component}
      </MockOrgChartDataSourceContext>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render leads when orgUnit has leads', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: [
          createMockLead('lead-1', 'John Doe', 'Engineering Manager'),
          createMockLead('lead-2', 'Jane Smith', 'Product Manager'),
        ],
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />);

      const leadsBox = screen.getByRole('listbox');
      const leadItems = within(leadsBox).getAllByRole('listitem');
      expect(leadItems).toHaveLength(2);

      expect(leadItems[0]).toHaveTextContent('John DoeEngineering Manager');
      expect(leadItems[1]).toHaveTextContent('Jane SmithProduct Manager');
    });
  });

  describe('Conditional Rendering', () => {
    it('should render empty list when orgUnitLeadsList is empty', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: [],
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />);

      const leadsBox = screen.getByRole('listbox');
      expect(leadsBox.children).toHaveLength(0);
    });

    it('should render empty list when orgUnitLeadsList is undefined', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: undefined,
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />);

      const leadsBox = screen.getByRole('listbox');
      expect(leadsBox.children).toHaveLength(0);
    });
  });

  describe('Height Calculation', () => {
    it('should calculate height based on leadsCount', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: [
          createMockLead('lead-1', 'John Doe'),
          createMockLead('lead-2', 'Jane Smith'),
        ],
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />, {
        completeHierarchyData: {
          data: {
            source: 'Department' as const,
            leadsCount: 2,
            hierarchy: { getNode: jest.fn() },
          },
        },
      });

      const leadsBox = screen.getByRole('listbox');
    });
  });
});
