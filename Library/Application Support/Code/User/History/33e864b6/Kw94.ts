import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useCurrentPayrollGroup } from '../data/useCurrentPayrollGroup';
import { useLegalEntities } from './useLegalEntities';

export const URL_PARAM_LEGAL_ENTITY = 'le';
export const URL_PARAM_PAYROLL_GROUP = 'pg';
export const URL_PARAM_PAYROLL_PERIOD = 'period';

export const useGbNavigation = (initialTab = '/payroll/personal') => {
  const router = useRouter();

  const updateURLWithPayrollData = useCallback(
    (overrides: {
      legalEntityId?: string;
      groupId?: string;
      period?: number;
    }) => {
      const newQuery = {
        ...router.query,
        ...(overrides.groupId
          ? { [URL_PARAM_PAYROLL_GROUP]: overrides.groupId }
          : {}),
        ...(overrides.legalEntityId
          ? { [URL_PARAM_LEGAL_ENTITY]: overrides.legalEntityId }
          : {}),
        ...(overrides.period
          ? { [URL_PARAM_PAYROLL_PERIOD]: overrides.period }
          : {}),
      };

      const was = JSON.stringify(router.query);
      const next = JSON.stringify(newQuery);

      if (was !== next) {
        router.push({
          query: newQuery,
        });
      }
    },
    [initialTab, router],
  );

  return {
    updateURLWithPayrollData,
    // currentRoute,
    legalEntityId: router.query[URL_PARAM_LEGAL_ENTITY] as string | undefined,
    groupId: router.query[URL_PARAM_PAYROLL_GROUP] as string | undefined,
    period: router.query[URL_PARAM_PAYROLL_PERIOD]
      ? Number(router.query[URL_PARAM_PAYROLL_PERIOD])
      : undefined,
  };
};

export const usePayrollGbBreadcrumbs = () => {
  const { updateURLWithPayrollData, legalEntityId } = useGbNavigation();
  const { legalEntityGroups, group } = useCurrentPayrollGroup();
  const { legalEntities } = useLegalEntities();

  const breadcrumbs = [
    {
      id: URL_PARAM_LEGAL_ENTITY,
      label: legalEntities[legalEntityId as string]?.name || 'No Legal Entity',
      dropdownItems: Object.entries(legalEntities).map(([id, legalEntity]) => ({
        id: String(id),
        label: legalEntity.name,
        onClick: () => updateURLWithPayrollData({ legalEntityId: String(id) }),
      })),
    },
  ];

  if (legalEntityGroups.length > 0) {
    breadcrumbs.push({
      id: URL_PARAM_PAYROLL_GROUP,
      label: group ? group.name : 'Payroll group',
      dropdownItems: legalEntityGroups.map((leGroup) => ({
        id: String(leGroup.id),
        label: leGroup.name,
        onClick: () =>
          updateURLWithPayrollData({ groupId: String(leGroup.id) }),
      })),
    });
  }

  return { breadcrumbs, status: 'success' as const };
};

export const useSyncSetup = (initialTab: string) => {
  const { updateURLWithPayrollData, legalEntityId, groupId } =
    useGbNavigation(initialTab);

  const { legalEntities } = useLegalEntities();
  const { legalEntityGroups } = useCurrentPayrollGroup();

  useEffect(() => {
    let le = legalEntityId ?? Object.keys(legalEntities)[0];

    if (!legalEntities[le]) {
      le = Object.keys(legalEntities)[0];
    }

    let nextGroupId = String(groupId ?? '');

    if (legalEntityGroups.length === 0) {
      nextGroupId = '';
    } else if (!legalEntityGroups?.find(({ id }) => id === nextGroupId)) {
      nextGroupId = String(legalEntityGroups[0].id);
    }

    updateURLWithPayrollData({
      legalEntityId: le,
      groupId: nextGroupId,
    });
  }, [updateURLWithPayrollData, legalEntityId, groupId, legalEntityGroups]);
};
