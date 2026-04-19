import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TitleAccessory } from '../Pickers/TitleAccessory';

describe('TitleAccessory Component', () => {
  const mockList = [
    { key: '1', label: 'Option 1' },
    { key: '2', label: 'Option 2' },
  ];
  const mockOnSelect = jest.fn();

  it('renders placeholder when no element is selected', () => {
    render(
      <TitleAccessory
        list={mockList}
        selected=""
        onSelect={mockOnSelect}
        placeholder="Select an option"
      />,
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
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
    userEvent.click(screen.getByText('Select an option').parentElement!);
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
    userEvent.click(screen.getByPlaceholderText('Select an option'));
    userEvent.click(screen.getByText('Option 1'));
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
