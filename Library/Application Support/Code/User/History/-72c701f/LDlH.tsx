/**
 * This context provider is responsible to serve the data source to Org Chart.
 *
 * The following data will be fetched to compute the state:
 * - completeHierarchy: the full raw hierarchy data to be processed further
 * - filteredIds: fetches the list of person IDs according to the filter criterias
 * - searchResults: fetches the matching employee information according to the search term and filtering state
 *
 * TODO [OS-1041]: separate the concerns of spotlight & filter from here
 * The folloiwng source states are managed by this provider and serveed to its consumers:
 * - isFetching: indicates if any of above data is being fetched
 * - hasFetchErrors: if any of the above fetching operations ecnountered an error
 * - displayableHierarchy: the source-of-truth displayed hierarchy (either complete or filtered, depending on criteria)
 * - completeHierarchyData: the main hierarchy data. before any filtering applied.
 * - isFiltering: true if filtering or spotlighting
 * - personSearch: information of employees that match the searching term criteria
 * - expansionState: state manager for all the nodes to be expanded at the moment of rendering
 * - activeNodesState: state manager for the active nodes (selected nodes) to constitute the report path
 */

import { type PropsWithChildren, createContext, useContext } from 'react';

import { type SourceData } from '../sources/data/types';
import { useActiveSource } from '../sources/data/useActiveSource';
import {
  type VisibleChartData,
  useCalculateVisibleChartData,
} from './utils/useCalculateVisibleChartData';

// TODO: rename groups to spotlightGroups in the codebase
type OrgChartDataSourceContext = Omit<SourceData, 'spotlightGroups'> & {
  groups: SourceData['spotlightGroups'];
  metadata?: SourceData['metadata'];
  visibleChartData: VisibleChartData;
};

export const OrgChartDataSourceContext =
  createContext<OrgChartDataSourceContext | null>(null);

const useOrgChartDataSource = (): OrgChartDataSourceContext => {
  const activeSource = useActiveSource();
  const visibleChartData = useCalculateVisibleChartData(activeSource);

  return {
    isFetching: activeSource.isFetching,
    hasFetchErrors: activeSource.hasFetchErrors,
    displayableHierarchy: activeSource.displayableHierarchy,
    completeHierarchyData: activeSource.completeHierarchyData,
    filteredHierarchy: activeSource.filteredHierarchy,
    isFiltering: activeSource.isFiltering,
    groups: activeSource.spotlightGroups,
    spotlightedLabel: activeSource.spotlightedLabel,
    getInitialExpandedIds: activeSource.getInitialExpandedIds,
    metadata: activeSource.metadata,
    visibleChartData,
  };
};

export const useOrgChartDataSourceContext = () => {
  const context = useContext(OrgChartDataSourceContext);

  if (context === null) {
    throw new Error(
      'useOrgChartDataSourceContext must be used within an OrgChartDataSourceContextProvider',
    );
  }

  return context;
};

export const OrgChartDataSourceContextProvider = ({
  children,
}: PropsWithChildren) => {
  const contextValue = useOrgChartDataSource();

  return (
    <OrgChartDataSourceContext.Provider value={contextValue}>
      {children}
    </OrgChartDataSourceContext.Provider>
  );
};
