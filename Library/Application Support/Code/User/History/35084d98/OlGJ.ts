/**
 * Types should be defined in the types.ts file and re-exported here
 */
declare module '@personio-web/employees-organizations-util-people-types' {
  export enum PersonSystemAttribute {
    ID = 'id',
    FirstName = 'first_name',
    LastName = 'last_name',
    PreferredName = 'preferred_name',
    Email = 'email',
    BirthDate = 'birth_date',
    Position = 'position',
    Gender = 'gender',
    Status = 'status',
    EmploymentType = 'employment_type',
    TerminationType = 'termination_type',
    TerminationReason = 'termination_reason',
    TerminationDate = 'termination_date',
    NoticeAnnounced = 'termination_at',
    HireDate = 'hire_date',
    LastWorkingDay = 'last_working_day',
    LengthOfProbation = 'probation_period',
    ContractEndDate = 'contract_end_date',
    WeeklyWorkingHours = 'weekly_working_hours',
    FullTimeWeeklyWorkingHours = 'full_time_weekly_working_hours',
    Children = 'children',
    Team = 'team_id',
    PermanentEstablishmentId = 'permanent_establishment_id',
    ProbationPeriodEnd = 'probation_period_end',
    FixedSalary = 'fix_salary',
    HourlySalary = 'hourly_salary',
    FTE = 'fte',
    EmployeeRoles = 'role_string',
    InvitationStatus = 'login_status',
    LastLogin = 'last_login',
    Office = 'office_id',
    Department = 'department_id',
    Supervisor = 'supervisor_id',
    LegalEntity = 'subcompany_id',
    CostCenter = 'cost_centers',
    WorkSchedule = 'working_hours_schedule',
    OvertimeBalance = 'overtime_balance',
    OvertimeLimit = 'overtime_limit',
    OnboardingStatus = 'onboarding_status',
    OffboardingStatus = 'offboarding_status',
    JobId = 'job_id',
    JobName = 'job_name',
    JobFamily = 'job_family',
    JobTrack = 'job_track',
    JobLevel = 'job_level',
  }

  export type PersonAttribute = PersonSystemAttribute | string;
}

declare module 'employeesOrganizations/util/people' {
  export * from '@personio-web/employees-organizations-util-people-types';
}

declare module '@personio-web/employees-organizations-util-people' {
  export * from '@personio-web/employees-organizations-util-people-types';
}

declare module 'employeeOrganizations/registerMocks';
