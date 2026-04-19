import orderBy from 'lodash/orderBy';
import { renderHook } from '@testing-library/react';
import { useTable } from 'designSystem/component/table';
import { mapTableToSearchParams } from '../../mapTableToSearchParams';
import { getProcessedPeopleData } from './getProcessedPeopleData';
import * as filterByPerson from '../../filters/filterByPerson';
import * as filterByEmployeeCode from '../../filters/filterByEmployeeCode';
import * as filterByBlockers from '../../filters/filterByBlockers';
import * as filterByOffice from '../../filters/filterByOffice';
import { A3PeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';

type MockImplementation = Parameters<typeof jest.fn>[0];
jest.mock('lodash/orderBy', () =>
  jest.fn(jest.requireActual('lodash/orderBy') as MockImplementation),
);
const filterByPersonSpy = jest.spyOn(filterByPerson, 'filterByPerson');
const filterByEmployeeCodeSpy = jest.spyOn(
  filterByEmployeeCode,
  'filterByEmployeeCode',
);
const filterByBlockersSpy = jest.spyOn(filterByBlockers, 'filterByBlockers');
const filterByOfficeSpy = jest.spyOn(filterByOffice, 'filterByOffice');

describe('getProcessedPeopleData', () => {
  const { result: table } = renderHook(() => useTable());
  const params = mapTableToSearchParams(table.current);

  describe('filtering', () => {
    it('should not run any filtering when no filter exists', () => {
      params.filters = undefined;
      getProcessedPeopleData([], params);
      expect(filterByPersonSpy).not.toBeCalled();
      expect(filterByEmployeeCodeSpy).not.toBeCalled();
    });
    afterEach(() => {
      params.filters = undefined;
    });
    describe('by Person', () => {
      it('should not run filtering of people when the filter doesnt exist', () => {
        params.filters = { someColumn: { value: '', condition: '' } };
        getProcessedPeopleData([], params);
        expect(filterByPersonSpy).not.toBeCalled();
      });
      it('should run the filtering of people when the filter exists', () => {
        params.filters = { person: { value: 'value', condition: 'condition' } };
        getProcessedPeopleData([], params);
        expect(filterByPersonSpy).toBeCalledWith([], params.filters.person);
      });
    });
    describe('by EmployeeCode', () => {
      it('should not run filtering of employeeCode when the filter doesnt exist', () => {
        params.filters = { someColumn: { value: '', condition: '' } };
        getProcessedPeopleData([], params);
        expect(filterByEmployeeCodeSpy).not.toBeCalled();
      });
      it('should run the filtering of employeeNumber when the filter exists', () => {
        params.filters = {
          employeeNumber: { value: 'value', condition: 'condition' },
        };
        getProcessedPeopleData([], params);
        expect(filterByEmployeeCodeSpy).toBeCalledWith(
          [],
          params.filters.employeeNumber,
        );
      });
    });
    describe('by Blockers', () => {
      it('should not run filtering of blockers when the filter doesnt exist', () => {
        params.filters = { someColumn: { value: '', condition: '' } };
        getProcessedPeopleData([], params);
        expect(filterByBlockersSpy).not.toBeCalled();
      });
      it('should run the filtering of blockers when the filter exists', () => {
        params.filters = {
          blockers: { value: 'value', condition: 'condition' },
        };
        getProcessedPeopleData([], params);
        expect(filterByBlockersSpy).toBeCalledWith([], params.filters.blockers);
      });
    });

    describe('by Office', () => {
      it('should not run filtering of office when the filter doesnt exist', () => {
        params.filters = { someColumn: { value: '', condition: '' } };
        getProcessedPeopleData([], params);
        expect(filterByOfficeSpy).not.toBeCalled();
      });
      it('should run the filtering of office when the filter exists', () => {
        params.filters = {
          office: { value: 'Madrid', condition: 'equals' },
        };
        getProcessedPeopleData([], params);
        expect(filterByOfficeSpy).toBeCalledWith([], params.filters.office);
      });
    });
  });

  describe('searching', () => {
    const peopleData = [
      {
        person: { firstName: 'John', lastName: 'Doe' },
        employeeCode: '123',
        blockers: [],
        office: { officeName: 'Madrid', officeId: 123 },
      },
      {
        person: { firstName: 'Smith', lastName: 'Jane' },
        employeeCode: '456',
        blockers: [{ attributeName: 'Late submission' }],
        office: { officeName: 'Barcelona', officeId: 234 },
      },
      {
        person: { firstName: 'Alice', lastName: 'Johnson' },
        employeeCode: '789',
        blockers: [{ attribute_name: 'Missing documents' }],
        office: { officeName: 'Madrid', officeId: 123 },
      },
    ] as unknown as A3PeopleData[];

    afterEach(() => (params.search = ''));
    it('should search data by firstName or lastname', () => {
      params.search = 'john';
      const filteredData = getProcessedPeopleData(peopleData, params);
      expect(filteredData.length).toBe(2);
      expect(filteredData).toEqual(
        expect.arrayContaining([peopleData[0], peopleData[2]]),
      );
    });
  });

  describe('sorting', () => {
    afterEach(() => (params.sortingId = undefined));
    it('should use lastName when the sorting id is person', () => {
      params.sortingId = 'person';
      getProcessedPeopleData([], params);
      expect(orderBy).toBeCalledWith(
        [],
        ['person.lastName', 'person.firstName'],
        ['asc', 'asc'],
      );
    });
    it('should use salary amount when the sorting id is grossSalary', () => {
      params.sortingId = 'office';
      getProcessedPeopleData([], params);
      expect(orderBy).toBeCalledWith([], 'office.officeName', 'asc');
    });
  });
});
