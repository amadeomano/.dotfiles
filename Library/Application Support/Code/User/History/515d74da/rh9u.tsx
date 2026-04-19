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
    const { getByText } = render(
      <Header title="Test Title">Test Description</Header>,
    );
    expect(getByText('Test Description')).toBeInTheDocument();
  });

  it('applies the correct class to the description', () => {
    const { container } = render(
      <Header title="Test Title">Test Description</Header>,
    );
    const descriptionElement = container.querySelector('p');
    expect(descriptionElement).toHaveClass('description');
  });
});
