import { type ListOrgUnitsQueryResult } from '@personio-web/employees-organizations-gofer';

type OrgUnit = NonNullable<
  ListOrgUnitsQueryResult['orgUnits']
>['orgUnitsList'][number];

type SpanOfControlProps = { orgUnit: OrgUnit };
export const SpanOfControl = ({ orgUnit }: SpanOfControlProps) => {};
