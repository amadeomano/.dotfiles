import type { PropsWithChildren } from 'react';
import { renderHookWithWrapper } from '@personio-web/config-jest/helpers';

import { MockOrgChartPreferencesContext } from '../../../../test-setup/mocks/MockOrgChartPreferencesContext';
import { NodeMap } from '../../../Nodes/constants';
import { type OrgChartPreferences } from '../../../contexts';
import { useOrgUnit } from './useOrgUnit';

import * as completeHierarchy from './useCompleteHierarchy';
import * as filteredHierarchy from './useFilteredHierarchy';

const mockUseCompleteHierarchy = jest.spyOn(
  completeHierarchy,
  'useCompleteHierarchy',
);
const mockUseFilteredHierarchy = jest.spyOn(
  filteredHierarchy,
  'useFilteredHierarchy',
);

const getWrapper =
  (prefs: Partial<OrgChartPreferences>) =>
  ({ children }: PropsWithChildren) =>
    (
      <MockOrgChartPreferencesContext {...prefs}>
        {children}
      </MockOrgChartPreferencesContext>
    );

describe('getInitialExpandedIds', () => {
  const mockNode = {
    id: 'active-card-id',
    ancestors: [
      { id: 'ancestor-1' },
      { id: 'ancestor-2' },
      { id: 'ancestor-3' },
    ],
  };

  const mockHierarchy = {
    getNode: jest.fn(),
    nodes: [
      { id: 'node-1', data: { type: NodeMap.OrgUnit } },
      { id: 'node-2', data: { type: NodeMap.UnmatchedOrgUnit } },
      { id: 'node-3', data: { type: NodeMap.UnmatchedOrgUnit } },
      { id: 'node-4', data: { type: NodeMap.OrgUnit } },
    ],
  };

  const createMockCompleteHierarchy = (isLoading = false) => ({
    data: { hierarchy: mockHierarchy },
    isLoading,
    error: null,
  });

  const createMockFilteredHierarchy = (isLoading = false) => ({
    data: { hierarchy: mockHierarchy },
    isLoading,
    error: null,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCompleteHierarchy.mockReturnValue(
      createMockCompleteHierarchy() as never,
    );
    mockUseFilteredHierarchy.mockReturnValue(
      createMockFilteredHierarchy() as never,
    );

    mockHierarchy.getNode.mockImplementation((id: string) => {
      if (id === 'active-card-id') return mockNode;
      return null;
    });
  });

  it('should return ancestor IDs when activeCardId is provided and node exists', () => {
    const innerWrapper = getWrapper({ activeCardId: 'active-card-id' });
    const { result } = renderHookWithWrapper(() => useOrgUnit(true), {
      innerWrapper,
    });
    const expandedIds = result.current.getInitialExpandedIds();

    expect(expandedIds).toEqual(['ancestor-1', 'ancestor-2', 'ancestor-3']);
    expect(mockHierarchy.getNode).toHaveBeenCalledWith('active-card-id');
  });

  it('should return empty array when activeCardId is provided but node does not exist', () => {
    mockHierarchy.getNode.mockReturnValue(null);

    const wrapper = getWrapper({ activeCardId: 'non-existent-id' });
    const { result } = renderHook(() => useOrgUnit(true), { wrapper });
    const expandedIds = result.current.getInitialExpandedIds();

    expect(expandedIds).toEqual([]);
    expect(mockHierarchy.getNode).toHaveBeenCalledWith('non-existent-id');
  });

  it('should return UnmatchedOrgUnit node IDs when filtering is active and no activeCardId', () => {
    const wrapper = getWrapper({
      filters: [{ field: 'name', value: 'test' } as never],
    });
    const { result } = renderHook(() => useOrgUnit(true), { wrapper });
    const expandedIds = result.current.getInitialExpandedIds();

    expect(expandedIds).toEqual(['node-2', 'node-3']);
  });

  it('should return empty array when not filtering and no activeCardId', () => {
    const wrapper = getWrapper({ filters: [] });
    const { result } = renderHook(() => useOrgUnit(true), { wrapper });
    const expandedIds = result.current.getInitialExpandedIds();

    expect(expandedIds).toEqual([]);
  });

  it('should return empty array when data is still loading', () => {
    mockUseCompleteHierarchy.mockReturnValue(
      createMockCompleteHierarchy(true) as never,
    );

    const wrapper = getWrapper({ activeCardId: 'active-card-id' });
    const { result } = renderHook(() => useOrgUnit(true), { wrapper });
    const expandedIds = result.current.getInitialExpandedIds();

    expect(expandedIds).toEqual([]);
  });

  it('should accept prefsState parameter to override current preferences', () => {
    const wrapper = getWrapper({});
    const { result } = renderHook(() => useOrgUnit(true), { wrapper });
    const expandedIds = result.current.getInitialExpandedIds({
      activeCardId: 'active-card-id',
    });

    expect(expandedIds).toEqual(['ancestor-1', 'ancestor-2', 'ancestor-3']);
    expect(mockHierarchy.getNode).toHaveBeenCalledWith('active-card-id');
  });

  it('should prioritize activeCardId over filtering when both are present', () => {
    const wrapper = getWrapper({
      activeCardId: 'active-card-id',
      filters: [{ field: 'name', value: 'test' } as never],
    });
    const { result } = renderHook(() => useOrgUnit(true), { wrapper });
    const expandedIds = result.current.getInitialExpandedIds();

    expect(expandedIds).toEqual(['ancestor-1', 'ancestor-2', 'ancestor-3']);
    expect(mockHierarchy.getNode).toHaveBeenCalledWith('active-card-id');
  });
});
