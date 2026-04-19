import React, { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { type EmploymentDataFragment } from '@personio-web/employees-organizations-data-gofer';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import {
  type ActionConfig,
  ActionMenu,
  type ActionMenuProps,
} from 'designSystem/component/action-menu';

import { FeatureFlags } from '../../constants';
import {
  useHasInclusionsAccess,
  useMutateInclusions,
  useOrgChartPreferencesContext,
} from '../../hooks';

export type CardMenuProps = React.PropsWithChildren<{
  person?: EmploymentDataFragment['person'];
  isIncluded?: boolean;
  type?: ActionMenuProps<null>['type'];
}>;

export const CardMenu = ({
  person,
  isIncluded,
  children,
  type = 'context',
}: CardMenuProps) => {
  const hasInclusionsAccess = useHasInclusionsAccess();

  const { removePerson, isLoading: isMutationLoading } = useMutateInclusions();

  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.quick-actions',
  });

  const { isReady, isOn } = useFeatureFlag(FeatureFlags.ENABLE_SPOTLIGHT);
  const isSpotlightFFEnabled = isReady && isOn;

  const { setSpotlight, setFilters } = useOrgChartPreferencesContext();

  const handleOnSelectSpotlight = useCallback(() => {
    if (person?.id) {
      console.log('[] setting sportlight for ', person.id);
      setSpotlight?.(person.id, 'card-menu');
      setFilters?.([]);
    }
  }, [person?.id, setSpotlight, setFilters]);

  const options = useMemo(
    () =>
      [
        hasInclusionsAccess && isIncluded
          ? {
              id: 'remove-inclusion',
              name: t('exclude-from-org-chart'),
              type: 'item',
              onSelect: () =>
                !isMutationLoading &&
                removePerson({
                  id: person?.id ?? '',
                  name: person?.preferredName?.value ?? undefined,
                }),
            }
          : null,
        isSpotlightFFEnabled
          ? {
              id: 'spotlight-person',
              name: t('set-spotlight'),
              type: 'item' as const,
              onSelect: handleOnSelectSpotlight,
            }
          : null,
        {
          id: 'copy-email',
          name: t('copy-email'),
          type: 'item' as const,
          onSelect: () => {
            navigator?.clipboard?.writeText(person?.email?.value ?? '');
          },
        },
      ].filter(Boolean) as ActionConfig<null>,
    [
      hasInclusionsAccess,
      isIncluded,
      t,
      isSpotlightFFEnabled,
      handleOnSelectSpotlight,
      isMutationLoading,
      removePerson,
      person?.id,
      person?.preferredName?.value,
      person?.email?.value,
    ],
  );

  return (
    <ActionMenu
      type={type}
      context=""
      actions={options}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </ActionMenu>
  );
};
