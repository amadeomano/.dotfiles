import {
  type UseTableReturnType,
  type ColumnFilter,
} from 'designSystem/component/table';
import { type PayrollRun } from '../../../hooks/payroll-lifecycle/usePayrollRuns';
import { getProcessedData } from './dataProcessor';
import { COLUMNS } from './columns';

const mockData: PayrollRun[] = [
  { period: 1, taxYear: 2023 } as PayrollRun,
  { period: 2, taxYear: 2024 } as PayrollRun,
];
const mockTable = {
  sorting: {},
  filters: { filters: [] as ColumnFilter[] },
} as UseTableReturnType;

describe('getProcessedData', () => {
  test('returns empty array if no data is provided', () => {
    const result = getProcessedData(mockTable, undefined);
    expect(result).toEqual([]);
  });

  describe('sorting', () => {
    test('returns same data when no sorting demanded', () => {
      const result = getProcessedData(mockTable, mockData);
      expect(result).toEqual(mockData);
    });
    test('returns sorted data by taxYear ascending', () => {
      const mockTableSort = { ...mockTable };
      mockTableSort.sorting.sorting = { id: COLUMNS.taxYear, desc: false };

      const result = getProcessedData(mockTable, mockData);
      expect(result[0].taxYear).toBe(2023);
      expect(result[1].taxYear).toBe(2024);
    });

    test('returns sorted data by period descending', () => {
      const mockTableSort = { ...mockTable };
      mockTableSort.sorting.sorting = { id: COLUMNS.taxPeriod, desc: true };

      const result = getProcessedData(mockTableSort, mockData);
      expect(result[0].period).toBe(2);
      expect(result[1].period).toBe(1);
    });
  });

  describe('filtering', () => {
    test('filters data by taxYear', () => {
      const mockTableFilter = { ...mockTable };
      const filterValue = { value: '2023', condition: 'contains' };
      mockTableFilter.filters.filters = [
        { id: COLUMNS.taxYear, value: filterValue },
      ];

      const result = getProcessedData(mockTable, mockData);
      expect(result).toEqual([{ period: 1, taxYear: 2023 }]);
    });

    test('filters data by taxYear and taxPeriod', () => {
      const mockTableFilter = { ...mockTable };
      const filterValue1 = { value: '20', condition: 'contains' };
      const filterValue2 = { value: [1, 3], condition: 'is_within_range' };
      mockTableFilter.filters.filters = [
        { id: COLUMNS.taxYear, value: filterValue1 },
        { id: COLUMNS.taxPeriod, value: filterValue2 },
      ];

      const result = getProcessedData(mockTableFilter, mockData);
      console.log({ mockData, result });
      expect(result).toEqual([
        { period: 1, taxYear: 2023 },
        { period: 2, taxYear: 2024 },
      ]);
    });
  });
});
