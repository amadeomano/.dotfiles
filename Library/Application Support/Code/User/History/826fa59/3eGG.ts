import { graphql, shouldSendPersistedDocument } from '@personio-web/gofer';

const documentId = 'EO_ListEmploymentsByPersonIds_v2024112801';

export const BaseListEmploymentsByPersonIds = graphql(`
  EO_ListEmploymentsByPersonIds_v2024112801(
    $personIds: [String!]!
    $companyId: Int!
    $employmentExpand: [input_personandemployment_EmploymentExpand_v1!]! = [
      PERSON
    ]
    $personExpand: [input_personandemployment_PersonExpand_v1!]! = []
    $includeDepartment: Boolean! = false
    $includeTeam: Boolean! = false
    $includeOffice: Boolean! = false
    $includeLegalEntityDetails: Boolean! = false
    $includeCostCenters: Boolean! = false
    $includeTermination: Boolean! = false
    $includeEmploymentDates: Boolean! = false
    $includePersonEntity: Boolean! = false
    $includeCustomAttributes: Boolean! = false
    $includeSubordinates: Boolean! = false
    $includeJob: Boolean! = false
  ) {
    employments: personandemployment_EmploymentService_ListEmployments_v1(
      input: { personIds: { ids: $personIds }, expand: $employmentExpand }
    ) {
      items: employmentsList {
        id
        person {
          id
          profilePicUrls(path: { companyId: $companyId }) {
            paths {
              large
            }
          }
          preferredName {
            value
          }
          email {
            value
          }
          gender {
            value
          }
        }
        status {
          value
        }
        type {
          value
        }
        positionTitle {
          value
        }
        departmentEntity @include(if: $includeDepartment) {
          id
          name
        }
        teamEntity @include(if: $includeTeam) {
          id
          name
        }
        officeEntity @include(if: $includeOffice) {
          id
          name
        }
        legalEntityDetails @include(if: $includeLegalEntityDetails) {
          id
          name
        }
        costCenters @include(if: $includeCostCenters) {
          valueList {
            id
            costCenterEntity {
              id
              name
            }
          }
        }
        termination @include(if: $includeTermination) {
          value {
            type
            reason
            noticeDate {
              seconds
              nanos
            }
            terminationDate {
              seconds
              nanos
            }
            lastWorkingDate {
              seconds
              nanos
            }
          }
        }
        startDate @include(if: $includeEmploymentDates) {
          value {
            seconds
            nanos
          }
        }
        contractEndDate @include(if: $includeEmploymentDates) {
          value {
            seconds
            nanos
          }
        }
        personEntity(expand: $personExpand) @include(if: $includePersonEntity) {
          customAttributes @include(if: $includeCustomAttributes)
          subordinates @include(if: $includeSubordinates) {
            valueList {
              employmentId
              personId
              supervisorId
              supervisorTypeId
            }
          }
        }
        jobEntity @include(if: $includeJob) {
          id
          name
          jobFamily {
            id
            name
          }
          level {
            id
            name
            track {
              id
              name
            }
          }
        }
      }
    }
  }
`);

const PersistedListEmploymentsByPersonIds =
  graphql.persisted<typeof BaseListEmploymentsByPersonIds>(documentId);

export const ListEmploymentsByPersonIds = shouldSendPersistedDocument()
  ? PersistedListEmploymentsByPersonIds
  : BaseListEmploymentsByPersonIds;
