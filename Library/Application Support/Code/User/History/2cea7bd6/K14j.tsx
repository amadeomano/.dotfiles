import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { EmployeeCompensations } from './EmployeeCompensations';
import { type PayrollRun } from '../../../../../../hooks/payroll-lifecycle/usePayrollRuns';

jest.mock('next/router', () => require('next-router-mock'));

const employee = {
  employeeId: 1,
  payslip: {
    payments: [
      { description: 'Base Salary', amount: '2000' },
      { description: 'Bonus', amount: '500' },
    ],
    deductions: [
      { description: 'Tax', amount: '300' },
      { description: 'Insurance', amount: '100' },
    ],
    contributions: [
      { description: 'Pension', amount: '200' },
      { description: 'Health Insurance', amount: '150' },
    ],
  },
} as PayrollRun['employeeResults'][number];

describe('EmployeeCompensations', () => {
  it('renders gross pay section correctly', () => {
    render(<EmployeeCompensations employee={employee} />);

    expect(
      screen.getByRole('heading', { name: 'Gross Pay' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', { name: 'Base Salary 2000' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', { name: 'Bonus 500' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', { name: 'Total gross pay 2500' }),
    ).toBeInTheDocument();
  });

  it('renders deductions section correctly', () => {
    render(<EmployeeCompensations employee={employee} />);

    expect(
      screen.getByRole('heading', { name: 'Deductions' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', { name: 'Tax 300' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', { name: 'Insurance 100' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', { name: 'Total deductions 400' }),
    ).toBeInTheDocument();
  });

  it('renders contributions section correctly', () => {
    render(<EmployeeCompensations employee={employee} />);

    expect(
      screen.getByRole('heading', { name: 'Contributions' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', { name: 'Pension 200' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', { name: 'Health Insurance 150' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Total contributions')).toBeInTheDocument();
  });

  it('navigates to employee salary on payment item click', () => {
    mockRouter.setCurrentUrl('/payroll/payruns?activePayRunId=1');
    render(<EmployeeCompensations employee={employee} />);

    userEvent.click(screen.getByText('Base Salary'));
    expect(mockRouter.asPath).toBe(
      '/salary/employee-salary/1?baseSalaryDrawer=open',
    );
  });

  it('navigates to employee salary on deduction item click', () => {
    mockRouter.setCurrentUrl('/payroll/payruns?activePayRunId=1');
    render(<EmployeeCompensations employee={employee} />);

    userEvent.click(screen.getByText('Tax'));
    expect(mockRouter.asPath).toBe('/salary/employee-salary/1');
  });

  it('navigates to employee salary on contribution item click', () => {
    mockRouter.setCurrentUrl('/payroll/payruns?activePayRunId=1');
    render(<EmployeeCompensations employee={employee} />);

    userEvent.click(screen.getByText('Pension'));
    expect(mockRouter.asPath).toBe(
      '/salary/employee-salary/1?tab=recurring&recurringSummaryDrawer=open',
    );
  });
});
