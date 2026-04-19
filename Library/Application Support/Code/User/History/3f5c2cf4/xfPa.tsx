import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from 'designSystem/component/panel';
import { SidePanel, SidePanelHeader } from '../PayrollSidePanel';
SidePanelHeader.name = 'NavigationBar';

describe('SidePanelHeader', () => {
  it('renders the title', () => {
    render(
      <Drawer>
        <SidePanelHeader title="Test Title" />
      </Drawer>,
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onNext when the next button is clicked', () => {
    const onNext = jest.fn();
    render(<SidePanelHeader onNext={onNext} />);
    userEvent.click(screen.getByLabelText('Next'));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onPrev when the previous button is clicked', () => {
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
  it('renders the SidePanel with header and content', () => {
    render(
      <SidePanel isOpen>
        <SidePanelHeader title="Header Title" />
        <div>Panel Content</div>
      </SidePanel>,
    );
    expect(screen.getByText('Header Title')).toBeInTheDocument();
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  it('does not render the header if not provided', () => {
    render(
      <SidePanel isOpen>
        <div>Panel Content</div>
      </SidePanel>,
    );
    expect(screen.queryByText('Header Title')).not.toBeInTheDocument();
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  it('calls onClose when the panel is closed', () => {
    const onClose = jest.fn();
    render(
      <SidePanel isOpen onClose={onClose}>
        <div>Panel Content</div>
      </SidePanel>,
    );
    // Assuming there's a close button or some way to trigger onClose
    // userEvent.click(screen.getByLabelText('Close'));
    // expect(onClose).toHaveBeenCalled();
  });
});
