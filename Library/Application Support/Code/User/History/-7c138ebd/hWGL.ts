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
