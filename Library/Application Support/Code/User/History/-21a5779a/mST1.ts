import { useQueryClient } from '@tanstack/react-query';

import { getQueryKeyForDocument } from '@personio-web/gofer/src/query/utils/getQueryKeyForDocument';
import {
  ListOrgUnitsHierarchy,
  type UseListOrgUnitsHierarchyProps,
} from '../..';

export const useInvalidateListOrgUnitsHierarchyQuery = () => {
  const queryClient = useQueryClient();

  const invalidateListOrgUnitsHierarchyQuery = (
    variables?: UseListOrgUnitsHierarchyProps['variables'],
    queryOptions?: UseListOrgUnitsHierarchyProps['queryOptions'],
  ) => {
    const queryKey = getQueryKeyForDocument({
      document: ListOrgUnitsHierarchy,
      variables,
      queryOptions,
    });

    return queryClient.invalidateQueries({
      queryKey,
    });
  };

  return invalidateListOrgUnitsHierarchyQuery;
};
