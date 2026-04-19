import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SidePanel, SidePanelHeader } from '../PayrollSidePanel';

describe('SidePanelHeader', () => {
  it('renders title', () => {
    render(<SidePanelHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onNext when next button is clicked', () => {
    const onNext = jest.fn();
    render(<SidePanelHeader onNext={onNext} />);
    userEvent.click(screen.getByLabelText('Next'));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onPrev when previous button is clicked', () => {
    const onPrev = jest.fn();
    render(<SidePanelHeader onPrev={onPrev} />);
    userEvent.click(screen.getByLabelText('Previous'));
    expect(onPrev).toHaveBeenCalled();
  });

  it('disables next button when onNext is not provided', () => {
    render(<SidePanelHeader />);
    expect(screen.getByLabelText('Next')).toBeDisabled();
  });

  it('disables previous button when onPrev is not provided', () => {
    render(<SidePanelHeader />);
    expect(screen.getByLabelText('Previous')).toBeDisabled();
  });
});

describe('SidePanel', () => {
  it('renders children', () => {
    render(
      <SidePanel isOpen>
        <div>Child Content</div>
      </SidePanel>,
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders header slot', () => {
    render(
      <SidePanel isOpen>
        <SidePanelHeader title="Header Title" />
      </SidePanel>,
    );
    expect(screen.getByText('Header Title')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <SidePanel isOpen={false}>
        <div>Child Content</div>
      </SidePanel>,
    );
    expect(container.firstChild).toBeNull();
  });
});
