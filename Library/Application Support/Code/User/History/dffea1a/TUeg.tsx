import {
  type CreatePayGroupBody,
  useCreateDefaultSchemas,
  useCreatePayGroup,
  useListCompensations,
  useListFilings,
  useListSchemaMappings,
  useSaveSchemaMappings,
} from '@personio-web/payroll-data-payroll-me';
import {
  createDefaultSchemasAPI,
  createPayGroupAPI,
  listCompensationsAPI,
  listFilingsAPI,
  listSchemaMappingsAPI,
  saveSchemaMappingsAPI,
} from '@personio-web/payroll-data-payroll-me/src/common';
import { Button } from 'designSystem/component/button';
import { useRouter } from 'next/router';
import { v4 as uuid } from 'uuid';
import { useCurrentPayrollGroup } from '../../data/useCurrentPayrollGroup';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import {
  useWrapMutation,
  useWrapQuery,
} from '../../hooks/temporary/useWrapQuery';
import { URL_PARAM_LEGAL_ENTITY } from '../../hooks/usePayrollGbBreadcrumbsNavigation';
import { Tooltip } from 'designSystem/component/tooltip';

export const DevelopmentHelperTab = () => {
  const { query } = useRouter();

  const { mutate: mutateCreateGroup } = useWrapMutation(
    useCreatePayGroup,
    createPayGroupAPI,
  );

  const createGroup = () => {
    if (typeof query[URL_PARAM_LEGAL_ENTITY] !== 'string') {
      console.error('Unable to read legal entity', {
        le: query[URL_PARAM_LEGAL_ENTITY],
      });
      return;
    }

    const requestBody: CreatePayGroupBody = {
      legalEntityId: query[URL_PARAM_LEGAL_ENTITY] as string,
      frequency: 'MONTHLY' as const,
      firstPeriodPayDate: '2024-04-20',
      name: 'Monthly payroll',
      id: uuid(),
    };

    mutateCreateGroup(
      { requestBody },
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
  )({});

  const { allGroups: groups, refetch: refetchGroups } =
    useCurrentPayrollGroup();

  const {
    run,
    allRunsInGroup: runs,
    refetch: refetchRuns,
  } = useCurrentPayrollRun();

  const { data: compensations, refetch: refetchCompensations } = useWrapQuery(
    useListCompensations,
    listCompensationsAPI,
  )({});
  const { data: filings, refetch: refetchFilings } = useWrapQuery(
    useListFilings,
    listFilingsAPI,
  )({});

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
    const params = {
      mappings: [
        {
          compensationTypeId: 'gehalt',
          employerSchemaId: 1,
        },
        {
          compensationTypeId: 'monatslohn_individuell',
          employerSchemaId: 2,
        },
        {
          compensationTypeId: '018dacea-b012-a16b-003c-6ed4b6479af6',
          employerSchemaId: 3,
        },
        {
          compensationTypeId: '018d9cbe-c78a-a645-8c02-5be9de524da7',
          employerSchemaId: 4,
        },
        {
          compensationTypeId: '018e415a-d787-ae12-1660-3045b2f20002',
          employerSchemaId: 4,
        },
        {
          compensationTypeId: '018e60c4-16e8-a2fe-1553-08513ca12890',
          employerSchemaId: 4,
        },
        {
          compensationTypeId: '018ee731-723f-a287-4f47-11a8d5023112',
          employerSchemaId: 4,
        },
        {
          compensationTypeId: '018ef55d-06dc-a586-2e52-75383693f9e2',
          employerSchemaId: 7,
        },
        {
          compensationTypeId: '018f0f47-8429-a06b-e2ab-bfac6a49c69c',
          employerSchemaId: 9,
        },
        {
          compensationTypeId: '018f063b-6101-a547-0158-ca9fe8df5b72',
          employerSchemaId: 10,
        },
        {
          compensationTypeId: '018ed1c2-07c8-a2fe-2fe7-119004306988',
          employerSchemaId: 16,
        },
        {
          compensationTypeId: '018f0f46-1c9d-add9-a78c-44850d92aad5',
          employerSchemaId: 16,
        },
        {
          compensationTypeId: '018f0aa8-4508-a271-93cd-5304d372806f',
          employerSchemaId: 17,
        },
        {
          compensationTypeId: '018ee73f-6dbc-aac3-914a-414b713ccc8b',
          employerSchemaId: 17,
        },
      ],
    };
    mutateCreateMappings(
      { requestBody: params },
      {
        onSuccess() {
          refetchSchemaMappings();
        },
      },
    );
  };
  const createCompensations = () => {
    const legalEntityId = 123;
    mutateCreateCompensations(
      { requestBody: {} },
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
          <h5>1. Employer compensation schemas</h5>
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

          <h5>2. Compensation schema mappings</h5>
          <Tooltip content="Next, the employer compensation schemas need to be mapped to compensation types. Hardcoded to companyId = 1355607 until we have a way to map them">
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
