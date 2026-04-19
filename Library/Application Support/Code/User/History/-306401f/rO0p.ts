import {
  /* DO NOT DELETE - Auto generated imports - Start */
  type GetEmployeeAutoEnrolmentConfigurationAPI,
  type UpdatePendingAutoenrolmentActionAPI,
  type UpdateEmployeeAutoEnrolmentHistoricalAssessmentAPI,
  type RenderEmployeePayslipAPI,
  type ListEmployeePensionsAPI,
  type CreateEmployeePensionAPI,
  type GetEmployeePensionAPI,
  type UpdateEmployeePensionAPI,
  type DeleteEmployeePensionAPI,
  type ListEmployerPensionSchemesAPI,
  type CreateEmployerPensionSchemeAPI,
  type GetEmployerPensionSchemeAPI,
  type UpdateEmployerPensionSchemeAPI,
  type DeleteEmployerPensionSchemeAPI,
  type ListPensionContributionGroupsAPI,
  type CreatePensionContributionGroupAPI,
  type GetPensionContributionGroupAPI,
  type UpdatePensionContributionGroupAPI,
  type DeletePensionContributionGroupAPI,
  type UpdateEmployerAutoEnrolmentAPI,
  type GetEmployerAutoEnrolmentAPI,
  type ListFilingsAPI,
  type ViewFilingAPI,
  type PollFilingAPI,
  type PreviewFilingAPI,
  type SubmitFilingAPI,
  type FetchLegalEntityDataAPI,
  type UpdateLegalEntityDataAPI,
  type ListPayGroupsAPI,
  type CreatePayGroupAPI,
  type RetrievePayGroupAPI,
  type DeletePayGroupAPI,
  type CreatePayrollRunAPI,
  type RetrievePayrollRunAPI,
  type UpdatePayrollRunAPI,
  type ApprovePayrollRunAPI,
  type PreviewPayrollRunFPSAPI,
  type RetrieveBacsFileForPayrollRunAPI,
  type ListPayrollRunsAPI,
  type ListCompensationTypesAPI,
  type CreateDefaultSchemasAPI,
  type ListEmployerCompensationSchemasAPI,
  type CreateCompensationAPI,
  type ListSchemaMappingsAPI,
  type SaveSchemaMappingsAPI,
  type ListSystemCompensationSchemasAPI,
  type ReadStudentLoanAPI,
  type UpdateStudentLoanAPI,
  type ListUKCourtOrdersAPI,
  type CreateUKCourtOrderAPI,
  type ReadUKCourtOrderAPI,
  type UpdateUKCourtOrderAPI,
  type ListUKCourtOrderDeductionsAPI,
  type UpdateUKCourtOrderDeductionAPI,
  /* DO NOT DELETE - Auto generated imports - End */
} from '@personio-web/payroll-data-payroll-me-types';

/* DO NOT DELETE - Auto generated API definitions - Start */
export const getEmployeeAutoEnrolmentConfigurationAPI: GetEmployeeAutoEnrolmentConfigurationAPI =
  {
    API_PATH:
      '/public/athena/v1/payrollme/employees/:employeeId/auto-enrolment',
    METHOD: 'GET',
    KEY: {
      service: 'International Personio Payroll',
      operationId: 'getEmployeeAutoEnrolmentConfiguration',
    },
  };

export const updatePendingAutoenrolmentActionAPI: UpdatePendingAutoenrolmentActionAPI =
  {
    API_PATH:
      '/public/athena/v1/payrollme/employees/:employeeId/auto-enrolment/action',
    METHOD: 'PUT',
    KEY: {
      service: 'International Personio Payroll',
      operationId: 'updatePendingAutoenrolmentAction',
    },
  };

export const updateEmployeeAutoEnrolmentHistoricalAssessmentAPI: UpdateEmployeeAutoEnrolmentHistoricalAssessmentAPI =
  {
    API_PATH:
      '/public/athena/v1/payrollme/employees/:employeeId/auto-enrolment/historical',
    METHOD: 'PUT',
    KEY: {
      service: 'International Personio Payroll',
      operationId: 'updateEmployeeAutoEnrolmentHistoricalAssessment',
    },
  };

export const renderEmployeePayslipAPI: RenderEmployeePayslipAPI = {
  API_PATH:
    '/public/athena/v1/payrollme/employees/:employeeId/payslips/:payslipId/preview',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'renderEmployeePayslip',
  },
};

export const listEmployeePensionsAPI: ListEmployeePensionsAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/pensions',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'listEmployeePensions',
  },
};

export const createEmployeePensionAPI: CreateEmployeePensionAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/pensions',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'createEmployeePension',
  },
};

export const getEmployeePensionAPI: GetEmployeePensionAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/pensions/:id',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'getEmployeePension',
  },
};

export const updateEmployeePensionAPI: UpdateEmployeePensionAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/pensions/:id',
  METHOD: 'PUT',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'updateEmployeePension',
  },
};

export const deleteEmployeePensionAPI: DeleteEmployeePensionAPI = {
  API_PATH: '/public/athena/v1/payrollme/employees/:employeeId/pensions/:id',
  METHOD: 'DELETE',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'deleteEmployeePension',
  },
};

export const listEmployerPensionSchemesAPI: ListEmployerPensionSchemesAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'listEmployerPensionSchemes',
  },
};

export const createEmployerPensionSchemeAPI: CreateEmployerPensionSchemeAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'createEmployerPensionScheme',
  },
};

export const getEmployerPensionSchemeAPI: GetEmployerPensionSchemeAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes/:id',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'getEmployerPensionScheme',
  },
};

export const updateEmployerPensionSchemeAPI: UpdateEmployerPensionSchemeAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes/:id',
  METHOD: 'PUT',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'updateEmployerPensionScheme',
  },
};

export const deleteEmployerPensionSchemeAPI: DeleteEmployerPensionSchemeAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer-pension-schemes/:id',
  METHOD: 'DELETE',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'deleteEmployerPensionScheme',
  },
};

export const listPensionContributionGroupsAPI: ListPensionContributionGroupsAPI =
  {
    API_PATH:
      '/public/athena/v1/payrollme/employer-pension-schemes/:schemeId/contribution-groups',
    METHOD: 'GET',
    KEY: {
      service: 'International Personio Payroll',
      operationId: 'listPensionContributionGroups',
    },
  };

export const createPensionContributionGroupAPI: CreatePensionContributionGroupAPI =
  {
    API_PATH:
      '/public/athena/v1/payrollme/employer-pension-schemes/:schemeId/contribution-groups',
    METHOD: 'POST',
    KEY: {
      service: 'International Personio Payroll',
      operationId: 'createPensionContributionGroup',
    },
  };

export const getPensionContributionGroupAPI: GetPensionContributionGroupAPI = {
  API_PATH:
    '/public/athena/v1/payrollme/employer-pension-schemes/:schemeId/contribution-groups/:id',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'getPensionContributionGroup',
  },
};

export const updatePensionContributionGroupAPI: UpdatePensionContributionGroupAPI =
  {
    API_PATH:
      '/public/athena/v1/payrollme/employer-pension-schemes/:schemeId/contribution-groups/:id',
    METHOD: 'PUT',
    KEY: {
      service: 'International Personio Payroll',
      operationId: 'updatePensionContributionGroup',
    },
  };

export const deletePensionContributionGroupAPI: DeletePensionContributionGroupAPI =
  {
    API_PATH:
      '/public/athena/v1/payrollme/employer-pension-schemes/:schemeId/contribution-groups/:id',
    METHOD: 'DELETE',
    KEY: {
      service: 'International Personio Payroll',
      operationId: 'deletePensionContributionGroup',
    },
  };

export const updateEmployerAutoEnrolmentAPI: UpdateEmployerAutoEnrolmentAPI = {
  API_PATH: '/public/athena/v1/payrollme/employer/auto-enrolment',
  METHOD: 'PUT',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'updateEmployerAutoEnrolment',
  },
};

export const getEmployerAutoEnrolmentAPI: GetEmployerAutoEnrolmentAPI = {
  API_PATH:
    '/public/athena/v1/payrollme/employer/auto-enrolment/:legalEntityId',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'getEmployerAutoEnrolment',
  },
};

export const listFilingsAPI: ListFilingsAPI = {
  API_PATH: '/public/athena/v1/payrollme/filings',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'listFilings',
  },
};

export const viewFilingAPI: ViewFilingAPI = {
  API_PATH: '/public/athena/v1/payrollme/filings/:id',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'viewFiling',
  },
};

export const pollFilingAPI: PollFilingAPI = {
  API_PATH: '/public/athena/v1/payrollme/filings/:id/poll',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'pollFiling',
  },
};

export const previewFilingAPI: PreviewFilingAPI = {
  API_PATH: '/public/athena/v1/payrollme/filings/:id/preview',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'previewFiling',
  },
};

export const submitFilingAPI: SubmitFilingAPI = {
  API_PATH: '/public/athena/v1/payrollme/filings/:id/submit',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'submitFiling',
  },
};

export const fetchLegalEntityDataAPI: FetchLegalEntityDataAPI = {
  API_PATH: '/public/athena/v1/payrollme/legal-entities/:legalEntityId',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'fetchLegalEntityData',
  },
};

export const updateLegalEntityDataAPI: UpdateLegalEntityDataAPI = {
  API_PATH: '/public/athena/v1/payrollme/legal-entities/:legalEntityId',
  METHOD: 'PUT',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'updateLegalEntityData',
  },
};

export const listPayGroupsAPI: ListPayGroupsAPI = {
  API_PATH: '/public/athena/v1/payrollme/pay-group',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'listPayGroups',
  },
};

export const createPayGroupAPI: CreatePayGroupAPI = {
  API_PATH: '/public/athena/v1/payrollme/pay-group',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'createPayGroup',
  },
};

export const retrievePayGroupAPI: RetrievePayGroupAPI = {
  API_PATH: '/public/athena/v1/payrollme/pay-group/:id',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'retrievePayGroup',
  },
};

export const deletePayGroupAPI: DeletePayGroupAPI = {
  API_PATH: '/public/athena/v1/payrollme/pay-group/:id',
  METHOD: 'DELETE',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'deletePayGroup',
  },
};

export const createPayrollRunAPI: CreatePayrollRunAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-run',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'createPayrollRun',
  },
};

export const retrievePayrollRunAPI: RetrievePayrollRunAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-run/:id',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'retrievePayrollRun',
  },
};

export const updatePayrollRunAPI: UpdatePayrollRunAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-run/:id',
  METHOD: 'PUT',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'updatePayrollRun',
  },
};

export const approvePayrollRunAPI: ApprovePayrollRunAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-run/:id/approve',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'approvePayrollRun',
  },
};

export const previewPayrollRunFPSAPI: PreviewPayrollRunFPSAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-run/:id/preview-fps',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'previewPayrollRunFPS',
  },
};

export const retrieveBacsFileForPayrollRunAPI: RetrieveBacsFileForPayrollRunAPI =
  {
    API_PATH: '/public/athena/v1/payrollme/payroll-run/:payrollRunId/bacs',
    METHOD: 'POST',
    KEY: {
      service: 'International Personio Payroll',
      operationId: 'retrieveBacsFileForPayrollRun',
    },
  };

export const listPayrollRunsAPI: ListPayrollRunsAPI = {
  API_PATH: '/public/athena/v1/payrollme/payroll-runs',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'listPayrollRuns',
  },
};

export const listCompensationTypesAPI: ListCompensationTypesAPI = {
  API_PATH: '/public/athena/v1/payrollme/schema/compensation-types',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'listCompensationTypes',
  },
};

export const createDefaultSchemasAPI: CreateDefaultSchemasAPI = {
  API_PATH:
    '/public/athena/v1/payrollme/schema/create-default-employer-schemas',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'createDefaultSchemas',
  },
};

export const listEmployerCompensationSchemasAPI: ListEmployerCompensationSchemasAPI =
  {
    API_PATH: '/public/athena/v1/payrollme/schema/employer-compensation-schema',
    METHOD: 'GET',
    KEY: {
      service: 'International Personio Payroll',
      operationId: 'listEmployerCompensationSchemas',
    },
  };

export const createCompensationAPI: CreateCompensationAPI = {
  API_PATH: '/public/athena/v1/payrollme/schema/employer-compensation-schema',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'createCompensation',
  },
};

export const listSchemaMappingsAPI: ListSchemaMappingsAPI = {
  API_PATH: '/public/athena/v1/payrollme/schema/employer-schema-mapping',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'listSchemaMappings',
  },
};

export const saveSchemaMappingsAPI: SaveSchemaMappingsAPI = {
  API_PATH: '/public/athena/v1/payrollme/schema/employer-schema-mapping',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'saveSchemaMappings',
  },
};

export const listSystemCompensationSchemasAPI: ListSystemCompensationSchemasAPI =
  {
    API_PATH: '/public/athena/v1/payrollme/schema/system-compensation-schema',
    METHOD: 'GET',
    KEY: {
      service: 'International Personio Payroll',
      operationId: 'listSystemCompensationSchemas',
    },
  };

export const readStudentLoanAPI: ReadStudentLoanAPI = {
  API_PATH:
    '/public/athena/v1/payrollme/uk-student-and-postgraduate-loan/:employeeId',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'readStudentLoan',
  },
};

export const updateStudentLoanAPI: UpdateStudentLoanAPI = {
  API_PATH:
    '/public/athena/v1/payrollme/uk-student-and-postgraduate-loan/:employeeId',
  METHOD: 'PUT',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'updateStudentLoan',
  },
};

export const listUKCourtOrdersAPI: ListUKCourtOrdersAPI = {
  API_PATH: '/public/athena/v1/payrollme/uk/court-orders/:employeeId',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'listUKCourtOrders',
  },
};

export const createUKCourtOrderAPI: CreateUKCourtOrderAPI = {
  API_PATH: '/public/athena/v1/payrollme/uk/court-orders/:employeeId',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'createUKCourtOrder',
  },
};

export const readUKCourtOrderAPI: ReadUKCourtOrderAPI = {
  API_PATH:
    '/public/athena/v1/payrollme/uk/court-orders/:employeeId/:courtOrderId',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'readUKCourtOrder',
  },
};

export const updateUKCourtOrderAPI: UpdateUKCourtOrderAPI = {
  API_PATH:
    '/public/athena/v1/payrollme/uk/court-orders/:employeeId/:courtOrderId',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'updateUKCourtOrder',
  },
};

export const listUKCourtOrderDeductionsAPI: ListUKCourtOrderDeductionsAPI = {
  API_PATH:
    '/public/athena/v1/payrollme/uk/court-orders/:employeeId/:courtOrderId/deductions',
  METHOD: 'GET',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'listUKCourtOrderDeductions',
  },
};

export const updateUKCourtOrderDeductionAPI: UpdateUKCourtOrderDeductionAPI = {
  API_PATH:
    '/public/athena/v1/payrollme/uk/court-orders/:employeeId/:courtOrderId/deductions/:payrollId',
  METHOD: 'POST',
  KEY: {
    service: 'International Personio Payroll',
    operationId: 'updateUKCourtOrderDeduction',
  },
};
/* DO NOT DELETE - Auto generated API definitions - End */
