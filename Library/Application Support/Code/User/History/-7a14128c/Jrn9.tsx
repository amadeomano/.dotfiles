import { useReportModalNavigation } from './useReportModalNavigation';

export const ReportRouter = () => {
  const { closeModal, getActiveReport } = useReportModalNavigation();
  const activeReport = getActiveReport();

  const allReports = {
    [GROSS_TO_NET]: useGrossToNetReportModalData(),
    [COMP_BY_EE]: useCompByEEReportModalData(),
    [DEF_REC]: useDifferencesRecReportModalData(),
  };

  if (!activeReport || !(activeReport in allReports)) {
    closeModal();
    return <></>;
  }
};
