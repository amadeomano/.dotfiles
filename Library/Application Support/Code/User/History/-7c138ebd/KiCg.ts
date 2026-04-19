import {
  useTabNavigator,
  getQueryWithNewTab,
} from '../../hooks/navigators/useTabsNavigator';
import { getQueryWithoutPayRun } from '../../hooks/navigators/usePayRunNavigator';
import { type NextRouter, useRouter } from 'next/router';

const navigateToDocumentsTab = (router: NextRouter) => () => {
  const query = getQueryWithNewTab(
    getQueryWithoutPayRun(router.query),
    'documents',
  );
  router.replace({ query });
};

export const usePayrunApprovalNavigator = () => {
  const router = useRouter();

  return {
    navigateToDocumentsTab: navigateToDocumentsTab(router),
  };
};
