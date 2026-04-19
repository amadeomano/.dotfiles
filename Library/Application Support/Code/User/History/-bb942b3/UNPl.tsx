import { render, screen } from '@testing-library/react';
import { EmployeesTable } from '../EmployeesTable/EmployeesTable';
import { PAYRUN_MOCK } from '../../../../../../__mocks__/Payruns';
import { formatCurrency } from '@personio-web/currency';
import { COMPENSATIONS_SCHEMA_MOCK } from '../../../../../../__mocks__/CompensationsSchema';
import { getNumericValue } from '../../../../utils/helpers';
import * as panelHooks from '../../contexts/useEmployeeDetailsPanelContext';
import { useAuthContext } from '@personio-web/auth-context';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';

jest.mock('@personio-web/auth-context');
const mockUseAuthContext = useAuthContext as jest.Mock;

jest
  .spyOn(panelHooks, 'useSyncEmployeeDetailsPanelList')
  .mockImplementation(jest.fn());

const props = {
  isLoading: false,
  payRun: PAYRUN_MOCK[0],
  compensationSchemas: COMPENSATIONS_SCHEMA_MOCK.data,
};

const data = PAYRUN_MOCK[0].employeeResults[0];

const tableContent = [
  {
    header: 'Person',
    value: `${data.employee?.firstName} ${data.employee?.lastName}`,
  },
  {
    header: 'Gross pay',
    value: formatCurrency(
      'en-GB',
      'GBP',
      getNumericValue(data.payslip?.grossPay || ''),
    ),
  },
  {
    header: 'Net pay',
    value: formatCurrency(
      'en-GB',
      'GBP',
      getNumericValue(data.payslip?.netPay || ''),
    ),
  },
  {
    header: 'Salary',
    value: formatCurrency(
      'en-GB',
      'GBP',
      getNumericValue(data.payslip?.payments[0].amount || ''),
    ),
  },
  {
    header: 'Gym membership',
    value: formatCurrency(
      'en-GB',
      'GBP',
      getNumericValue(data.payslip?.contributions[0].amount || ''),
    ),
  },
];
const nonCompensationSchemaItems = ['Employer National Insurance', 'PAYE'];

describe('<EmployeesTable/>', () => {
  beforeEach(() => {
    mockUseAuthContext.mockReturnValue({
      companyId: 1,
    });
  });

  test.each(tableContent)(
    'should render the column and the data',
    ({ header, value }) => {
      render(<EmployeesTable {...props} />);

      expect(screen.getByText(header)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
    },
  );

  test.each(nonCompensationSchemaItems)(
    'should not render non compensation schema columns',
    (compensationItem) => {
      render(<EmployeesTable {...props} />);

      expect(screen.queryByText(compensationItem)).not.toBeInTheDocument();
    },
  );

  test('should navigate to employee details panel on row click', () => {
    mockRouter.setCurrentUrl('');
    render(<EmployeesTable {...props} />);

    const employeeRow = screen.getByRole('row', {
      name: new RegExp(tableContent[2].value),
    });
    userEvent.click(employeeRow);
    expect(mockRouter.query).toEqual({ employee: data.employeeId });
  });
});
