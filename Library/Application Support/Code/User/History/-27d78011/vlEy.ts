import { XeroPeopleData as PeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';
import { filterByGrossSalary } from './filterByGrossSalary';

describe('filterByGrossSalary', () => {
  const peopleData = [
    { grossSalary: { amount: null } },
    { grossSalary: { amount: 0, currency: 'GBP' } },
    { grossSalary: { amount: 1.25, currency: 'GBP' } },
    { grossSalary: { amount: 2, currency: 'GBP' } },
  ] as PeopleData[];

  it('should return the same set when no filter is provided', () => {
    expect(filterByGrossSalary(peopleData)).toBe(peopleData);
  });

  it('should return the same set when filter has no keyword', () => {
    expect(
      filterByGrossSalary(peopleData, { value: '', condition: 'equals' }),
    ).toBe(peopleData);
  });

  it("should return elements whose salary is 'equal' to the keyword", () => {
    expect(
      filterByGrossSalary(peopleData, {
        value: '1.25',
        condition: 'equals',
      }),
    ).toMatchObject([peopleData[1]]);
  });

  it("should return elements whose salary is 'starting with' the keyword inclusive", () => {
    expect(
      filterByGrossSalary(peopleData, {
        value: '1',
        condition: 'starts_with',
      }),
    ).toMatchObject([peopleData[1], peopleData[2]]);
  });

  it("should return elements whose salary 'ends with' the keyword inclusive", () => {
    expect(
      filterByGrossSalary(peopleData, {
        value: '1.25',
        condition: 'ends_with',
      }),
    ).toMatchObject([peopleData[0], peopleData[1]]);
  });
});
