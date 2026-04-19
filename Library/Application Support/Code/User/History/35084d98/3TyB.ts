/**
 * Types should be defined in the types.ts file and re-exported here
 */
declare module '@personio-web/employees-organizations-util-people-types' {
  export type PersonSystemAttribute = import('./types').PersonSystemAttribute;
  export type PersonAttribute = import('./types').PersonAttribute;
}

declare module 'employeesOrganizations/util/people' {
  export * from '@personio-web/employees-organizations-util-people-types';
}

declare module '@personio-web/employees-organizations-util-people' {
  export * from '@personio-web/employees-organizations-util-people-types';
}

declare module 'employeeOrganizations/registerMocks';
