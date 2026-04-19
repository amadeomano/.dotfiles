import { type ScopeType } from 'globalExperience/feature/people-widget';

import { generateOrgChartLink } from '@personio-web/eo-commons-org-chart-link';

import { type AboutMeMetadata } from '../../../utils/mapAboutMeMetadata';

export const getScopedOrgChartLink = (
  scope: ScopeType,
  metadata: AboutMeMetadata,
) => {
  if (scope === 'peers' && metadata?.supervisorId) {
    return generateOrgChartLink({
      spotlight: metadata.supervisorId,
    });
  }

  return generateOrgChartLink({
    spotlight: metadata?.personId,
  });
};
