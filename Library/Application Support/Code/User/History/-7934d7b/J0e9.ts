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
  // TODO: refactor to Promise.withResolvers once the ECMA-2024 is supported
  let resolve, reject;
  const promise = new Promise<PersonColumnData>((res, rej) => {
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

  if (error) reject(error);

  const persons: PersonColumnData[] = useMemo(
    () =>
      data?.persons?.list.map((p) => ({
        id: p.id,
        name: `${p.firstName?.value} ${p.lastName?.value}`,
        avatar: p.profilePicUrls?.paths?.small ?? undefined,
      })) ?? [],
    [data],
  );

  return promise;
  // return { persons, loading, error };
};
