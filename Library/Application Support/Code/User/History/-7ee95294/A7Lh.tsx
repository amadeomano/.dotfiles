import { render, screen } from '@testing-library/react';
import * as uuid from 'uuid';
import { type Grouping } from '@personio-web/design-system-component-table-types';
import {
  titleColumn,
  peopleColumn,
  scheduleColumn,
  StatusIcon,
  Status,
  statusColumn,
  approvedOnColumn,
  taxPeriodColumn,
  taxYearColumn,
} from './columns';
import { type PayrollRun } from '../../../hooks/payroll-lifecycle/usePayrollRuns';
import { type PayGroup } from '../../../hooks/payroll-lifecycle/usePayGroups';

jest.spyOn(uuid, 'v4').mockReturnValue('unique-id');

type Employee = PayrollRun['employeeResults'][number];
const mockPayrollRun: PayrollRun = {
  id: '12345',
  legalEntityId: '123',
  payGroupId: '1',
  payDate: '2023-01-01',
  employeeResults: [{} as Employee, {} as Employee],
  status: 'APPROVED',
  approvedDate: '2023-01-02',
  period: 1,
  taxYear: 2023,
};
const mockPayrollRunB: PayrollRun = {
  ...mockPayrollRun,
  payGroupId: '3',
  payDate: '2023-01-02',
  employeeResults: [{} as Employee],
  status: 'DRAFT',
  approvedDate: '2023-01-01',
  period: 2,
  taxYear: 2024,
};
describe('Column Configurations', () => {
  test('titleColumn accessor and cell', () => {
    const row = mockPayrollRun;
    const { payDate } = row;

    expect(titleColumn.accessor(mockPayrollRun, 0)).toBe(payDate);
    render(titleColumn.cell({ value: payDate, row }));
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();

    const sortHandler = titleColumn.sortHandler(false);
    expect(sortHandler(mockPayrollRun, mockPayrollRunB)).toBeLessThan(0);
  });

  test('peopleColumn accessor and cell', () => {
    const row = mockPayrollRun;

    expect(peopleColumn.accessor(mockPayrollRun, 0)).toBe(2);
    render(peopleColumn.cell({ value: 2, row }));
    expect(screen.getByText('2')).toBeInTheDocument();

    const sortHandler = peopleColumn.sortHandler(false);
    expect(sortHandler(mockPayrollRun, mockPayrollRunB)).toBeGreaterThan(0);
  });

  describe('scheduleColumn', () => {
    const payGroups: PayGroup[] = [
      { id: '1', frequency: 'MONTHLY' } as PayGroup,
      { id: '2', frequency: 'WEEKLY' } as PayGroup,
    ];
    const scheduleCol = scheduleColumn(payGroups);
    test("accessor should return schedule's frequency as name", () => {
      expect(scheduleCol.accessor(mockPayrollRun, 0)).toBe('Monthly');
      expect(scheduleCol.accessor(mockPayrollRunB, 0)).toBe('');
    });

    test('cell should render frequency correctly', () => {
      render(scheduleCol.cell({ value: 'Monthly', row: mockPayrollRun }));
      expect(screen.getByText('Monthly')).toBeInTheDocument();
    });

    test('sortHandler should sort data correctly', () => {
      const sortHandler = scheduleCol.sortHandler(false);
      expect(sortHandler(mockPayrollRun, mockPayrollRunB)).toBeGreaterThan(0);
    });

    test('getGroups should group data and return the groups correctly', () => {
      const payRunsToGroup: PayrollRun[] = [
        { payGroupId: '1' } as PayrollRun,
        { payGroupId: '2' } as PayrollRun,
        { payGroupId: '1' } as PayrollRun,
      ];
      const groupedPayRuns: Grouping[] = [
        { uniqueId: 'unique-id', id: 'g1', label: 'Schedule', value: 'Weekly' },
        {
          uniqueId: 'unique-id',
          id: 'g1',
          label: 'Schedule',
          value: 'Monthly',
        },
      ];
      const groups = scheduleCol.getGroups?.(payRunsToGroup, {
        groupId: 'g1',
        filters: [],
        sort: 'desc',
      });
      expect(groups).toEqual(groupedPayRuns);
    });

    test('groupFilterHandler should filter data correctly', () => {
      const run = { payGroupId: '1' } as PayrollRun;
      const truthyArg = { value: 'Monthly' } as Grouping;
      const filter = scheduleCol.groupFilterHandler?.(truthyArg);
      expect(filter?.(run)).toBe(true);

      const falsyArg = { value: 'Weekly' } as Grouping;
      const filterFalse = scheduleCol.groupFilterHandler?.(falsyArg);
      expect(filterFalse?.(run)).toBe(false);
    });
  });

  describe('statusColumn', () => {
    const row = mockPayrollRun;
    const { status } = row;

    test('accessor should return the status correctly', () => {
      expect(statusColumn.accessor(mockPayrollRun, 0)).toBe(status);
    });

    test('cell should render the status correctly', () => {
      render(statusColumn.cell({ value: status, row }));
      expect(screen.getByText('APPROVED')).toBeInTheDocument();
    });

    test('sortHandler should sort the data correctly', () => {
      const sortHandler = statusColumn.sortHandler(false);
      expect(sortHandler(mockPayrollRun, mockPayrollRunB)).toBeLessThan(0);
    });

    test('getGroups should group data and return the groups correctly', () => {
      const payRunsToGroup: PayrollRun[] = [
        { status: 'APPROVED' } as PayrollRun,
        { status: 'DRAFT' } as PayrollRun,
        { status: 'APPROVED' } as PayrollRun,
      ];
      const groupedPayRuns: Grouping[] = [
        { uniqueId: 'unique-id', id: 'g1', label: 'Status', value: 'DRAFT' },
        { uniqueId: 'unique-id', id: 'g1', label: 'Status', value: 'APPROVED' },
      ];
      const groups = statusColumn.getGroups?.(payRunsToGroup, {
        groupId: 'g1',
        filters: [],
        sort: 'desc',
      });
      expect(groups).toEqual(groupedPayRuns);
    });

    test('groupFilterHandler should filter data correctly', () => {
      const run = { status: 'APPROVED' } as PayrollRun;
      const truthyArg = { value: 'APPROVED' } as Grouping;
      const filter = statusColumn.groupFilterHandler?.(truthyArg);
      expect(filter?.(run)).toBe(true);

      const falsyArg = { value: 'DRAFT' } as Grouping;
      const filterFalse = statusColumn.groupFilterHandler?.(falsyArg);
      expect(filterFalse?.(run)).toBe(false);
    });
  });

  test('approvedOnColumn accessor and cell', () => {
    const row = mockPayrollRun;
    const { approvedDate } = row;

    expect(approvedOnColumn.accessor(mockPayrollRun, 0)).toBe(approvedDate);
    render(approvedOnColumn.cell({ value: approvedDate, row }));
    expect(screen.getByText('2 Jan 2023')).toBeInTheDocument();

    const sortHandler = approvedOnColumn.sortHandler(false);
    expect(sortHandler(mockPayrollRun, mockPayrollRunB)).toBeGreaterThan(0);
  });

  describe('taxPeriodColumn', () => {
    const row = mockPayrollRun;
    const { period } = row;

    test('accessor should return the period names correctly', () => {
      expect(taxPeriodColumn.accessor(mockPayrollRun, 0)).toBe(`M${period}`);
    });

    test('cell should render the period name correctly', () => {
      render(taxPeriodColumn.cell({ value: period, row }));
      expect(screen.getByText(period)).toBeInTheDocument();
    });

    test('sortHandler should sort the pay runs by period correctly', () => {
      const sortHandler = taxPeriodColumn.sortHandler(false);
      expect(sortHandler(mockPayrollRun, mockPayrollRunB)).toBeLessThan(0);
    });

    test('getGroups should group data and return the groups correctly', () => {
      const payRunsToGroup: PayrollRun[] = [
        { period: 1 } as PayrollRun,
        { period: 2 } as PayrollRun,
        { period: 1 } as PayrollRun,
      ];
      const groupedPayRuns: Grouping[] = [
        { uniqueId: 'unique-id', id: 'g1', label: 'Tax period', value: 'M2' },
        { uniqueId: 'unique-id', id: 'g1', label: 'Tax period', value: 'M1' },
      ];
      const groups = taxPeriodColumn.getGroups?.(payRunsToGroup, {
        groupId: 'g1',
        filters: [],
        sort: 'desc',
      });
      expect(groups).toEqual(groupedPayRuns);
    });

    test('groupFilterHandler should filter data correctly', () => {
      const run = { status: 'APPROVED' } as PayrollRun;
      const truthyArg = { value: 'APPROVED' } as Grouping;
      const filter = statusColumn.groupFilterHandler?.(truthyArg);
      expect(filter?.(run)).toBe(true);

      const falsyArg = { value: 'DRAFT' } as Grouping;
      const filterFalse = statusColumn.groupFilterHandler?.(falsyArg);
      expect(filterFalse?.(run)).toBe(false);
    });
  });

  describe('taxYearColumn', () => {
    const row = mockPayrollRun;
    const { taxYear } = row;

    test('accessor should return taxYear in correct format', () => {
      const renderedYear = `${taxYear}-${taxYear + 1}`;
      expect(taxYearColumn.accessor(mockPayrollRun, 0)).toBe(renderedYear);
    });

    test('cell should render the formatted taxYear', () => {
      render(taxYearColumn.cell({ value: taxYear, row }));
      expect(screen.getByText('2023')).toBeInTheDocument();
    });

    test('sortHandler should sort by textYear correctly', () => {
      const sortHandler = taxYearColumn.sortHandler(false);
      expect(sortHandler(mockPayrollRun, mockPayrollRunB)).toBeLessThan(0);
    });

    test('getGroups should group data and return the groups correctly', () => {
      const payRunsToGroup: PayrollRun[] = [
        { taxYear: 2023 } as PayrollRun,
        { taxYear: 2024 } as PayrollRun,
        { taxYear: 2023 } as PayrollRun,
      ];
      const groupedPayRuns: Grouping[] = [
        {
          uniqueId: 'unique-id',
          id: 'g1',
          label: 'Tax year',
          value: '2024-2025',
        },
        {
          uniqueId: 'unique-id',
          id: 'g1',
          label: 'Tax year',
          value: '2023-2024',
        },
      ];
      const groups = taxYearColumn.getGroups?.(payRunsToGroup, {
        groupId: 'g1',
        filters: [],
        sort: 'desc',
      });
      expect(groups).toEqual(groupedPayRuns);
    });

    test('groupFilterHandler should filter data correctly', () => {
      const run = { status: 'APPROVED' } as PayrollRun;
      const truthyArg = { value: 'APPROVED' } as Grouping;
      const filter = statusColumn.groupFilterHandler?.(truthyArg);
      expect(filter?.(run)).toBe(true);

      const falsyArg = { value: 'DRAFT' } as Grouping;
      const filterFalse = statusColumn.groupFilterHandler?.(falsyArg);
      expect(filterFalse?.(run)).toBe(false);
    });
  });
});

describe('Status Components', () => {
  test('StatusIcon renders correctly for DRAFT', () => {
    const { container } = render(<StatusIcon status="DRAFT" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('StatusIcon renders correctly for APPROVED', () => {
    const { container } = render(<StatusIcon status="APPROVED" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('Status renders correctly', () => {
    render(<Status status="APPROVED" />);
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });
});
