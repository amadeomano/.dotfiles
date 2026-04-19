/**
 * Types should be defined in the types.ts file and re-exported here
 */
declare module '@personio-web/employees-organizations-util-people-types' {
  export type ORG_CHART_URL_BASE_TYPE = import('./types').ORG_CHART_URL_BASE;
  export type OrgChartFilter = import('./types').OrgChartFilter;
  export type GenerateOrgChartLinkOptions =
    import('./types').GenerateOrgChartLinkOptions;
  export type GenerateOrgChartLink = (
    options: Partial<GenerateOrgChartLinkOptions>,
  ) => string;

  const generateOrgChartLink: GenerateOrgChartLink;
  const ORG_CHART_URL_BASE: ORG_CHART_URL_BASE_TYPE;

  export { generateOrgChartLink, ORG_CHART_URL_BASE };
}

declare module 'employeesOrganizations/util/people' {
  export * from '@personio-web/employees-organizations-util-people-types';
}

declare module '@personio-web/employees-organizations-util-people' {
  export * from '@personio-web/employees-organizations-util-people-types';
}

declare module 'employeeOrganizations/registerMocks';
