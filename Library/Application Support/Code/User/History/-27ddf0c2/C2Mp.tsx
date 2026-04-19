import { useRetrieveBacsFileForPayrollRun } from '@personio-web/payroll-data-payroll-me';
import { retrieveBacsFileForPayrollRunAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import type { ListPayrollRunsData } from '@personio-web/payroll-data-payroll-me';
import type { AxiosError, AxiosResponse } from '@personio/request';
import { toaster } from 'designSystem/component/toaster';
import { useWrapMutation } from '../temporary/useWrapQuery';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';

type ServerError = { errors: { title: string }[] };

const getFileName = (run?: ListPayrollRunsData['data'][number]) =>
  `Pay_${run?.legalEntityId}_${run?.payGroupId}_bacs_${run?.taxYear}_${run?.period}.txt`;

const handleError = (error: AxiosError<ServerError>) =>
  toaster.notify({
    variant: 'error',
    description: error.response?.data.errors[0].title,
    showCloseButton: true,
  });
const handleDownload = (filename: string) => (data: unknown) => {
  const file = new Blob([(data as AxiosResponse).data], {
    type: 'text/plain',
  });
  const referenceURL = URL.createObjectURL(file);

  const link = document.createElement('a');
  link.href = referenceURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(referenceURL);
};

export const useRetrieveBacsDocument = () => {
  const { run } = useCurrentPayrollRun();
  const { mutateAsync } = useWrapMutation(
    useRetrieveBacsFileForPayrollRun,
    retrieveBacsFileForPayrollRunAPI,
    { responseType: 'text' },
  );

  const performDownload = () => {
    if (!run?.id) return;
    mutateAsync({
      requestPathParams: { payrollRunId: run?.id },
      requestBody: { serviceUserNumber: '000000' },
    })
      .then(handleDownload(getFileName(run)))
      .catch(handleError);
  };
};
