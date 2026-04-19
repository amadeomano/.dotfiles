import { useEffect } from 'react';
import { useCurrentPayrollGroup } from '../data/useCurrentPayrollGroup';
import { useLegalEntities } from './useLegalEntities';
import { useLegalEntityNavigator } from './navigators/useLegalEntityNavigator';
import { parseAsString, parseAsInteger, useQueryState } from 'nuqs-next-router';

export const URL_PARAM_LEGAL_ENTITY = 'le';
export const URL_PARAM_PAYROLL_GROUP = 'pg';
export const URL_PARAM_PAYROLL_PERIOD = 'period';

export const useGbNavigation = () => {
  const [legalEntityId, setLegalEntityId] = useQueryState(
    URL_PARAM_LEGAL_ENTITY,
    parseAsString,
  );
  const [groupId, setGroupId] = useQueryState(
    URL_PARAM_PAYROLL_GROUP,
    parseAsString,
  );
  const [period, setPeriod] = useQueryState(
    URL_PARAM_PAYROLL_PERIOD,
    parseAsInteger,
  );
  // const { legalEntityId } = useLegalEntityNavigator();

  const updateURLWithPayrollData = (overrides: {
    legalEntityId?: string;
    groupId?: string;
    period?: number;
  }) => {
    if (!overrides.legalEntityId) setLegalEntityId(null);
    else if (overrides.legalEntityId !== legalEntityId)
      setLegalEntityId(overrides.legalEntityId);

    if (!overrides.groupId) setGroupId(null);
    else if (overrides.groupId !== groupId) setGroupId(overrides.groupId);

    if (!overrides.period) setPeriod(null);
    else if (overrides.period !== period) setPeriod(overrides.period);
  };

  return {
    updateURLWithPayrollData,
    legalEntityId,
    groupId,
    period,
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

export const useSyncSetup = () => {
  const { updateURLWithPayrollData, legalEntityId, groupId } =
    useGbNavigation();

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
    } else if (!legalEntityGroups?.find((g) => String(g.id) === nextGroupId)) {
      nextGroupId = String(legalEntityGroups[0].id);
    }

    updateURLWithPayrollData({
      legalEntityId: le,
      groupId: nextGroupId,
    });
  }, [updateURLWithPayrollData, legalEntityId, groupId, legalEntityGroups]);
};
