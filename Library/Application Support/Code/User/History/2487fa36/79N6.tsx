import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  EmployeeDetailsPanelContextProvider,
  EmployeeDetailsPanelContext,
} from './EmployeeDetailsPanelContext';

describe('EmployeeDetailsPanelContext', () => {
  it('provides default values', () => {
    render(
      <EmployeeDetailsPanelContextProvider>
        <EmployeeDetailsPanelContext.Consumer>
          {(value) => (
            <div>
              <span data-testid="employeeIds">
                {value?.employeeIds.join(',')}
              </span>
            </div>
          )}
        </EmployeeDetailsPanelContext.Consumer>
      </EmployeeDetailsPanelContextProvider>,
    );

    expect(screen.getByTestId('employeeIds').textContent).toBe('');
  });

  it('updates employeeIds', () => {
    const TestComponent = () => {
      const { employeeIds, setEmployeeIds } = React.useContext(
        EmployeeDetailsPanelContext,
      )!;

      React.useEffect(() => {
        setEmployeeIds([1, 2, 3]);
      }, [setEmployeeIds]);

      return <span data-testid="employeeIds">{employeeIds.join(',')}</span>;
    };

    render(
      <EmployeeDetailsPanelContextProvider>
        <TestComponent />
      </EmployeeDetailsPanelContextProvider>,
    );

    expect(screen.getByTestId('employeeIds').textContent).toBe('1,2,3');
  });
});
