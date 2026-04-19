/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo } from 'react';

import { useGetFeatureAccess } from '@personio-web/employees-organizations-data-feature-access';
import { useGetEmployeeListColumns } from '@personio-web/employees-organizations-data-people-list';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';

import { FeatureFlags } from '../constants';

export function useGetAdditionalSupervisorAttributes() {
  const { isReady, isOn } = useFeatureFlag(FeatureFlags.ENABLE_SPOTLIGHT);
  const isSpotlightFFEnabled = isReady && isOn;

  const { data: featureAccessData, isLoading: isFeatureAccessLoading } =
    useGetFeatureAccess({
      requestPathParams: { area: 'additional_supervisors' },
      enabled: isSpotlightFFEnabled,
    });

  const { data, isLoading: isColumnsLoading } = useGetEmployeeListColumns({
    enabled:
      isSpotlightFFEnabled && featureAccessData?.data?.additional_supervisors,
    requestQuery: {
      enrich_employee_info_attributes: true,
    },
  });

  const additionalSupervisorAttributes = useMemo(() => {
    const filteredAttributes = data?.data.filter(
      (attribute) =>
        attribute.type === 'AdditionalSupervisorIdList' &&
        attribute.universalId,
    );

    if (!filteredAttributes?.length) {
      return undefined;
    }

    return filteredAttributes.reduce<Record<string, string>>(
      (attributes, { universalId, label }) => {
        attributes[universalId!] = label;
        return attributes;
      },
      {},
    );
  }, [data?.data]);

  console.log('[] additional supervisors ', additionalSupervisorAttributes);

  return {
    additionalSupervisorAttributes,
    isLoading: !isReady || isFeatureAccessLoading || isColumnsLoading,
  };
}
