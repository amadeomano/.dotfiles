import { useMemo } from 'react';

import { generateOrgChartLink } from '@personio-web/eo-commons-org-chart-link';

import { useAboutMeContext } from '../components/AboutMeProvider/AboutMeProvider';

export const usePersonSpotlightOrgChartLink = () => {
  const { employeeId } = useAboutMeContext();

  return useMemo(
    () =>
      generateOrgChartLink({
        employeeId: Number(employeeId),
        spotlight: employeeId,
        filters: [],
      }),
    [employeeId],
  );
};
