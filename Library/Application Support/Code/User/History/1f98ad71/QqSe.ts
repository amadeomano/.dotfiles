import { usePayGroups } from '../hooks/payroll-lifecycle/usePayGroups';

export function useCurrentPayrollGroup(legalEntityId: string | undefined) {
  const { payGroups, isPayGroupsFetching, isPayGroupsFetched } = usePayGroups();

  const leGroups =
    payGroups?.data?.filter((group) => group.legalEntityId === legalEntityId) ??
    [];

  return {
    // TODO: We only support single group for now
    group: leGroups.at(0),
    legalEntityGroups: leGroups,
    allGroups: payGroups?.data ?? [],
    isPayGroupsFetching,
    isPayGroupsFetched,
  };
}
