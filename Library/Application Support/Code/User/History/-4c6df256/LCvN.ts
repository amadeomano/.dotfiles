import request from '@personio/request';
import { PeopleDataAPI, PeopleDataResponse } from '../types';
import { PayrollIntegration } from '@personio-web/payroll-data-payroll-integration-context-types';

export const getPeopleData = (
  integration: PayrollIntegration,
  legalEntityId?: string,
): Promise<PeopleDataResponse['data']> =>
  request(PeopleDataAPI.API_PATH(integration), {
    params: { legalEntityId },
  }).then(({ data }: { data: PeopleDataResponse }) => data.data);
