import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header Component', () => {
  it('renders the title correctly', () => {
    render(<Header title="Test Title">Test Description</Header>);
    expect(
      screen.getByRole('heading', { name: 'Test Title' }),
    ).toBeInTheDocument();
  });

  it('renders the children correctly', () => {
    render(<Header title="Test Title">Test Description</Header>);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
