import { type ListOrgUnitsQueryResult } from '@personio-web/employees-organizations-gofer';

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

export const SpanOfControl = () => {};
