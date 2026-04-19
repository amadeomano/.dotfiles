import { type PropsWithChildren } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Drawer } from 'designSystem/component/panel';
import { Slot } from '@personio-web/design-system-utils/src/Slot/Slot';
import { SidePanel, SidePanelNavbar } from '../PayrollSidePanel';

describe('SidePanelHeader', () => {
  const wrapper = ({ children }: PropsWithChildren) => (
    <Drawer>
      <Slot name="Drawer.NavigationBar">{children}</Slot>
    </Drawer>
  );
  it('renders title', () => {
    render(<SidePanelNavbar title="Test Title" />, { wrapper });
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onNext when next button is clicked', () => {
    const onNext = jest.fn();
    render(<SidePanelNavbar onNext={onNext} />, { wrapper });
    userEvent.click(screen.getByLabelText('Next'));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onPrev when previous button is clicked', () => {
    const onPrev = jest.fn();
    render(<SidePanelNavbar onPrev={onPrev} />, { wrapper });
    userEvent.click(screen.getByLabelText('Previous'));
    expect(onPrev).toHaveBeenCalled();
  });

  it('disables next button when onNext is not provided', () => {
    render(<SidePanelNavbar />, { wrapper });
    expect(screen.getByLabelText('Next')).toBeDisabled();
  });

  it('disables previous button when onPrev is not provided', () => {
    render(<SidePanelNavbar />, { wrapper });
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
      <SidePanel isOpen navbar={<SidePanelNavbar title="Header Title" />} />,
    );
    expect(screen.getByText('Header Title')).toBeInTheDocument();
  });
});
