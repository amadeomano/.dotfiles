import { render, screen, fireEvent } from '@testing-library/react';
import { TitleAccessory } from '../Pickers/TitleAccessory';

describe('TitleAccessory', () => {
  const mockList = [
    { key: '1', label: 'Option 1' },
    { key: '2', label: 'Option 2' },
  ];
  const mockOnSelect = jest.fn();

  it('renders without crashing', () => {
    render(
      <TitleAccessory
        list={mockList}
        selected=""
        onSelect={mockOnSelect}
        placeholder="Select an option"
      />,
    );
    expect(screen.getByPlaceholderText('Select an option')).toBeInTheDocument();
  });

  it('displays the correct options', () => {
    render(
      <TitleAccessory
        list={mockList}
        selected=""
        onSelect={mockOnSelect}
        placeholder="Select an option"
      />,
    );
    fireEvent.click(screen.getByPlaceholderText('Select an option'));
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('calls onSelect when an option is selected', () => {
    render(
      <TitleAccessory
        list={mockList}
        selected=""
        onSelect={mockOnSelect}
        placeholder="Select an option"
      />,
    );
    fireEvent.click(screen.getByPlaceholderText('Select an option'));
    fireEvent.click(screen.getByText('Option 1'));
    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });

  it('displays the selected value', () => {
    render(
      <TitleAccessory
        list={mockList}
        selected="1"
        onSelect={mockOnSelect}
        placeholder="Select an option"
      />,
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });
});
