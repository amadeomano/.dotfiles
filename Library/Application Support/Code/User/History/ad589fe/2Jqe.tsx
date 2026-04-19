import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabBar } from '../Pickers/TabBar';

describe('TabBar Component', () => {
  const mockList = [
    { key: 'tab1', label: 'Tab 1', count: 10 },
    { key: 'tab2', label: 'Tab 2', count: 5 },
  ];
  const mockOnSelect = jest.fn();

  it('renders all tabs', () => {
    render(<TabBar list={mockList} selected="tab1" onSelect={mockOnSelect} />);

    screen.getByRole('alert');
    mockList.forEach(({ key, label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByTestId(`payroll-${key}`)).toBeInTheDocument();
    });
  });

  it('calls onSelect with the correct value when a tab is clicked', () => {
    render(<TabBar list={mockList} selected="tab1" onSelect={mockOnSelect} />);

    userEvent.click(screen.getByText('Tab 2'));
    expect(mockOnSelect).toHaveBeenCalledWith('tab2');
  });
});
