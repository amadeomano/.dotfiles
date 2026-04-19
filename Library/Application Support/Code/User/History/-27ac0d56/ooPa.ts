import { type PayrollRun } from '../../../hooks/payroll-lifecycle/usePayrollRuns';
import {
  type PayGroup,
  getPayGroupById,
} from '../../../hooks/payroll-lifecycle/usePayGroups';
import { taxYearColumn } from './columns';
import {
  titleFilter,
  peopleFilter,
  statusFilter,
  approvedOnFilter,
  taxPeriodFilter,
  taxYearFilter,
  scheduleFilter,
} from './filters';
import {
  predicateByStr,
  predicateByNum,
  predicateByDate,
  predicateBySelect,
} from './filterUtils';

jest.mock('./filterUtils', () => ({
  predicateByStr: jest.fn(),
  predicateByNum: jest.fn(),
  predicateByDate: jest.fn(),
  predicateBySelect: jest.fn(),
}));

describe('Filters', () => {
  const mockPayrollRun: PayrollRun = {
    payDate: '2023-09-01',
    employeeResults: [{}, {}],
    status: 'APPROVED',
    approvedDate: '2023-09-10',
    period: 1,
    taxYear: 2023,
  } as PayrollRun;

  test('titleFilter calls predicateByStr', () => {
    const filter = { value: 'value', condition: 'condition' };
    titleFilter.filterHandler(filter)(mockPayrollRun);
    expect(predicateByStr).toHaveBeenCalledWith(mockPayrollRun.payDate, filter);
  });

  test('peopleFilter calls predicateByNum', () => {
    const filter = { value: 'value', condition: 'condition' };
    peopleFilter.filterHandler(filter)(mockPayrollRun);
    expect(predicateByNum).toHaveBeenCalledWith(
      mockPayrollRun.employeeResults.length,
      filter,
    );
  });

  test('scheduleFilter calls predicateBySelect', () => {
    const payGroups: PayGroup[] = [{ frequency: 'MONTHLY' } as PayGroup];
    const filter = { value: 'value', condition: 'condition' };
    scheduleFilter(payGroups).filterHandler(filter)(mockPayrollRun);
    expect(predicateBySelect).toHaveBeenCalledWith(
      getPayGroupById(payGroups, mockPayrollRun.payGroupId)?.frequency,
      filter,
    );
  });

  test('statusFilter calls predicateBySelect', () => {
    const filter = { value: ['value'], condition: 'condition' };
    statusFilter.filterHandler(filter)(mockPayrollRun);
    expect(predicateBySelect).toHaveBeenCalledWith(
      mockPayrollRun.status,
      filter,
    );
  });

  test('approvedOnFilter calls predicateByDate', () => {
    const filter = { value: new Date('2024-09-27'), condition: 'condition' };
    approvedOnFilter.filterHandler(filter)(mockPayrollRun);
    expect(predicateByDate).toHaveBeenCalledWith(
      mockPayrollRun.approvedDate,
      filter,
    );
  });

  test('taxPeriodFilter calls predicateByNum', () => {
    const filter = { value: 1, condition: 'condition' };
    taxPeriodFilter.filterHandler(filter)(mockPayrollRun);
    expect(predicateByNum).toHaveBeenCalledWith(mockPayrollRun.period, filter);
  });

  test('taxYearFilter calls predicateByStr', () => {
    const filter = { value: 'value', condition: 'condition' };
    taxYearFilter.filterHandler(filter)(mockPayrollRun);
    expect(predicateByStr).toHaveBeenCalledWith(
      taxYearColumn.accessor(mockPayrollRun, 0),
      filter,
    );
  });
});
