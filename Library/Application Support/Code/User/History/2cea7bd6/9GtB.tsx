import { render, screen, fireEvent } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { EmployeeCompensations } from './EmployeeCompensations';

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
};

describe('EmployeeCompensations', () => {
  it('renders gross pay section correctly', () => {
    render(<EmployeeCompensations employee={employee} />);

    expect(screen.getByText('Gross Pay')).toBeInTheDocument();
    expect(screen.getByText('Base Salary')).toBeInTheDocument();
    expect(screen.getByText('Bonus')).toBeInTheDocument();
    expect(screen.getByText('Total gross pay')).toBeInTheDocument();
  });

  it('renders deductions section correctly', () => {
    render(<EmployeeCompensations employee={employee} />);

    expect(screen.getByText('Deductions')).toBeInTheDocument();
    expect(screen.getByText('Tax')).toBeInTheDocument();
    expect(screen.getByText('Insurance')).toBeInTheDocument();
    expect(screen.getByText('Total deductions')).toBeInTheDocument();
  });

  it('renders contributions section correctly', () => {
    render(<EmployeeCompensations employee={employee} />);

    expect(screen.getByText('Contributions')).toBeInTheDocument();
    expect(screen.getByText('Pension')).toBeInTheDocument();
    expect(screen.getByText('Health Insurance')).toBeInTheDocument();
    expect(screen.getByText('Total contributions')).toBeInTheDocument();
  });

  it('navigates to employee salary on payment item click', () => {
    render(<EmployeeCompensations employee={employee} />);

    fireEvent.click(screen.getByText('Base Salary'));
    expect(mockRouter.push).toHaveBeenCalledWith(
      '/salary/employee-salary/1?baseSalaryDrawer=open',
    );
  });

  it('navigates to employee salary on deduction item click', () => {
    render(<EmployeeCompensations employee={employee} />);

    fireEvent.click(screen.getByText('Tax'));
    expect(mockRouter.push).toHaveBeenCalledWith('/salary/employee-salary/1');
  });

  it('navigates to employee salary on contribution item click', () => {
    render(<EmployeeCompensations employee={employee} />);

    fireEvent.click(screen.getByText('Pension'));
    expect(mockRouter.push).toHaveBeenCalledWith(
      '/salary/employee-salary/1?tab=recurring&recurringSummaryDrawer=open',
    );
  });
});
