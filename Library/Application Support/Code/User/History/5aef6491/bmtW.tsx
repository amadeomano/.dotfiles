import { type PropsWithChildren } from 'react';
import { type ContextType } from 'react';
import { type LayoutQueries } from '@personio-web/employees-organizations-feature-org-chart-types';
import { OrgChartDataSourceContext } from '../../src/contexts';

type DataSource = ContextType<typeof OrgChartDataSourceContext>;
export const MockOrgChartDataSourceContext = (
  props: PropsWithChildren<Partial<DataSource>>,
) => {
  const hierarchy: NonNullable<DataSource>['displayableHierarchy'] = {
    rootNodes: [],
    nodes: [],
    getNode: jest.fn(),
  };

  const completeHierarchyData: ReturnType<
    LayoutQueries['useCompleteHierarchy']
  > = {
    data: {
      ...(props.completeHierarchyData?.data ?? {
        source: 'Supervisor' as const,
        hierarchy,
        hiddenRootIds: [],
        includedRootIds: [],
      }),
    },
    isLoading: false,
    error: undefined,
    refetch: jest.fn(),
  };
  const dataSource: Partial<DataSource> = {
    completeHierarchyData,
    filteredHierarchy: props.filteredHierarchy ?? hierarchy,
    displayableHierarchy: props.displayableHierarchy ?? hierarchy,
    isFiltering: props.isFiltering ?? false,
    spotlightedLabel: props.spotlightedLabel,
    getInitialExpandedIds: props.getInitialExpandedIds ?? jest.fn(),
    metadata: props.metadata,
    visibleChartData: props.visibleChartData ?? {
      rootNodes: [],
      nodes: [],
      groupNodes: [],
      edges: [],
      nodeSize: { width: 1, height: 1 },
      translateExtent: [
        [0, 0],
        [0, 0],
      ],
    },
  };
  return (
    <OrgChartDataSourceContext.Provider value={dataSource as DataSource}>
      {props.children}
    </OrgChartDataSourceContext.Provider>
  );
};
