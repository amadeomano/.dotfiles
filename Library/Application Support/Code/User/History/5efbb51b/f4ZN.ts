export const useReportModalNavigation = () => {
  const router = useRouter();

  return {
    openModal(report: string) {
      router.push({ query: { ...router.query, report } });
    },

    closeModal() {
      const { report, ...query } = router.query;
      router.replace({ query });
    },

    getActiveReport() {
      return router.query.report as string | undefined;
    },
  };
};
