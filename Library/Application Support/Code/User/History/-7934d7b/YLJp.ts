import { useMemo } from 'react';
import { useAuthContext } from '@personio-web/auth-context';
import {
  goferClient,
  useListPersonsByIdsQuery,
} from '@personio-web/payroll-data-gofer';

export type PersonColumnData = {
  id: string;
  name: string;
  avatar?: string;
};

export const getPerson = (columnData: PersonColumnData[], id: string) =>
  columnData.find((p) => p.id === id);

export const usePersonColumnData = (personIds: string[]) => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const authContext = useAuthContext();
  const { data, loading, error } = useListPersonsByIdsQuery({
    client: goferClient,
    variables: {
      personIds,
      companyId: authContext.companyId,
    },
    skip: !personIds.length,
  });

  const persons: PersonColumnData[] = useMemo(
    () =>
      data?.persons?.list.map((p) => ({
        id: p.id,
        name: `${p.firstName?.value} ${p.lastName?.value}`,
        avatar: p.profilePicUrls?.paths?.small ?? undefined,
      })) ?? [],
    [data],
  );

  return { persons, loading, error };
};
