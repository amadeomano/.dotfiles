import { useRouter } from 'next/router';

export const useReportModalNavigation = () => {
  const router = useRouter();

  return {
    openModal(report: string) {
      router.push({ query: { ...router.query, report } });
    },

    closeModal() {
      const query = { ...router.query };
      delete query.report;
      router.replace({ query });
    },

    getActiveReport() {
      return router.query.report as string | undefined;
    },
  };
};
