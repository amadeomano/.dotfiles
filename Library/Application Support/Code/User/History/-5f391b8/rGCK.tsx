import { render, screen } from '@testing-library/react';
import { HeaderContent } from '../HeaderContent';

describe('HeaderContent', () => {
  it('renders children correctly', () => {
    render(<HeaderContent>Test Content</HeaderContent>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
