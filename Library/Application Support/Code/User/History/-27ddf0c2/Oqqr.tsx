import { useRetrieveBacsFileForPayrollRun } from '@personio-web/payroll-data-payroll-me';
import { retrieveBacsFileForPayrollRunAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapMutation } from '../temporary/useWrapQuery';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';

export const useRetrieveBacsDocument = () => {
  const { run } = useCurrentPayrollRun();
  const { mutateAsync } = useWrapMutation(
    useRetrieveBacsFileForPayrollRun,
    retrieveBacsFileForPayrollRunAPI,
    { responseType: 'text' },
  );

  const performDownload = (onfulfilled: () => void, onrejected: () => void) => {
    if (!run?.id) return;
    mutateAsync({
      requestPathParams: { payrollRunId: run?.id },
      requestBody: { serviceUserNumber: '000000' },
    })
      .then(onfulfilled)
      .catch(onrejected);
  };
};
