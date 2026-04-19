import { renderHook } from '@testing-library/react';
import { useTable } from 'designSystem/component/table';
import { mapTableToSearchParams } from '../../mapTableToSearchParams';
import {
  getProcessedPeopleData,
  getSortingKey,
} from './getProcessedPeopleData';
import * as filterByPerson from '../../filters/filterByPerson';
import * as filterByEmployeeCode from '../../filters/filterByEmployeeCode';
import * as filterByBlockers from '../../filters/filterByBlockers';
import * as filterBySalaryType from '../../filters/filterBySalaryType';
import * as filterByGrossSalary from '../../filters/filterByGrossSalary';
import type { XeroPeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';

const filterByPersonSpy = jest.spyOn(filterByPerson, 'filterByPerson');
const filterByEmployeeNumberSpy = jest.spyOn(
  filterByEmployeeCode,
  'filterByEmployeeCode',
);
const filterByBlockersSpy = jest.spyOn(filterByBlockers, 'filterByBlockers');
const filterBySalaryTypeSpy = jest.spyOn(
  filterBySalaryType,
  'filterBySalaryType',
);
const filterByGrossSalarySpy = jest.spyOn(
  filterByGrossSalary,
  'filterByGrossSalary',
);

describe('getProcessedPeopleData', () => {
  const { result: table } = renderHook(() => useTable());
  const params = mapTableToSearchParams(table.current);

  describe('filtering', () => {
    it('should not run any filtering when no filter exists', () => {
      params.filters = undefined;
      getProcessedPeopleData([], params);
      expect(filterByPersonSpy).not.toBeCalled();
      expect(filterByEmployeeNumberSpy).not.toBeCalled();
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
    describe('by EmployeeNumber', () => {
      it('should not run filtering of employeeNumber when the filter doesnt exist', () => {
        params.filters = { someColumn: { value: '', condition: '' } };
        getProcessedPeopleData([], params);
        expect(filterByEmployeeNumberSpy).not.toBeCalled();
      });
      it('should run the filtering of employeeNumber when the filter exists', () => {
        params.filters = {
          employeeNumber: { value: 'value', condition: 'condition' },
        };
        getProcessedPeopleData([], params);
        expect(filterByEmployeeNumberSpy).toBeCalledWith(
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

    describe('by SalaryType', () => {
      it('should not run filtering of salary types when the filter doesnt exist', () => {
        params.filters = { someColumn: { value: '', condition: '' } };
        getProcessedPeopleData([], params);
        expect(filterBySalaryTypeSpy).not.toBeCalled();
      });
      it('should run the filtering of salary types when the filter exists', () => {
        params.filters = { salaryType: { value: ['HOURLY'] } };
        getProcessedPeopleData([], params);
        expect(filterBySalaryTypeSpy).toBeCalledWith(
          [],
          params.filters.salaryType,
        );
      });
    });

    describe('by GrossSalary', () => {
      it('should not run filtering of gross salary when the filter doesnt exist', () => {
        params.filters = { someColumn: { value: '', condition: '' } };
        getProcessedPeopleData([], params);
        expect(filterByGrossSalarySpy).not.toBeCalled();
      });
      it('should run the filtering of gross salary when the filter exists', () => {
        params.filters = { grossSalary: { value: '1', condition: 'equals' } };
        getProcessedPeopleData([], params);
        expect(filterByGrossSalarySpy).toBeCalledWith(
          [],
          params.filters.grossSalary,
        );
      });
    });
  });

  describe('searching', () => {
    const peopleData = [
      {
        person: { firstName: 'John', lastName: 'Doe' },
        employeeNumber: '123',
        blockers: [],
        grossSalary: { amount: 5000, type: 'Monthly' },
      },
      {
        person: { firstName: 'Smith', lastName: 'Jane' },
        employeeNumber: '456',
        blockers: [{ attributeName: 'Late submission' }],
        grossSalary: { amount: 60000, type: 'Annual' },
      },
      {
        person: { firstName: 'Alice', lastName: 'Johnson' },
        employeeNumber: '789',
        blockers: [{ attribute_name: 'Missing documents' }],
        grossSalary: { amount: 1200, type: 'Weekly' },
      },
    ] as unknown as PeopleData[];

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

      const sortingKeys = getSortingKey(params.sortingId as keyof PeopleData);

      expect(sortingKeys).toEqual(['person.lastName', 'person.firstName']);
    });

    it('should use salary amount when the sorting id is grossSalary', () => {
      params.sortingId = 'grossSalary';

      const sortingKeys = getSortingKey(params.sortingId as keyof PeopleData);

      expect(sortingKeys).toEqual('grossSalary.amount');
    });
  });
});
