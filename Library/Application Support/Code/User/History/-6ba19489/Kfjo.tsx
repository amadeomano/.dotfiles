// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { renderHook } from '@testing-library/react';

import { PersonSystemAttribute } from '@personio-web/employees-organizations-util-people';
import { server } from '@personio-web/mocks/server';

import { FilterOrgUnitsByEmployeesHandlers } from '@personio-web/employees-organizations-gofer/src/handlers';

import * as hooks from '@personio-web/employees-organizations-gofer';
import { MockOrgChartPreferencesContext } from '../../../../../test-setup/mocks/MockOrgChartPreferencesContext';
import { renderHookWithWrapper } from '../../../../../test-setup/testHelpers';

import { useGetFilterConditions } from './useGetFilterConditions';

const mockUseFilterOrgUnitsByEmployees = jest.spyOn(
  hooks,
  'useFilterOrgUnitsByEmployees',
);

describe('useGetFilterConditions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    server.use(FilterOrgUnitsByEmployeesHandlers.defaultHandler);
  });

  const createMockPreferences = (overrides = {}) => ({
    source: 'Department' as const,
    filters: [],
    ...overrides,
  });

  const renderHookWithPreferences = (enabled: boolean, preferences = {}) => {
    const mockPreferences = createMockPreferences(preferences);

    return renderHookWithWrapper(() => useGetFilterConditions(enabled), {
      innerWrapper: ({ children }) => (
        <MockOrgChartPreferencesContext {...mockPreferences}>
          {children}
        </MockOrgChartPreferencesContext>
      ),
    });
  };

  describe('when enabled is false', () => {
    it('should not call useFilterOrgUnitsByEmployees', () => {
      mockUseFilterOrgUnitsByEmployees.mockReturnValue({
        data: undefined,
        status: 'idle',
      } as any);

      renderHookWithPreferences(false);

      expect(mockUseFilterOrgUnitsByEmployees).toHaveBeenCalledWith(
        expect.objectContaining({
          queryOptions: { enabled: false },
        }),
      );
    });

    it('should return undefined conditions', () => {
      mockUseFilterOrgUnitsByEmployees.mockReturnValue({
        data: undefined,
        status: 'idle',
      } as any);

      const { result } = renderHookWithPreferences(false);

      expect(result.current).toBeUndefined();
    });
  });

  describe('when enabled is true', () => {
    it('should call useFilterOrgUnitsByEmployees with correct parameters when there are indirect filters', () => {
      const mockFilters = [
        {
          id: PersonSystemAttribute.Office,
          value: {
            condition: 'contains' as const,
            value: ['office1', 'office2'],
          },
        },
      ];

      renderHookWithPreferences(true, { filters: mockFilters });

      expect(mockUseFilterOrgUnitsByEmployees).toHaveBeenCalledWith({
        variables: {
          filterExp: 'workplace_id in ["office1", "office2"]',
          includeDepartment: true,
          includeTeam: true,
        },
        queryOptions: { enabled: true },
      });
    });

    it('should not call useFilterOrgUnitsByEmployees when there are no indirect filters', () => {
      const mockFilters = [
        {
          id: PersonSystemAttribute.Department,
          value: {
            condition: 'contains' as const,
            value: ['dept1'],
          },
        },
      ];

      mockUseFilterOrgUnitsByEmployees.mockReturnValue({
        data: undefined,
        status: 'idle',
      } as any);

      renderHookWithPreferences(true, { filters: mockFilters });

      expect(mockUseFilterOrgUnitsByEmployees).toHaveBeenCalledWith({
        variables: {
          filterExp: '',
          includeDepartment: true,
          includeTeam: true,
        },
        queryOptions: { enabled: false },
      });
    });
  });

  describe('filter categorization', () => {
    it('should categorize Department and Team filters as direct filters', () => {
      const mockFilters = [
        {
          id: PersonSystemAttribute.Department,
          value: {
            condition: 'contains' as const,
            value: ['dept1'],
          },
        },
        {
          id: PersonSystemAttribute.Team,
          value: {
            condition: 'contains' as const,
            value: ['team1'],
          },
        },
      ];

      mockUseFilterOrgUnitsByEmployees.mockReturnValue({
        data: undefined,
        status: 'idle',
      } as any);

      renderHookWithPreferences(true, { filters: mockFilters });

      expect(mockUseFilterOrgUnitsByEmployees).toHaveBeenCalledWith({
        variables: {
          filterExp: '',
          includeDepartment: true,
          includeTeam: true,
        },
        queryOptions: { enabled: false },
      });
    });

    it('should categorize other filters as indirect filters', () => {
      const mockFilters = [
        {
          id: PersonSystemAttribute.Office,
          value: {
            condition: 'contains' as const,
            value: ['office1'],
          },
        },
        {
          id: PersonSystemAttribute.LegalEntity,
          value: {
            condition: 'contains' as const,
            value: ['entity1'],
          },
        },
      ];

      renderHookWithPreferences(true, { filters: mockFilters });

      expect(mockUseFilterOrgUnitsByEmployees).toHaveBeenCalledWith({
        variables: {
          filterExp:
            'workplace_id in ["office1"] && legal_entity_id in ["entity1"]',
          includeDepartment: true,
          includeTeam: true,
        },
        queryOptions: { enabled: true },
      });
    });
  });

  describe('legacy IDs processing', () => {
    it('should process legacy IDs from Department source', () => {
      const mockFilters = [
        {
          id: PersonSystemAttribute.Office,
          value: {
            condition: 'contains' as const,
            value: ['office1'],
          },
        },
      ];

      const mockResponse = {
        data: {
          result: {
            employmentsList: [
              { departmentOrgUnit: { legacyId: { id: '1' } } },
              { departmentOrgUnit: { legacyId: { id: '2' } } },
              { departmentOrgUnit: { legacyId: { id: '1' } } }, // duplicate
            ],
          },
        },
      };

      mockUseFilterOrgUnitsByEmployees.mockReturnValue({
        data: mockResponse,
        status: 'success',
      } as any);

      const { result } = renderHookWithPreferences(true, {
        filters: mockFilters,
        source: 'Department',
      });

      expect(result.current).toBe(
        'legacy_id in ["1", "2"] && type == "Department"',
      );
    });

    it('should process legacy IDs from Team source', () => {
      const mockFilters = [
        {
          id: PersonSystemAttribute.Office,
          value: {
            condition: 'contains' as const,
            value: ['office1'],
          },
        },
      ];

      const mockResponse = {
        data: {
          result: {
            employmentsList: [
              { teamOrgUnit: { legacyId: { id: '1' } } },
              { teamOrgUnit: { legacyId: { id: '2' } } },
            ],
          },
        },
      };

      mockUseFilterOrgUnitsByEmployees.mockReturnValue({
        data: mockResponse,
        status: 'success',
      } as any);

      const { result } = renderHookWithPreferences(true, {
        filters: mockFilters,
        source: 'Team',
      });

      expect(result.current).toBe('legacy_id in ["1", "2"] && type == "Team"');
    });

    it('should filter out undefined and null legacy IDs', () => {
      const mockFilters = [
        {
          id: PersonSystemAttribute.Office,
          value: {
            condition: 'contains' as const,
            value: ['office1'],
          },
        },
      ];

      const mockResponse = {
        data: {
          result: {
            employmentsList: [
              { departmentOrgUnit: { legacyId: { id: '1' } } },
              { departmentOrgUnit: { legacyId: { id: undefined } } },
              { departmentOrgUnit: { legacyId: { id: null } } },
              { departmentOrgUnit: null },
              { department: null },
            ],
          },
        },
      };

      mockUseFilterOrgUnitsByEmployees.mockReturnValue({
        data: mockResponse,
        status: 'success',
      } as any);

      const { result } = renderHookWithPreferences(true, {
        filters: mockFilters,
        source: 'Department',
      });

      expect(result.current).toBe('legacy_id in ["1"] && type == "Department"');
    });
  });

  describe('filter conditions mapping', () => {
    it('should map contains condition to in operator', async () => {
      const mockFilters = [
        {
          id: PersonSystemAttribute.Office,
          value: {
            condition: 'contains' as const,
            value: ['office1'],
          },
        },
      ];

      renderHookWithPreferences(true, { filters: mockFilters });

      expect(mockUseFilterOrgUnitsByEmployees).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            filterExp: 'office.id in ["office1"]',
          }),
        }),
      );
    });

    it('should map does_not_contain condition to notIn operator', () => {
      const mockFilters = [
        {
          id: PersonSystemAttribute.Office,
          value: {
            condition: 'does_not_contain' as const,
            value: ['office1'],
          },
        },
      ];

      renderHookWithPreferences(true, { filters: mockFilters });

      expect(mockUseFilterOrgUnitsByEmployees).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            filterExp: '!(office.id in ["office1"])',
          }),
        }),
      );
    });

    it('should handle unsupported filter conditions gracefully', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => jest.fn());

      const mockFilters = [
        {
          id: PersonSystemAttribute.Office,
          value: {
            condition: 'equals' as any, // unsupported condition
            value: ['office1'],
          },
        },
      ];

      renderHookWithPreferences(true, { filters: mockFilters });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Filter condition equals is not currently supported',
      );

      consoleSpy.mockRestore();
    });

    it('should handle invalid filter values gracefully', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => jest.fn());

      const mockFilters = [
        {
          id: PersonSystemAttribute.Office,
          value: {
            condition: 'contains' as const,
            value: [], // empty array
          },
        },
      ];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { result } = renderHookWithPreferences(true, {
        filters: mockFilters,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Filter value [] is not currently supported',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple filters of different types', () => {
      const mockFilters = [
        {
          id: PersonSystemAttribute.Department,
          value: {
            condition: 'contains' as const,
            value: ['dept2'],
          },
        },
        {
          id: PersonSystemAttribute.Office,
          value: {
            condition: 'contains' as const,
            value: ['office1'],
          },
        },
        {
          id: PersonSystemAttribute.LegalEntity,
          value: {
            condition: 'does_not_contain' as const,
            value: ['entity1'],
          },
        },
      ];

      const { result } = renderHookWithPreferences(true, {
        filters: mockFilters,
        source: 'Department',
      });

      expect(mockUseFilterOrgUnitsByEmployees).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            filterExp:
              'office.id in ["office1"] && !(legal_entity_id in ["entity1"])',
          }),
        }),
      );

      expect(result.current).toBe(
        'legacy_id in ["dept2"] && legacy_id in ["1"] && type == "Department"',
      );
    });
  });
});
