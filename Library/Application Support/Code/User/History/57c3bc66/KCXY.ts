import { renderHookWithWrapper } from '@personio-web/config-jest/helpers';
import { QueryClient } from '@tanstack/react-query';

import { getQueryKeyForDocument } from '@personio-web/gofer/src/query/utils/getQueryKeyForDocument';
import { useInvalidateListOrgUnitsHierarchyQuery } from '../useInvalidateListOrgUnitsHierarchyQuery';
import { ListOrgUnitsHierarchy } from '../../..';

const invalidateQueriesMock = jest.fn();

jest.mock('@tanstack/react-query', () => {
  return {
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: jest.fn(() => ({
      ...new QueryClient(),
      invalidateQueries: invalidateQueriesMock,
    })),
  };
});

jest.mock('@personio-web/gofer/src/query/utils/getQueryKeyForDocument', () => ({
  getQueryKeyForDocument: jest.fn(),
}));

describe('useInvalidateListOrgUnitsHierarchyQuery', () => {
  it('should invalidate list org units hierarchy query', async () => {
    const mockQueryKey = ['ListOrgUnitsHierarchy'];
    (getQueryKeyForDocument as jest.Mock).mockReturnValue(mockQueryKey);

    const { result } = renderHookWithWrapper(
      useInvalidateListOrgUnitsHierarchyQuery,
    );

    result.current();

    expect(getQueryKeyForDocument).toHaveBeenCalledWith({
      document: ListOrgUnitsHierarchy,
      variables: undefined,
      queryOptions: undefined,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: mockQueryKey,
    });
  });
});
