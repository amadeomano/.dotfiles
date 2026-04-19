import { useReportModalNavigation } from './useReportModalNavigation';
import {
  REPORT_ID as GROSS_TO_NET,
  GrossToNetReport,
} from '../useGrossToNetReport';
import {
  REPORT_ID as COMP_BY_EE,
  useCompByEEReportModalData,
} from '../useCompByEEReport';
import {
  REPORT_ID as DEF_REC,
  useDifferencesRecReportModalData,
} from '../useDifferencesRecReport';

export const ReportRouter = () => {
  const { closeModal, getActiveReport } = useReportModalNavigation();
  const activeReport = getActiveReport();

  const allReports = {
    [GROSS_TO_NET]: GrossToNetReport,
    [COMP_BY_EE]: useCompByEEReportModalData(),
    [DEF_REC]: useDifferencesRecReportModalData(),
  };

  if (!activeReport) return null;

  if (!(activeReport in allReports)) {
    closeModal();
    return null;
  }

  const Report = allReports[
    activeReport as keyof typeof allReports
  ] as () => JSX.Element;
  return <Report />;
};
