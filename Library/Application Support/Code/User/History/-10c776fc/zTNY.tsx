import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabBar } from '../components/TabBar';

describe('TabBar Component', () => {
  const mockList = [
    { key: 'tab1', label: 'Tab 1', count: 10 },
    { key: 'tab2', label: 'Tab 2', count: 5 },
  ];
  const mockOnSelect = jest.fn();

  it('renders all tabs', () => {
    render(<TabBar list={mockList} selected="tab1" onSelect={mockOnSelect} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    mockList.forEach(({ key, label, count }) => {
      expect(
        screen.getByRole('tab', { name: `${label} ${count}` }),
      ).toBeInTheDocument();
      expect(screen.getByTestId(`payroll-${key}`)).toBeInTheDocument();
    });
  });

  it('calls onSelect with the correct value when a tab is clicked', () => {
    render(<TabBar list={mockList} selected="tab1" onSelect={mockOnSelect} />);

    userEvent.click(screen.getByRole('tab', { name: 'Tab 2 5' }));
    expect(mockOnSelect).toHaveBeenCalledWith('tab2');
  });
});
