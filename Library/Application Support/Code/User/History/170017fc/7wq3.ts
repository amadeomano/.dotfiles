/**
 * DO NOT MODIFY THIS FILE
 * This file in generated automatically by the @personio-web/nx-request-sync executor
 */

import type { ListLegalEntitiesData } from '@personio-web/payroll-data-payroll-legal-entities-types';

export const listLegalEntitiesData200ListLegalEntitiesSuccessResponseStatus = 200;

export const listLegalEntitiesData200ListLegalEntitiesSuccessResponse: ListLegalEntitiesData =
  {
    legalEntities: [
      {
        id: '7341',
        status: 'ACTIVE',
        isMain: false,
        validFrom: '2024-08-05',
        assignedEmployees: { active: 0, total: 0 },
        attributes: {
          name: 'test1 GmbH',
          industrySector: 'ACCOUNTING_AND_AUDITING_SERVICES',
          type: 'GMBH',
          country: 'DE',
          registrationNumber: '99301347',
        },
        metadata: {
          personioPayrollEnabled: true,
          canEdit: true,
          validationErrors: [],
        },
      },
      {
        id: '438853',
        status: 'ACTIVE',
        isMain: false,
        validFrom: '2024-06-01',
        assignedEmployees: { active: 0, total: 0 },
        attributes: {
          name: 'Testfirma2 GmbH',
          email: 'testfirma@audit.de',
          phone: '+49 695351981',
          address: {
            streetName: 'Somestreet',
            houseNumber: '123',
            postalCode: '80539',
            city: 'München',
            state: 'DE-BY',
          },
          contactPerson: {
            salutation: 'MS',
            fullName: 'Maxi Tester',
            email: 'maxi.tester@audit.de',
            phone: '+49 695351982',
          },
          bankDetails: {
            iban: 'DE41500105177512512784',
            bic: 'INGDDEFFXXX',
            accountHolder: 'Testfirma GmbH',
          },
          industrySector: 'ACCOUNTING_AND_AUDITING_SERVICES',
          type: 'GMBH',
          country: 'DE',
          registrationNumber: '99301347',
        },
        metadata: {
          personioPayrollEnabled: true,
          canEdit: true,
          validationErrors: [],
        },
      },
      {
        id: '434553',
        status: 'ACTIVE',
        isMain: false,
        validFrom: '2024-01-01',
        assignedEmployees: { active: 1, total: 1 },
        attributes: {
          name: '123 GmbH',
          industrySector: 'ACCOUNTING_AND_AUDITING_SERVICES',
          type: 'GMBH',
          country: 'DE',
          registrationNumber: '99301347',
        },
        metadata: {
          personioPayrollEnabled: true,
          canEdit: true,
          validationErrors: [],
        },
      },
      {
        id: '7341',
        status: 'ACTIVE',
        isMain: true,
        validFrom: '2023-01-01',
        assignedEmployees: { active: 3, total: 4 },
        attributes: {
          name: 'Testfirma GmbH',
          email: 'testfirma@audit.de',
          phone: '+49 695351981',
          address: {
            streetName: 'Maximillianstraße',
            houseNumber: '11',
            postalCode: '80539',
            city: 'München',
            state: 'DE-BY',
          },
          contactPerson: {
            salutation: 'MR',
            fullName: 'Maxi Tester',
            email: 'maxi.tester@audit.de',
            phone: '+49 695351982',
            fax: '+4912333333',
          },
          bankDetails: {
            iban: 'DE41500105177512512784',
            bic: 'INGDDEFFXXX',
            accountHolder: 'Testfirma GmbH',
          },
          industrySector: 'ADVERTISING_AND_PR_SERVICES',
          type: 'GMBH',
          country: 'DE',
          registrationNumber: '99301347',
        },
        metadata: {
          personioPayrollEnabled: true,
          canEdit: true,
          validationErrors: [],
        },
      },
    ],
    metadata: { canCreate: true, creationLimit: -1 },
  };

export const listLegalEntitiesData200ListLegalEntitiesWithValidationErrorsSuccessResponseStatus = 200;

export const listLegalEntitiesData200ListLegalEntitiesWithValidationErrorsSuccessResponse: ListLegalEntitiesData =
  {
    legalEntities: [
      {
        id: '7341',
        status: 'ACTIVE',
        isMain: false,
        validFrom: '2024-08-05',
        assignedEmployees: { active: 0, total: 0 },
        attributes: {
          name: 'test1 GmbH',
          industrySector: 'ACCOUNTING_AND_AUDITING_SERVICES',
          type: 'GMBH',
          country: 'DE',
          registrationNumber: '99301347',
        },
        metadata: {
          personioPayrollEnabled: true,
          canEdit: true,
          validationErrors: [
            {
              severity: 'ERROR',
              message:
                'phone darf nicht null sein, address.city FIELD_REQUIRED, contactPerson.email FIELD_REQUIRED, contactPerson.phone FIELD_REQUIRED, address.postalCode FIELD_REQUIRED, bankDetails.bic FIELD_REQUIRED, contactPerson.fullName FIELD_REQUIRED, address.houseNumber FIELD_REQUIRED, bankDetails.iban FIELD_REQUIRED, officialRegistrationNumber darf nicht null sein, address.streetName FIELD_REQUIRED, email darf nicht null sein, bankDetails.accountHolder FIELD_REQUIRED',
              details: [
                { reason: 'FIELD_REQUIRED', metadata: { field: 'phone' } },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'address.city' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'contactPerson.email' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'contactPerson.phone' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'address.postalCode' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'bankDetails.bic' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'contactPerson.fullName' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'address.houseNumber' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'bankDetails.iban' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'registrationNumber' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'address.streetName' },
                },
                { reason: 'FIELD_REQUIRED', metadata: { field: 'email' } },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'bankDetails.accountHolder' },
                },
              ],
            },
          ],
        },
      },
      {
        id: '438853',
        status: 'ACTIVE',
        isMain: false,
        validFrom: '2024-06-01',
        assignedEmployees: { active: 0, total: 0 },
        attributes: {
          name: 'Testfirma2 GmbH',
          email: 'testfirma@audit.de',
          phone: '+49 695351981',
          address: {
            streetName: 'Somestreet',
            houseNumber: '123',
            postalCode: '80539',
            city: 'München',
            state: 'DE-BY',
          },
          contactPerson: {
            salutation: 'MS',
            fullName: 'Maxi Tester',
            email: 'maxi.tester@audit.de',
            phone: '+49 695351982',
          },
          bankDetails: {
            iban: 'DE41500105177512512784',
            bic: 'INGDDEFFXXX',
            accountHolder: 'Testfirma GmbH',
          },
          industrySector: 'ACCOUNTING_AND_AUDITING_SERVICES',
          type: 'GMBH',
          country: 'DE',
          registrationNumber: '99301347',
        },
        metadata: {
          personioPayrollEnabled: true,
          canEdit: true,
          validationErrors: [],
        },
      },
      {
        id: '434553',
        status: 'ACTIVE',
        isMain: false,
        validFrom: '2024-01-01',
        assignedEmployees: { active: 1, total: 1 },
        attributes: {
          name: '123 GmbH',
          industrySector: 'ACCOUNTING_AND_AUDITING_SERVICES',
          type: 'GMBH',
          country: 'DE',
          registrationNumber: '99301347',
        },
        metadata: {
          personioPayrollEnabled: true,
          canEdit: true,
          validationErrors: [
            {
              severity: 'ERROR',
              message:
                'contactPerson.phone FIELD_REQUIRED, address.city FIELD_REQUIRED, phone darf nicht null sein, address.streetName FIELD_REQUIRED, email darf nicht null sein, contactPerson.fullName FIELD_REQUIRED, bankDetails.iban FIELD_REQUIRED, contactPerson.email FIELD_REQUIRED, address.postalCode FIELD_REQUIRED, bankDetails.bic FIELD_REQUIRED, bankDetails.accountHolder FIELD_REQUIRED, address.houseNumber FIELD_REQUIRED',
              details: [
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'contactPerson.phone' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'address.city' },
                },
                { reason: 'FIELD_REQUIRED', metadata: { field: 'phone' } },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'address.streetName' },
                },
                { reason: 'FIELD_REQUIRED', metadata: { field: 'email' } },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'contactPerson.fullName' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'bankDetails.iban' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'contactPerson.email' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'address.postalCode' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'bankDetails.bic' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'bankDetails.accountHolder' },
                },
                {
                  reason: 'FIELD_REQUIRED',
                  metadata: { field: 'address.houseNumber' },
                },
              ],
            },
          ],
        },
      },
      {
        id: '7341',
        status: 'ACTIVE',
        isMain: true,
        validFrom: '2023-01-01',
        assignedEmployees: { active: 3, total: 4 },
        attributes: {
          name: 'Testfirma GmbH',
          email: 'testfirma@audit.de',
          phone: '+49 695351981',
          address: {
            streetName: 'Maximillianstraße',
            houseNumber: '11',
            postalCode: '80539',
            city: 'München',
            state: 'DE-BY',
          },
          contactPerson: {
            salutation: 'MR',
            fullName: 'Maxi Tester',
            email: 'maxi.tester@audit.de',
            phone: '+49 695351982',
            fax: '+4912333333',
          },
          bankDetails: {
            iban: 'DE41500105177512512784',
            bic: 'INGDDEFFXXX',
            accountHolder: 'Testfirma GmbH',
          },
          industrySector: 'ADVERTISING_AND_PR_SERVICES',
          type: 'GMBH',
          country: 'DE',
          registrationNumber: '99301347',
        },
        metadata: {
          personioPayrollEnabled: true,
          canEdit: true,
          validationErrors: [],
        },
      },
    ],
    metadata: { canCreate: true, creationLimit: -1 },
  };

export const listLegalEntitiesData200ListLegalEntitesUkSuccessResponseStatus = 200;

export const listLegalEntitiesData200ListLegalEntitesUkSuccessResponse: ListLegalEntitiesData =
  {
    legalEntities: [
      {
        id: '993',
        status: 'ACTIVE',
        isMain: false,
        validFrom: '2023-01-01',
        assignedEmployees: { active: 1, total: 1 },
        attributes: {
          name: 'UK Legal entity (NON DIRECTORS)',
          address: {
            streetName: 'East Street',
            houseNumber: '8931',
            postalCode: 'WHS1 ZXZ',
            city: 'London',
          },
          industrySector: 'ACCOUNTING_AND_AUDITING_SERVICES',
          country: 'GB',
          registrationNumber: '23232323232323',
        },
        metadata: {
          personioPayrollEnabled: false,
          canEdit: true,
          validationErrors: [],
        },
      },
      {
        id: '1943',
        status: 'ACTIVE',
        isMain: true,
        validFrom: '2022-12-03',
        assignedEmployees: { active: 1, total: 1 },
        attributes: {
          name: 'UK Legal entity (Directors)',
          address: {
            streetName: 'My new address',
            postalCode: 'WC2E 9LY',
            city: 'London',
          },
          industrySector: 'ACCOUNTING_AND_AUDITING_SERVICES',
          country: 'GB',
          registrationNumber: '23232323232323',
        },
        metadata: {
          personioPayrollEnabled: false,
          canEdit: true,
          validationErrors: [],
        },
      },
    ],
    metadata: { canCreate: true, creationLimit: -1 },
  };

export const listLegalEntitiesError401Status = 401;
