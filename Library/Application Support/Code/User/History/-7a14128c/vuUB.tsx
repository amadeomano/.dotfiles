import { useReportModalNavigation } from './useReportModalNavigation';
import { ID as FPS, FPSReport } from '../FPSReport';
import { ID as GROSS_TO_NET, GrossToNetReport } from '../GrossToNetReport';
import { ID as COMP_BY_EE, CompByEEReport } from '../CompByEEReport';
import { ID as DEF_REC, DifferencesRecReport } from '../DifferencesRecReport';
import { ID as EE_BY_COMP, EEByCompReport } from '../EEByCompReport';
import { ID as YDT_REC, YTDReport } from '../YTDReport';
import { ID as HMRC_P32, HMRCP32Report } from '../HMRCP32';

export const ReportRouter = () => {
  const { closeModal, getActiveReport } = useReportModalNavigation();
  const activeReport = getActiveReport();

  const allReports = {
    [FPS]: FPSReport,
    [GROSS_TO_NET]: GrossToNetReport,
    [COMP_BY_EE]: CompByEEReport,
    [DEF_REC]: DifferencesRecReport,
    [EE_BY_COMP]: EEByCompReport,
    [YDT_REC]: YTDReport,
    [HMRC_P32]: HMRCP32Report,
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
