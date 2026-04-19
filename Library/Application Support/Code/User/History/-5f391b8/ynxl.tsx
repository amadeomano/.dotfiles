import { render } from '@testing-library/react';
import { HeaderContent } from '../HeaderContent';

describe('HeaderContent', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<HeaderContent>Test Content</HeaderContent>);
    expect(getByText('Test Content')).toBeInTheDocument();
  });
});
