import {
  useCreateDefaultSchemas,
  useCreatePayGroup,
  useCreatePayrollRun,
  useListCompensations,
  useListSchemaMappings,
  useSaveSchemaMappings,
  CreatePayGroupBody,
} from '@personio-web/payroll-data-payroll-me';
import {
  createDefaultSchemasAPI,
  createPayGroupAPI,
  createPayrollRunAPI,
  listCompensationsAPI,
  listSchemaMappingsAPI,
  saveSchemaMappingsAPI,
} from '@personio-web/payroll-data-payroll-me/src/common';
import { Button } from 'designSystem/component/button';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import { useCurrentPayrollGroup } from '../../data/useCurrentPayrollGroup';
import {
  useWrapMutation,
  useWrapQuery,
} from '../../hooks/temporary/useWrapQuery';
import { URL_PARAM_LEGAL_ENTITY } from '../../hooks/usePayrollGbBreadcrumbsNavigation';
import { useRouter } from 'next/router';

export const DevelopmentHelperTab = () => {
  const { query } = useRouter();

  const { mutate: mutateCreateGroup } = useWrapMutation(
    useCreatePayGroup,
    createPayGroupAPI,
  );

  const { mutate: mutateCreateRun } = useWrapMutation(
    useCreatePayrollRun,
    createPayrollRunAPI,
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
      id: '8046237e-1452-4296-9a5a-ad6d89997880',
    };

    mutateCreateGroup(
      { requestBody },
      {
        onSuccess: refetchGroups,
      },
    );
  };

  const createRun = () => {
    const params = {
      payGroupId: 1, // TODO: from context
      payDate: '2024-05-20', // TODO: from group currentPeriod -> payDate
    };

    mutateCreateRun(
      { requestBody: params },
      {
        onSuccess() {
          refetchRuns();
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
  const createCompensations = () =>
    mutateCreateCompensations(undefined, {
      onSuccess() {
        refetchCompensations();
      },
    });

  return (
    <>
      <div>
        <h3>Debuggery in the UK</h3>
        <p>🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧🇬🇧</p>

        <small>
          <details>
            <summary>
              <b>Groups: {groups?.length}</b>
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
            </summary>
            <pre>{JSON.stringify(groups, null, 2)}</pre>
          </details>

          <details>
            <summary>
              Employer compensation schemas: {compensations?.data.length}
              <br />
              <Button size="small" onClick={createCompensations}>
                Create default types
              </Button>
            </summary>
            <pre>{JSON.stringify(compensations, null, 2)}</pre>
          </details>

          <details>
            <summary>
              Compensation schema mappings: {schemaMappings?.data?.length}
              <br />
              <Button size="small" onClick={createMappings}>
                Create mappings
              </Button>
            </summary>
            <pre>{JSON.stringify(schemaMappings, null, 2)}</pre>
          </details>

          <details>
            <summary>
              Payroll runs: {runs?.length}
              <br />
              <Button size="small" onClick={createRun}>
                Create default run
              </Button>
            </summary>
            <pre>{JSON.stringify(runs, null, 2)}</pre>
          </details>

          <details>
            <summary>Payroll current run</summary>
            <pre>{JSON.stringify(run, null, 2)}</pre>
          </details>
        </small>
      </div>
    </>
  );
};
