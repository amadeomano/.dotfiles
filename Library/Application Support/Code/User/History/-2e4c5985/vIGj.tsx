import { Skeleton } from '@personio-web/ds-candidate-skeleton';
import { usePreviewPayrollRunFPS } from '@personio-web/payroll-data-payroll-me';
import { previewPayrollRunFPSAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { type AxiosResponse } from 'axios';
import { toaster } from 'designSystem/component/toaster';
import { useCallback, useEffect, useState } from 'react';
import { type DocumentRow } from '../../components/DocumentsTable/columns';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import {
  useGetDefaultHeaders,
  useWrapMutation,
} from '../../hooks/temporary/useWrapQuery';
import { buildFilename, downloadTextAsXMLFile } from '../../utils/fileDownload';
import { XMLPrettyPreview } from '../../utils/xml';
import { ReportModal } from './components/ReportModal';
import { useReportModalNavigation } from './components/useReportModalNavigation';

export const ID = 'fps';

export const useDocumentTableRow = (): DocumentRow => {
  const { runIsApproved } = useCurrentPayrollRun();
  const { openModal } = useReportModalNavigation();
  const { fetch, download } = useFPSPreviewFetchState();

  return {
    name: 'FPS Submission Preview',
    type: 'HMRC',
    preview: () => openModal(ID),
    download: () => fetch(download),
    enabled: runIsApproved,
  };
};

const useFPSPreviewFetchState = () => {
  const [xmlBody, setXmlBody] = useState<string | undefined>(undefined);

  const { run } = useCurrentPayrollRun();
  const defaultHeaders = useGetDefaultHeaders();
  const { mutateAsync } = useWrapMutation(
    usePreviewPayrollRunFPS,
    previewPayrollRunFPSAPI,
    { responseType: 'text' }, // TODO: How to fix responseType inside request-sync's useRenderPayrollRunPayslip?
  );

  return {
    xmlBody,
    download(body: string | undefined = xmlBody) {
      body &&
        run &&
        downloadTextAsXMLFile(body, buildFilename('fps_preview', run, 'xml'));
    },
    fetch: useCallback(
      async (callback: (body: string) => void = setXmlBody) => {
        if (!run?.id) return;

        return mutateAsync({
          requestPathParams: { id: run?.id },
          requestHeaders: defaultHeaders,
          requestBody: {
            username: 'PLACEHOLDER',
            password: 'PLACEHOLDER',
          },
          responseType: 'text',
        })
          .then((data) => {
            const body = (data as unknown as AxiosResponse).data;
            callback && callback(body);
          })
          .catch((error) => {
            console.error('FPS Preview error', { error });
            toaster.notify({
              variant: 'error',
              title: 'Problem previewing FPS',
              description: 'Unable to fetch FPS preview',
              showCloseButton: true,
              duration: 5000,
            });
          });
      },
      [run?.id, mutateAsync],
    ),
  };
};

export const FPSReport = () => {
  const { closeModal } = useReportModalNavigation();
  const { xmlBody, fetch, download } = useFPSPreviewFetchState();
  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <ReportModal
      title="FPS Submission Preview"
      onClose={closeModal}
      downloadCSVAction={xmlBody ? download : undefined}
    >
      {xmlBody ? <XMLPrettyPreview xml={xmlBody} /> : <Skeleton repeat={20} />}
    </ReportModal>
  );
};
