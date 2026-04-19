import { type PayrollRun } from '../../../hooks/payroll-lifecycle/usePayrollRuns';
import { titleFilter } from './filters';

describe('Filters', () => {
  test('titleFilter calls predicateByStr', () => {
    const filter = { value: '2023', condition: 'contains' };
    titleFilter.filterHandler(filter)(mockPayrollRun);
    expect(predicateByStr).toHaveBeenCalledWith(mockPayrollRun.payDate, filter);
  });
});
