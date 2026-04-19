import { type ListEmploymentsByPersonIdsQueryResult } from '../hooks';
import { getAttributeValue } from './utils';

// const genders: Gender[] = [
//   'DIVERSE',
//   'FEMALE',
//   'MALE',
//   'UNDEFINED',
//   'UNSPECIFIED',
// ];

// const employmentStatus: EmploymentStatus[] = [
//   'ACTIVE',
//   'INACTIVE',
//   'LEAVE',
//   'ONBOARDING',
//   'UNSPECIFIED',
// ];

// const employmentTypes: EmploymentType[] = [
//   'EXTERNAL',
//   'INTERNAL',
//   'UNSPECIFIED',
// ];

// const terminationTypes: TerminationType[] = [
//   'UNSPECIFIED',
//   'EMPLOYEE',
//   'FIRED',
//   'DEATH',
//   'CONTRACT_EXPIRED',
//   'AGREEMENT',
//   'SUB_COMPANY_SWITCH',
//   'IRREVOCABLE_SUSPENSION',
//   'CANCELLATION',
//   'COLLECTIVE_AGREEMENT',
//   'SETTLEMENT_AGREEMENT',
//   'RETIREMENT',
//   'COURT_SETTLEMENT',
//   'QUIT',
// ];

// type IncludeAttributes = Pick<
//   ListEmploymentsByPersonIdsQueryVariables,
//   | 'includeDepartment'
//   | 'includeTeam'
//   | 'includeOffice'
//   | 'includeLegalEntityDetails'
//   | 'includeCostCenters'
//   | 'includeTermination'
//   | 'includeEmploymentDates'
//   | 'includePersonEntity'
//   | 'includeCustomAttributes'
//   | 'includeSubordinates'
//   | 'includeJob'
// >;

export const generateEmploymentData = (
  personId: string,
  {
    includeDepartment,
    includeTeam,
    includeOffice,
    includeLegalEntityDetails,
    includeCostCenters,
    includeTermination,
    includeEmploymentDates,
    includePersonEntity,
    includeCustomAttributes,
    includeSubordinates,
    includeJob,
  }: IncludeAttributes = {
    includeDepartment: true,
  },
): ListEmploymentsByPersonIdsQueryResult['employments'][number] => {
  const employment: EmploymentDataFragment = {
    id: personId,
    person: {
      id: personId,
      profilePicUrls: {
        paths: {
          large: '',
        },
      },
      preferredName: {
        value: `Peter - ${personId}`,
        __typename: 'personandemployment_StringAttribute_v1',
      },
      email: {
        value: `${personId}@company.com`,
        __typename: 'personandemployment_StringAttribute_v1',
      },
      gender: {
        value: getAttributeValue(genders, personId),
        __typename: 'personandemployment_Person_GenderAttribute_v1',
      },
      __typename: 'personandemployment_Person_v1',
    },
    status: {
      value: getAttributeValue(employmentStatus, personId),
      __typename: 'personandemployment_EmploymentStatusAttribute_v1',
    },
    type: {
      value: getAttributeValue(employmentTypes, personId),
      __typename: 'personandemployment_EmploymentTypeAttribute_v1',
    },
    positionTitle: {
      value: 'Director, Product Design',
      __typename: 'personandemployment_StringAttribute_v1',
    },
    __typename: 'personandemployment_Employment_v1',
  };

  if (includeDepartment) {
    employment.departmentEntity = {
      id: 6,
      name: 'PTech',
      __typename: 'employmentorganization_OrgUnit_v1alpha2',
    };
  }

  if (includeTeam) {
    employment.teamEntity = {
      id: 10,
      name: 'Employee & Organization',
      __typename: 'employmentorganization_OrgUnit_v1alpha2',
    };
  }

  if (includeOffice) {
    employment.officeEntity = {
      id: 100,
      name: 'Berlin',
      __typename: 'employmentorganization_Office_v1alpha2',
    };
  }

  if (includeLegalEntityDetails) {
    employment.legalEntityDetails = {
      id: '30',
      name: 'Parent Ltd.',
      __typename: 'OrgManagementServiceAPI_LegalEntities',
    };
  }

  if (includeCostCenters) {
    employment.costCenters = {
      valueList: [
        {
          id: '23',
          costCenterEntity: {
            id: '23',
            name: 'Cost center 1',
            __typename: 'employmentorganization_CostCenter_v1alpha2',
          },
          __typename: 'personandemployment_CostCentersAttribute_CostCenter_v1',
        },
        {
          id: '24',
          costCenterEntity: {
            id: '24',
            name: 'Cost center 2',
            __typename: 'employmentorganization_CostCenter_v1alpha2',
          },
          __typename: 'personandemployment_CostCentersAttribute_CostCenter_v1',
        },
      ],
      __typename: 'personandemployment_CostCentersAttribute_v1',
    };
  }

  if (includeTermination) {
    employment.termination = {
      value: {
        type: getAttributeValue(terminationTypes, personId),
        reason: 'Low performance',
        noticeDate: {
          seconds: 1495497600,
          nanos: 0,
          __typename: 'google_protobuf_Timestamp',
        },
        terminationDate: {
          seconds: 1495497600,
          nanos: 0,
          __typename: 'google_protobuf_Timestamp',
        },
        lastWorkingDate: {
          seconds: 1495497600,
          nanos: 0,
          __typename: 'google_protobuf_Timestamp',
        },
        __typename: 'personandemployment_Termination_v1',
      },
      __typename: 'personandemployment_TerminationAttribute_v1',
    };
  }

  if (includeEmploymentDates) {
    employment.startDate = {
      value: {
        seconds: 1495497600,
        nanos: 0,
        __typename: 'google_protobuf_Timestamp',
      },
      __typename: 'personandemployment_DateAttribute_v1',
    };

    employment.contractEndDate = {
      value: {
        seconds: 1495497600,
        nanos: 0,
        __typename: 'google_protobuf_Timestamp',
      },
      __typename: 'personandemployment_DateAttribute_v1',
    };
  }

  if (includePersonEntity) {
    employment.personEntity = {
      __typename: 'personandemployment_Person_v1',
    };

    if (includeCustomAttributes) {
      employment.personEntity.customAttributes = {
        'dynamic_6412f68c2c1c41.12573410': {
          accessibility: {
            isAccessible: true,
            accessLevel: 'ACCESS_LEVEL_VIEW',
          },
          type: 'STRING',
          attributeName: 'dynamic_6412f68c2c1c41.12573410',
          globalId: '12573410',
          stringValue: '6 months',
          attributeUniversalId: 'dynamic_6412f68c2c1c41.12573410',
        },
        'dynamic_6412f68c2c1c41.10165610': {
          accessibility: {
            isAccessible: true,
            accessLevel: 'ACCESS_LEVEL_VIEW',
          },
          type: 'DATE',
          attributeName: 'dynamic_66e6cc713de9d9.10165610',
          globalId: '10165610',
          dateValue: '2024-09-15T00:00:00Z',
          attributeUniversalId: 'dynamic_66e6cc713de9d9.10165610',
        },
        'dynamic_6412f68c2c1cf0.12573409': {
          accessibility: {
            isAccessible: true,
            accessLevel: 'ACCESS_LEVEL_VIEW',
          },
          type: 'STRING',
          attributeName: 'dynamic_6412f68c2c1cf0.12573409',
          globalId: '12573409',
          stringValue: 'https://www.linkedin.com/',
          attributeUniversalId: 'dynamic_6412f68c2c1cf0.12573409',
        },
        'dynamic_6412f68c2c1d96.12573419': {
          accessibility: {
            isAccessible: true,
            accessLevel: 'ACCESS_LEVEL_VIEW',
          },
          type: 'INT',
          attributeName: 'dynamic_6412f68c2c1d96.12573419',
          globalId: '12573419',
          intValue: 123,
          attributeUniversalId: 'dynamic_6412f68c2c1d96.12573419',
        },
        'dynamic_6412f68c2c1d96.125734121': {
          accessibility: {
            isAccessible: true,
            accessLevel: 'ACCESS_LEVEL_VIEW',
          },
          type: 'DOUBLE',
          attributeName: 'dynamic_6412f68c2c1d96.125734121',
          globalId: '125734121',
          doubleValue: 49.99,
          attributeUniversalId: 'dynamic_6412f68c2c1d96.125734121',
        },
        'dynamic_6412f68c2c1d96.12573411': {
          accessibility: {
            isAccessible: true,
            accessLevel: 'ACCESS_LEVEL_VIEW',
          },
          type: 'STRING',
          attributeName: 'dynamic_6412f68c2c1d96.12573411',
          globalId: '12573411',
          stringValue: '100 sales, security certified',
          attributeUniversalId: 'dynamic_6412f68c2c1d96.12573411',
        },
        'dynamic_6412f68c2c1d96.12573412': {
          accessibility: {
            isAccessible: true,
            accessLevel: 'ACCESS_LEVEL_VIEW',
          },
          type: 'STRING',
          attributeName: 'dynamic_6412f68c2c1d96.12573412',
          globalId: '12573412',
          stringValue: 'Monthly',
          attributeUniversalId: 'dynamic_6412f68c2c1d96.12573412',
        },
        'dynamic_6412f68c2c121d96.12573414': {
          accessibility: {
            isAccessible: true,
            accessLevel: 'ACCESS_LEVEL_VIEW',
          },
          type: 'BOOLEAN',
          attributeName: 'dynamic_6412f68c2c121d96.12573414',
          globalId: '12573414',
          booleanValue: true,
          attributeUniversalId: 'dynamic_6412f68c2c121d96.12573414',
        },
        'dynamic_66c73d69337bb1.80940209': {
          accessibility: {
            isAccessible: true,
            accessLevel: 'ACCESS_LEVEL_VIEW',
          },
          type: 'ARRAY',
          attributeName: 'dynamic_66c73d69337bb1.80940209',
          globalId: '13535904',
          arrayValue: {
            type: 'STRING',
            stringValue: ['601', '602', '603', '604', '2001'],
          },
          attributeUniversalId: 'dynamic_66c73d69337bb1.80940209',
        },
        'dynamic_66c73d69337bb1.80940210': {
          accessibility: {
            isAccessible: true,
            accessLevel: 'ACCESS_LEVEL_VIEW',
          },
          type: 'ARRAY',
          attributeName: 'dynamic_66c73d69337bb1.80940210',
          globalId: '13535905',
          arrayValue: {
            type: 'STRING',
            stringValue: ['501', '502', '503'],
          },
          attributeUniversalId: 'dynamic_66c73d69337bb1.80940210',
        },
      };
    }

    if (includeSubordinates) {
      employment.personEntity.subordinates = {
        valueList: [
          {
            employmentId: '0e75ce6d-44b5-4559-8b05-f46f97d4db2c',
            personId: '301',
            supervisorId: personId,
            supervisorTypeId: 'dynamic_66c73d69337bb1.80940209',
            __typename: 'personandemployment_Subordinate_v1',
          },
          {
            employmentId: '0e75ce6d-44b5-4559-8b05-f46f97d4db2d',
            personId: '302',
            supervisorId: personId,
            supervisorTypeId: 'dynamic_66c73d69337bb1.80940209',
            __typename: 'personandemployment_Subordinate_v1',
          },
          {
            employmentId: '0e75ce6d-44b5-4559-8b05-f46f97d4db2e',
            personId: '303',
            supervisorId: personId,
            supervisorTypeId: 'dynamic_66c73d69337bb1.80940209',
            __typename: 'personandemployment_Subordinate_v1',
          },
          {
            employmentId: '0e75ce6d-44b5-4559-8b05-f46f97d4db2f',
            personId: '304',
            supervisorId: personId,
            supervisorTypeId: 'dynamic_66c73d69337bb1.80940209',
            __typename: 'personandemployment_Subordinate_v1',
          },
          {
            employmentId: 'fd473b25-5e77-4f4d-9c95-2fd9cdec2d59',
            personId: '200',
            supervisorId: personId,
            supervisorTypeId: 'dynamic_66c73d69337bb1.80940210',
            __typename: 'personandemployment_Subordinate_v1',
          },
          {
            employmentId: 'fd473b25-5e77-4f4d-9c95-2fd9cdec2d10',
            personId: '202',
            supervisorId: personId,
            supervisorTypeId: 'dynamic_66c73d69337bb1.80940210',
            __typename: 'personandemployment_Subordinate_v1',
          },
        ],
        __typename: 'personandemployment_SubordinatesAttribute_v1',
      };
    }
  }

  if (includeJob) {
    employment.jobEntity = {
      id: '229addc5-a3d0-406a-b334-81d11416acb4',
      name: 'Product Manager L5B',
      jobFamily: {
        id: '4640bfc7-9fe6-4ad6-bde6-c4bf2d56c655',
        name: 'Product',
        __typename: 'employmentorganization_JobFamily_v1alpha2',
      },
      level: {
        id: 'd3d05b36-a134-4f36-b58e-7e325029ab9f',
        name: 'L5B',
        track: {
          id: '30915f24-a96f-40d0-b3ad-ce41baa44400',
          name: 'Product management',
          __typename: 'employmentorganization_Track_v1alpha2',
        },
        __typename: 'employmentorganization_Level_v1alpha2',
      },
      __typename: 'employmentorganization_Job_v1alpha2',
    };
  }

  return employment;
};

export const generateEmptyEmploymentData = (
  personId: string,
  {
    includeDepartment,
    includeTeam,
    includeOffice,
    includeLegalEntityDetails,
    includeCostCenters,
    includeTermination,
    includeEmploymentDates,
    includePersonEntity,
    includeCustomAttributes,
    includeSubordinates,
    includeJob,
  }: IncludeAttributes = {
    includeDepartment: true,
  },
): EmploymentDataFragment => {
  const employment: EmploymentDataFragment = {
    id: personId,
    person: {
      id: personId,
      profilePicUrls: {
        paths: {
          large: '',
          __typename: 'ImageService_ImageVariationPaths',
        },
        __typename: 'ImageService_ImagesCompanyIdFileIdVariations_V1_Result',
      },
      preferredName: {
        value: `Peter - ${personId}`,
        __typename: 'personandemployment_StringAttribute_v1',
      },
      email: {
        value: '',
        __typename: 'personandemployment_StringAttribute_v1',
      },
      gender: {
        value: 'UNSPECIFIED',
        __typename: 'personandemployment_Person_GenderAttribute_v1',
      },
      __typename: 'personandemployment_Person_v1',
    },
    status: {
      value: 'UNSPECIFIED',
      __typename: 'personandemployment_EmploymentStatusAttribute_v1',
    },
    type: {
      value: 'UNSPECIFIED',
      __typename: 'personandemployment_EmploymentTypeAttribute_v1',
    },
    positionTitle: {
      value: '',
      __typename: 'personandemployment_StringAttribute_v1',
    },
    __typename: 'personandemployment_Employment_v1',
  };

  if (includeDepartment) {
    employment.departmentEntity = null;
  }

  if (includeTeam) {
    employment.teamEntity = null;
  }

  if (includeOffice) {
    employment.officeEntity = null;
  }

  if (includeLegalEntityDetails) {
    employment.legalEntityDetails = null;
  }

  if (includeCostCenters) {
    employment.costCenters = {
      valueList: [],
      __typename: 'personandemployment_CostCentersAttribute_v1',
    };
  }

  if (includeTermination) {
    employment.termination = {
      value: {
        type: 'UNSPECIFIED',
        reason: '',
        noticeDate: {
          seconds: 0,
          nanos: 0,
          __typename: 'google_protobuf_Timestamp',
        },
        terminationDate: {
          seconds: 0,
          nanos: 0,
          __typename: 'google_protobuf_Timestamp',
        },
        lastWorkingDate: {
          seconds: 0,
          nanos: 0,
          __typename: 'google_protobuf_Timestamp',
        },
        __typename: 'personandemployment_Termination_v1',
      },
      __typename: 'personandemployment_TerminationAttribute_v1',
    };
  }

  if (includeEmploymentDates) {
    employment.startDate = {
      value: {
        seconds: 0,
        nanos: 0,
        __typename: 'google_protobuf_Timestamp',
      },
      __typename: 'personandemployment_DateAttribute_v1',
    };

    employment.contractEndDate = {
      value: {
        seconds: 0,
        nanos: 0,
        __typename: 'google_protobuf_Timestamp',
      },
      __typename: 'personandemployment_DateAttribute_v1',
    };
  }

  if (includePersonEntity) {
    employment.personEntity = {
      __typename: 'personandemployment_Person_v1',
    };

    if (includeCustomAttributes) {
      employment.personEntity.customAttributes = {};
    }

    if (includeSubordinates) {
      employment.personEntity.subordinates = {
        valueList: [],
        __typename: 'personandemployment_SubordinatesAttribute_v1',
      };
    }
  }

  if (includeJob) {
    employment.jobEntity = undefined;
  }

  return employment;
};
