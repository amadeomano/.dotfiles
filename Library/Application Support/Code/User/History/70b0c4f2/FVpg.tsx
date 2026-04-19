import {
  type CreatePayGroupBody,
  useCreateDefaultSchemas,
  useCreatePayGroup,
  useListEmployerCompensationSchemas,
  useListFilings,
  useListSchemaMappings,
  useSaveSchemaMappings,
} from '@personio-web/payroll-data-payroll-me';
import {
  createDefaultSchemasAPI,
  createPayGroupAPI,
  listEmployerCompensationSchemasAPI,
  listFilingsAPI,
  listSchemaMappingsAPI,
  saveSchemaMappingsAPI,
} from '@personio-web/payroll-data-payroll-me/src/common';
import { Button } from 'designSystem/component/button';
import { v4 as uuid } from 'uuid';
import { usePayGroups } from '../../hooks/payroll-lifecycle/usePayGroups';
import { useCurrentPayrollGroup } from '../../data/useCurrentPayrollGroup';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import {
  useGetDefaultHeaders,
  useWrapMutation,
  useWrapQuery,
} from '../../hooks/temporary/useWrapQuery';
import { useGbNavigation } from '../../hooks/usePayrollGbBreadcrumbsNavigation';
import { Tooltip } from 'designSystem/component/tooltip';

export const DevelopmentHelperTab = () => {
  const { legalEntityId } = useGbNavigation();
  const defaultHeaders = useGetDefaultHeaders();

  const { mutate: mutateCreateGroup } = useWrapMutation(
    useCreatePayGroup,
    createPayGroupAPI,
  );

  const createGroup = () => {
    if (!legalEntityId) {
      console.error('Unable to read legal entity', {
        le: legalEntityId,
      });
      return;
    }

    const requestBody: CreatePayGroupBody = {
      legalEntityId: legalEntityId,
      frequency: 'MONTHLY' as const,
      firstPeriodPayDate: '2024-04-20',
      name: 'Monthly payroll',
      id: uuid(),
    };

    mutateCreateGroup(
      { requestBody, requestHeaders: defaultHeaders },
      {
        onSuccess() {
          refetchGroups();
        },
      },
    );
  };

  const { data: schemaMappings, refetch: refetchSchemaMappings } = useWrapQuery(
    useListSchemaMappings,
    listSchemaMappingsAPI,
  )({
    requestQuery: { legalEntityId: legalEntityId ?? '' },
    requestHeaders: defaultHeaders,
    enabled: Boolean(legalEntityId),
  });

  const { payGroups, payGroupsRefetch } = usePayGroups();

  const { run, allRunsInGroup: runs } = useCurrentPayrollRun();

  const { data: compensations, refetch: refetchCompensations } = useWrapQuery(
    useListEmployerCompensationSchemas,
    listEmployerCompensationSchemasAPI,
  )({
    requestQuery: { legalEntityId: legalEntityId ?? '' },
    requestHeaders: defaultHeaders,
    enabled: Boolean(legalEntityId),
  });
  const { data: filings } = useWrapQuery(
    useListFilings,
    listFilingsAPI,
  )({
    requestHeaders: defaultHeaders,
  });

  const { mutate: mutateCreateMappings } = useWrapMutation(
    useSaveSchemaMappings,
    saveSchemaMappingsAPI,
  );

  const { mutate: mutateCreateCompensations } = useWrapMutation(
    useCreateDefaultSchemas,
    createDefaultSchemasAPI,
  );

  // Note: hardcoded to companyId = 1355607 until we have mapping UI
  const createMappings = () => {
    if (!legalEntityId) return null;
    const params = {
      legalEntityId: legalEntityId,
      mappings: [
        {
          compensationTypeId: 'FIXED_SALARY',
          employerSchemaId: '89AC60D2-73E5-4811-9B7C-C2711FE903C0',
        },
        {
          compensationTypeId: 'HOURLY_SALARY',
          employerSchemaId: 'F826A7CB-D095-4523-BC7A-652F6FA64BEB',
        },
        {
          compensationTypeId: '018dacea-b012-a16b-003c-6ed4b6479af6',
          employerSchemaId: 'D7A4C955-FBFD-4333-9833-ECA045D54E7C',
        },
        {
          compensationTypeId: '018d9cbe-c78a-a645-8c02-5be9de524da7',
          employerSchemaId: '3D2989A8-63EE-4404-A315-9614CE9A9427',
        },
        {
          compensationTypeId: '018e415a-d787-ae12-1660-3045b2f20002',
          employerSchemaId: '3D2989A8-63EE-4404-A315-9614CE9A9427',
        },
        {
          compensationTypeId: '018e60c4-16e8-a2fe-1553-08513ca12890',
          employerSchemaId: '3D2989A8-63EE-4404-A315-9614CE9A9427',
        },
        {
          compensationTypeId: '018ee731-723f-a287-4f47-11a8d5023112',
          employerSchemaId: '3D2989A8-63EE-4404-A315-9614CE9A9427',
        },
        {
          compensationTypeId: '018ef55d-06dc-a586-2e52-75383693f9e2',
          employerSchemaId: 'EA82B6F7-8CEE-4597-8769-E9DA785C85DF',
        },
        {
          compensationTypeId: '018f0f47-8429-a06b-e2ab-bfac6a49c69c',
          employerSchemaId: 'A55527FF-5508-48C0-B5A2-8796CF73C9A3',
        },
        {
          compensationTypeId: '018f063b-6101-a547-0158-ca9fe8df5b72',
          employerSchemaId: '346E7553-E423-4638-9823-26A04FDBEC1A',
        },
        {
          compensationTypeId: '018ed1c2-07c8-a2fe-2fe7-119004306988',
          employerSchemaId: 'A220A1D4-7E84-4CAB-B3A5-C08B1A3A8212',
        },
        {
          compensationTypeId: '018f0f46-1c9d-add9-a78c-44850d92aad5',
          employerSchemaId: 'A220A1D4-7E84-4CAB-B3A5-C08B1A3A8212',
        },
        {
          compensationTypeId: '018f0aa8-4508-a271-93cd-5304d372806f',
          employerSchemaId: 'E8738B7D-7C82-43DE-92C2-AB92CED0C3E4',
        },
        {
          compensationTypeId: '018ee73f-6dbc-aac3-914a-414b713ccc8b',
          employerSchemaId: 'E8738B7D-7C82-43DE-92C2-AB92CED0C3E4',
        },
      ],
    };
    mutateCreateMappings(
      { requestBody: params, requestHeaders: defaultHeaders },
      {
        onSuccess() {
          refetchSchemaMappings();
        },
      },
    );
  };

  const createCompensations = () => {
    if (!legalEntityId) return;
    mutateCreateCompensations(
      {
        requestQuery: { legalEntityId: legalEntityId },
        requestHeaders: defaultHeaders,
      },
      {
        onSuccess() {
          refetchCompensations();
        },
      },
    );
  };

  return (
    <>
      <div>
        <h3>Debuggery in the UK</h3>
        <p>🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧</p>

        <small>
          <h5>1. Employer compensation schemas (local dev only)</h5>
          <p>
            <Tooltip content="Employer compensation schemas are generic and should be created first">
              <div>
                Existing schemas: {compensations?.data.length}
                <br />
                <Button size="small" onClick={createCompensations}>
                  Create default types
                </Button>
              </div>
            </Tooltip>
            <details>
              <summary>Details</summary>
              <pre>{JSON.stringify(compensations, null, 2)}</pre>
            </details>
          </p>
          <br />

          <h5>2. Compensation schema mappings (local dev only)</h5>
          <Tooltip content="Next, the employer compensation schemas need to be mapped to compensation types. Hardcoded to companyId = 1355607 (local dev only). This mapping can also be done on the Compensations page within Manage">
            <div>
              Existing mappings: {schemaMappings?.data?.length}
              <br />
              <Button size="small" onClick={createMappings}>
                Create mappings
              </Button>
            </div>
          </Tooltip>
          <details>
            <summary>Details</summary>
            <pre>{JSON.stringify(schemaMappings, null, 2)}</pre>
          </details>
          <br />

          <h5>3. Pay groups</h5>
          <Tooltip content="Last, you can create a pay group, which will immediately be used to create a pay run to set up the period navigation">
            <div>
              Groups: {groups?.length}
              <ul>
                {groups?.map((group) => (
                  <li key={group.id}>
                    {group.id} @ {group.legalEntityId}: {group.name} from{' '}
                    {group.payPeriods.at(0)?.startDate} to{' '}
                    {group.payPeriods.at(-1)?.endDate}
                  </li>
                ))}
              </ul>
              <Button size="small" onClick={createGroup}>
                Create default group
              </Button>
            </div>
          </Tooltip>
          <details>
            <summary>Details</summary>
            <pre>{JSON.stringify(groups, null, 2)}</pre>
          </details>

          <br />
          <h5>Other data</h5>
          <details>
            <summary>Payroll runs: {runs?.length}</summary>
            <pre>{JSON.stringify(runs, null, 2)}</pre>
          </details>

          <details>
            <summary>Payroll current run</summary>
            <pre>{JSON.stringify(run, null, 2)}</pre>
          </details>

          <details>
            <summary>Filings ({filings?.data?.length})</summary>
            <pre>{JSON.stringify(filings, null, 2)}</pre>
          </details>
        </small>
      </div>
    </>
  );
};
