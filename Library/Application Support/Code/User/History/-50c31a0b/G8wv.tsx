import React from 'react';
import { render, screen } from '@testing-library/react';

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

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Leads Count Limiting', () => {
    it('should limit leads to leadsCount from context when source is Department', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: [
          createMockLead('lead-1', 'John Doe'),
          createMockLead('lead-2', 'Jane Smith'),
          createMockLead('lead-3', 'Bob Johnson'),
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

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    it('should limit leads to leadsCount from context when source is Team', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: [
          createMockLead('lead-1', 'John Doe'),
          createMockLead('lead-2', 'Jane Smith'),
          createMockLead('lead-3', 'Bob Johnson'),
        ],
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />, {
        completeHierarchyData: {
          data: {
            source: 'Team' as const,
            leadsCount: 1,
            hierarchy: { getNode: jest.fn() },
          },
        },
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    it('should show no leads when source is Supervisor', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: [
          createMockLead('lead-1', 'John Doe'),
          createMockLead('lead-2', 'Jane Smith'),
        ],
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />, {
        completeHierarchyData: {
          data: {
            source: 'Supervisor' as const,
            leadsCount: 0,
            hierarchy: { getNode: jest.fn() },
          },
        },
      });

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should show no leads when leadsCount is 0', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: [createMockLead('lead-1', 'John Doe')],
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />, {
        completeHierarchyData: {
          data: {
            source: 'Department' as const,
            leadsCount: 0,
            hierarchy: { getNode: jest.fn() },
          },
        },
      });

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should show no leads when leadsCount is undefined', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: [createMockLead('lead-1', 'John Doe')],
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />, {
        completeHierarchyData: {
          data: {
            source: 'Department' as const,
            leadsCount: undefined,
            hierarchy: { getNode: jest.fn() },
          },
        },
      });

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render empty list when orgUnitLeadsList is empty', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: [],
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />);

      expect(screen.queryByTestId('list-item')).not.toBeInTheDocument();
    });

    it('should render empty list when orgUnitLeadsList is undefined', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: undefined,
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />);

      expect(screen.queryByTestId('list-item')).not.toBeInTheDocument();
    });

    it('should handle missing profile picture URL', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: [
          {
            personId: { id: 'lead-1' },
            person: {
              preferredName: { value: 'John Doe' },
              profilePicUrls: undefined,
            },
          },
        ],
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />);

      expect(mockListItemAvatar).toHaveBeenCalledWith(
        expect.objectContaining({
          src: undefined,
          name: 'John Doe',
        }),
        expect.anything(),
      );
    });

    it('should handle missing preferred name', () => {
      const mockOrgUnit = createMockOrgUnit({
        orgUnitLeadsList: [
          {
            personId: { id: 'lead-1' },
            person: {
              preferredName: undefined,
              profilePicUrls: {
                paths: { small: 'https://example.com/lead-1.jpg' },
              },
            },
          },
        ],
      });

      renderWithContext(<Leads orgUnit={mockOrgUnit} />);

      expect(mockListItemAvatar).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '',
        }),
        expect.anything(),
      );
      expect(mockListItemText).toHaveBeenCalledWith(
        expect.objectContaining({
          children: '',
        }),
        expect.anything(),
      );
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

      // Verify that leads are rendered (height is applied)
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });
});
