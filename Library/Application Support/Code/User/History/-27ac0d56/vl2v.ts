import { type PayrollRun } from '../../../hooks/payroll-lifecycle/usePayrollRuns';
import { titleFilter } from './filters';

const mockPayrollRun: PayrollRun = { payDate: '2023-09-01' } as PayrollRun;

jest.mock('./filterUtils', () => ({
  predicateByStr: jest.fn(),
  predicateByNum: jest.fn(),
  predicateByDate: jest.fn(),
  predicateBySelect: jest.fn(),
}));

describe('Filters', () => {
  test('titleFilter calls predicateByStr', () => {
    const filter = { value: '2023', condition: 'contains' };
    titleFilter.filterHandler(filter)(mockPayrollRun);
    expect(predicateByStr).toHaveBeenCalledWith(mockPayrollRun.payDate, filter);
  });
});
