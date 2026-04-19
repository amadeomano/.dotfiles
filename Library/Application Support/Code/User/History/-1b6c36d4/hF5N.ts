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

  export type GetEmployeeHeaderDataHandlers =
    import('./handlers').GetEmployeeHeaderDataHandlers;
  export const EmployeeHeaderDocument: DocumentNode;
  export type GetEmployeeHeaderDataQuery =
    import('./operations').GetEmployeeHeaderDataQuery;
  export type GetEmployeeHeaderDataQueryVariables =
    import('./operations').GetEmployeeHeaderDataQueryVariables;
  type UseGetEmployeeHeaderDataQuery =
    import('./operations.custom').UseGetEmployeeHeaderDataQuery;
  export const useGetEmployeeHeaderDataQuery: UseGetEmployeeHeaderDataQuery;

  export type GetEmployeeHierarchyHandlers =
    import('./handlers').GetEmployeeHierarchyHandlers;
  export const GetEmployeeHierarchyDocument: DocumentNode;
  export type GetEmployeeHierarchyQuery =
    import('./operations').GetEmployeeHierarchyQuery;
  export type GetEmployeeHierarchyQueryVariables =
    import('./operations').GetEmployeeHierarchyQueryVariables;
  type UseGetEmployeeHierarchyQuery =
    import('./operations.custom').UseGetEmployeeHierarchyQuery;
  export const useGetEmployeeHierarchyQuery: UseGetEmployeeHierarchyQuery;

  export type EmploymentDataFragment =
    import('./operations').EmploymentDataFragment;
  export const EmploymentDataFragmentDoc: DocumentNode;

  export type ListEmploymentsByPersonIdsHandlers =
    import('./handlers').ListEmploymentsByPersonIdsHandlers;
  export const ListEmploymentsByPersonIdsDocument: DocumentNode;
  export type ListEmploymentsByPersonIdsQuery =
    import('./operations').ListEmploymentsByPersonIdsQuery;
  export type ListEmploymentsByPersonIdsQueryVariables =
    import('./operations').ListEmploymentsByPersonIdsQueryVariables;
  type UseListEmploymentsByPersonIdsQuery =
    import('./operations.custom').UseListEmploymentsByPersonIdsQuery;
  export const useListEmploymentsByPersonIdsQuery: UseListEmploymentsByPersonIdsQuery;

  export type ListFilteredEmploymentIdsHandlers =
    import('./handlers').ListFilteredEmploymentIdsHandlers;
  export const ListFilteredEmploymentIdsDocument: DocumentNode;
  export type ListFilteredEmploymentIdsQuery =
    import('./operations').ListFilteredEmploymentIdsQuery;
  export type ListFilteredEmploymentIdsQueryVariables =
    import('./operations').ListFilteredEmploymentIdsQueryVariables;
  type UseListFilteredEmploymentIdsQuery =
    import('./operations.custom').UseListFilteredEmploymentIdsQuery;
  export const useListFilteredEmploymentIdsQuery: UseListFilteredEmploymentIdsQuery;

  export type GetEmploymentBaseDataHandlers =
    import('./handlers').GetEmploymentBaseDataHandlers;
  export const GetEmploymentBaseDataDocument: DocumentNode;
  export type GetEmploymentBaseDataQuery =
    import('./operations').GetEmploymentBaseDataQuery;
  export type GetEmploymentBaseDataQueryVariables =
    import('./operations').GetEmploymentBaseDataQueryVariables;
  type UseGetEmploymentBaseDataQuery =
    import('./operations.custom').UseGetEmploymentBaseDataQuery;
  export const useGetEmploymentBaseDataQuery: UseGetEmploymentBaseDataQuery;

  export type ListWorkplacesQuery = import('./operations').ListWorkplacesQuery;
  export type ListWorkplacesQueryVariables =
    import('./operations').ListWorkplacesQueryVariables;
  export type UseListWorkplacesQuery =
    import('./operations.custom').UseListWorkplacesQuery;
  export const useListWorkplacesQuery: UseListWorkplacesQuery;

  export type GetWorkplaceByIdQuery =
    import('./operations').GetWorkplaceByIdQuery;
  export type GetWorkplaceByIdQueryVariables =
    import('./operations').GetWorkplaceByIdQueryVariables;
  export type UseGetWorkplaceByIdQuery =
    import('./operations.custom').UseGetWorkplaceByIdQuery;
  export const useGetWorkplaceByIdQuery: UseGetWorkplaceByIdQuery;

  export type ListHolidayCalendarsQuery =
    import('./operations').ListHolidayCalendarsQuery;
  export type ListHolidayCalendarsQueryVariables =
    import('./operations').ListHolidayCalendarsQueryVariables;
  export type UseListHolidayCalendarsQuery =
    import('./operations.custom').UseListHolidayCalendarsQuery;
  export const useListHolidayCalendarsQuery: UseListHolidayCalendarsQuery;

  export type ListPositionIdsQuery =
    import('./operations').ListPositionIdsQuery;
  export type ListPositionIdsQueryVariables =
    import('./operations').ListPositionIdsQueryVariables;
  export type UseListPositionIdsQuery =
    import('./operations.custom').UseListPositionIdsQuery;
  export const useListPositionIdsQuery: UseListPositionIdsQuery;

  export const ListPositionsDataDocument: DocumentNode;
  export type ListPositionsDataQuery =
    import('./operations').ListPositionsDataQuery;
  export type ListPositionsDataQueryVariables =
    import('./operations').ListPositionsDataQueryVariables;
  export type UseListPositionsDataQuery =
    import('./operations.custom').UseListPositionsDataQuery;
  export const useListPositionsDataQuery: UseListPositionsDataQuery;

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

declare module 'employeesOrganizations/data/gofer' {
  export * from '@personio-web/employees-organizations-data-gofer-types';
}

declare module 'employeesOrganizations/data/gofer/handlers' {
  export const GetEmployeeHeaderDataHandlers: import('./handlers').GetEmployeeHeaderDataHandlers;

  export const GetEmployeeHierarchyHandlers: import('./handlers').GetEmployeeHierarchyHandlers;

  export const ListEmploymentsByPersonIdsHandlers: import('./handlers').ListEmploymentsByPersonIdsHandlers;

  export const ListFilteredEmploymentIdsHandlers: import('./handlers').ListFilteredEmploymentIdsHandlers;

  export const GetEmploymentBaseDataHandlers: import('./handlers').GetEmploymentBaseDataHandlers;

  export const ListWorkplacesHandlers: import('./handlers').ListWorkplacesHandlers;

  export const GetWorkplaceByIdHandlers: import('./handlers').GetWorkplaceByIdHandlers;

  export const ListHolidayCalendarsHandlers: import('./handlers').ListHolidayCalendarsHandlers;

  export const ListPositionIdsHandlers: import('./handlers').ListPositionIdsHandlers;

  export const ListPositionsDataHandlers: import('./handlers').ListPositionsDataHandlers;
}

declare module '@personio-web/employees-organizations-data-gofer' {
  export * from '@personio-web/employees-organizations-data-gofer-types';
}

declare module 'employeesOrganizations/registerMocks';
