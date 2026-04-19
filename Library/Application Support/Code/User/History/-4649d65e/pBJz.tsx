import { useRetrieveBacsFileForPayrollRun } from '@personio-web/payroll-data-payroll-me';
import { retrieveBacsFileForPayrollRunAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import type { AxiosError, AxiosResponse } from '@personio/request';
import { toaster } from 'designSystem/component/toaster';
import {
  useGetDefaultHeaders,
  useWrapMutation,
} from '../../hooks/temporary/useWrapQuery';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import { buildFilename, downloadTextAsFile } from '../../utils/fileDownload';
import { type PayrollRun } from '../../utils/payrollRun';
import { type DocumentRow } from '../../components/DocumentsTable/columns';

type ServerError = { detail?: string; errors?: { title: string }[] };

export const ID = 'fps';

const getBacsFileName = (run: PayrollRun) => buildFilename('bacs', run, 'txt');

const handleDownload = (filename: string) => (data: unknown) => {
  const content = (data as AxiosResponse).data;
  return downloadTextAsFile(content, filename);
};

const handleError = (error: AxiosError<ServerError>) => {
  toaster.notify({
    variant: 'error',
    title: 'Error with BACS Payment File',
    description:
      error.response?.data.errors?.[0].title ?? error.response?.data.detail,
    showCloseButton: true,
  });
};

export const useDocumentTableRow = (): DocumentRow => {
  const { runIsApproved } = useCurrentPayrollRun();
  const { openModal } = useReportModalNavigation();
  const { fetch, download } = useFPSPreviewFetchState();

  return {
      name: 'Payment File',
      type: 'BACS',
      download: performDownload,
      enabled: runIsApproved,
    },
;
};

export const useRetrieveBacsDocument = () => {
  const { run } = useCurrentPayrollRun();
  const defaultHeaders = useGetDefaultHeaders();
  const { mutateAsync } = useWrapMutation(
    useRetrieveBacsFileForPayrollRun,
    retrieveBacsFileForPayrollRunAPI,
    { responseType: 'text' },
  );

  const performDownload = () => {
    if (!run?.id) return;
    mutateAsync({
      requestPathParams: { payrollRunId: run?.id },
      requestHeaders: defaultHeaders,
      requestBody: { serviceUserNumber: '000000' },
    })
      .then(handleDownload(getBacsFileName(run)))
      .catch(handleError);
  };

  return { performDownload };
};
