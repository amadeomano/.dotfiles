import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  PropertyListItem,
  PropertyListItemLabel,
  PropertyListItemValue,
} from 'designSystem/component/property-list';
import { Token } from 'designSystem/component/token';
import { Inline, Stack } from 'designSystem/component/layout';

import {
  EMPTY_VALUE_PLACEHOLDER,
  FeatureFlags,
} from '@personio-web/employees-organizations-util-org-units';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { useGeneratePersonLink } from '@personio-web/employees-organizations-hook-use-generate-person-link';

import { toTranslate } from '../toTranslate';
import { type OrgUnitResult } from '../../types';
import OrgUnitsLeadsPromoTag from '../../components/org-units-leads-promo-tag';
import detailsStyles from '../OrgUnitDetails.module.scss';

const LazyEntityHoverCard = {
  Person: React.lazy(() =>
    import(
      '@personio-web/employees-organizations-feature-entity-hover-card'
    ).then((module) => ({
      default: module.EntityHoverCard.Person,
    })),
  ),
};

type Props = {
  orgUnit: OrgUnitResult;
};

export const Leads = ({ orgUnit }: Props) => {
  const { t } = useTranslation('org-units');
  const featureFlag = useFeatureFlag(FeatureFlags.ENABLE_LEADS);
  const leadsPromoTagFlag = useFeatureFlag(FeatureFlags.ENABLE_LEADS_PROMO_TAG);
  const generatePersonLink = useGeneratePersonLink();

  const isLeadsEnabled = featureFlag.isReady && featureFlag.isOn;
  const isLeadsPromoTagEnabled =
    leadsPromoTagFlag.isReady && leadsPromoTagFlag.isOn;

  if (!isLeadsEnabled) return null;

  const title: string = t('attributes.leads', {
    defaultValue: toTranslate.attributes.leads,
  });

  const leads = orgUnit?.orgUnitLeadsList ?? [];

  return (
    <PropertyListItem aria-label={title}>
      <PropertyListItemLabel className={detailsStyles.listRowDescription}>
        <Inline alignVertical="center" space="gap-default">
          <span>{title}</span>
          {isLeadsPromoTagEnabled && <OrgUnitsLeadsPromoTag />}
        </Inline>
      </PropertyListItemLabel>
      <React.Suspense fallback={null}>
        {leads.length > 0 ? (
          <PropertyListItemValue.Custom
            value={
              <Stack space="gap-xsmall" className={detailsStyles.leadsStack}>
                {leads.map((lead) => (
                  <LazyEntityHoverCard.Person
                    id={lead.personId.id}
                    href={generatePersonLink(lead.personId.id)}
                  >
                    <Token
                      avatar={{
                        name: lead.person?.preferredName?.value || '',
                        src: lead.person?.profilePicUrls?.paths?.small || '',
                      }}
                      label={lead.person?.preferredName?.value || ''}
                    />
                  </LazyEntityHoverCard.Person>
                ))}
              </Stack>
            }
          />
        ) : (
          <PropertyListItemValue.Text value={EMPTY_VALUE_PLACEHOLDER} />
        )}
      </React.Suspense>
    </PropertyListItem>
  );
};

Leads.displayName = 'PropertyListItem';
