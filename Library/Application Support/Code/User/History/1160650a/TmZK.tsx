import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LegalEntityPicker } from '../components/LegalEntityPicker';

describe('TitleAccessory Component', () => {
  const mockList = [
    { key: '1', label: 'Option 1' },
    { key: '2', label: 'Option 2' },
  ];
  const mockOnSelect = jest.fn();

  beforeAll(() => {
    window.HTMLElement.prototype.hasPointerCapture = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('renders placeholder when no element is selected', () => {
    render(
      <LegalEntityPicker
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
      <LegalEntityPicker
        list={mockList}
        selected=""
        onSelect={mockOnSelect}
        placeholder="Select an option"
      />,
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    userEvent.click(screen.getByText('Select an option').parentElement!);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('calls onSelect when an option is selected', () => {
    render(
      <LegalEntityPicker
        list={mockList}
        selected=""
        onSelect={mockOnSelect}
        placeholder="Select an option"
      />,
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    userEvent.click(screen.getByText('Select an option').parentElement!);
    userEvent.click(screen.getByText('Option 1'));
    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });

  it('displays the selected value', () => {
    render(
      <LegalEntityPicker
        list={mockList}
        selected="1"
        onSelect={mockOnSelect}
        placeholder="Select an option"
      />,
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });
});
