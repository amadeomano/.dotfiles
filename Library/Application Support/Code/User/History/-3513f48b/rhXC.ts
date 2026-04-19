import { useAuthContext } from '@personio-web/auth-context';
import { goferClient, useListPersonsByIdsQuery } from 'payroll/data/gofer';

export const usePersonColumnData = (personIds: string[]) => {
  const authContext = useAuthContext();
  const { data, loading, error } = useListPersonsByIdsQuery({
    client: goferClient,
    variables: {
      personIds,
      companyId: authContext.companyId,
    },
    skip: !personIds.length,
  });

  return data?.persons?.list.map((p) => ({
    id: p.id,
    name: `${p.firstName?.value} ${p.lastName?.value}`,
    avatar: p.profilePicUrls?.paths?.small,
  }));
};
