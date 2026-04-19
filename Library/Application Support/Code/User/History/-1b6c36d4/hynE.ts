declare module '@personio-web/payroll-data-gofer-types' {
  export type Google_Type_Date = import('./schema').Google_Type_Date;
  export type Gender =
    import('./schema').Personandemployment_Person_GenderAttribute_Gender_V1;
  export type EmploymentStatus =
    import('./schema').Personandemployment_EmploymentStatusAttribute_Status_V1;
  export type EmploymentType =
    import('./schema').Personandemployment_EmploymentTypeAttribute_Type_V1;
  export type TerminationType =
    import('./schema').Personandemployment_Termination_Type_V1;
  export type ListEmployeesFilterCondition =
    import('./schema').Input_Personandemployment_Condition_V1;
  export type EmploymentExpand =
    import('./schema').Input_Personandemployment_EmploymentExpand_V1;
  export type CustomAttribute =
    import('./schema').Personandemployment_CustomAttribute_V1;
  export type OrgChartInclusions =
    import('./schema').Personandemployment_OrgChartInclusions_V1;
  export type ListOrgChartInclusionsResponse =
    import('./schema').Personandemployment_ListOrgChartInclusionsResponse_V1;

  type DocumentNode = import('graphql').DocumentNode;

  export const ListPersonsByIdsDocument: DocumentNode;
  export type ListPersonsByIdsQuery =
    import('./operations').ListPersonsByIdsQuery;
  export type ListPersonsByIdsQueryVariables =
    import('./operations').ListPersonsByIdsQueryVariables;
  type UseListPersonsByIdsQuery =
    import('./operations.custom').UseListPersonsByIdsQuery;
  export const useListPersonsByIdsQuery: UseListPersonsByIdsQuery;

  export const goferClient: import('@apollo/client').ApolloClient<
    | GetEmployeeHeaderDataQuery
    | GetEmployeeHierarchyQuery
    | ListEmploymentsByPersonIdsQuery
    | UseListFilteredEmploymentIdsQuery
    | UseGetEmploymentBaseDataQuery
    | UseListWorkplacesQuery
    | UseGetWorkplaceByIdQuery
    | UseListHolidayCalendarsQuery
    | UseListPositionIdsQuery
    | UseListPositionsDataQuery
  >;
}

declare module 'payroll/data/gofer' {
  export * from '@personio-web/payroll-data-gofer-types';
}

declare module '@personio-web/payroll-data-gofer' {
  export * from '@personio-web/payroll-data-gofer-types';
}
