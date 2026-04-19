import {
  titleFilter,
  peopleFilter,
  statusFilter,
  approvedOnFilter,
  taxPeriodFilter,
  taxYearFilter,
} from './filters';

describe('Filters', () => {
  test('titleFilter calls predicateByStr', () => {
    const filter = { value: '2023' };
    titleFilter.filterHandler(filter)(mockPayrollRun);
    expect(predicateByStr).toHaveBeenCalledWith(mockPayrollRun.payDate, filter);
  });
});
