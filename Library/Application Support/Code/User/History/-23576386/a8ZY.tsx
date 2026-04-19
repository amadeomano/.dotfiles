import { type PropsWithChildren } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Drawer } from 'designSystem/component/panel';
import { Slot } from '@personio-web/design-system-utils/src/Slot/Slot';
import { PayrollSidePanel, SidePanelNavbar } from '..';

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
    render(<SidePanelNavbar hasStepper onNext={onNext} />, { wrapper });
    userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onPrev when previous button is clicked', () => {
    const onPrev = jest.fn();
    render(<SidePanelNavbar hasStepper onPrev={onPrev} />, { wrapper });
    userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPrev).toHaveBeenCalled();
  });

  it('disables next button when onNext is not provided', () => {
    render(<SidePanelNavbar hasStepper />, { wrapper });
    expect(screen.getByLabelText('Next')).toBeDisabled();
  });

  it('disables previous button when onPrev is not provided', () => {
    render(<SidePanelNavbar hasStepper />, { wrapper });
    expect(screen.getByLabelText('Previous')).toBeDisabled();
  });

  it('doesnt render steppers when its not demanded', () => {
    render(<SidePanelNavbar hasStepper={false} />, { wrapper });
    expect(screen.queryByLabelText('Next')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Previous')).not.toBeInTheDocument();
  });
});

describe('SidePanel', () => {
  it('renders children', () => {
    render(
      <PayrollSidePanel isOpen>
        <div>Child Content</div>
      </PayrollSidePanel>,
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders header slot', () => {
    render(
      <PayrollSidePanel
        isOpen
        navbar={<SidePanelNavbar title="Header Title" />}
      />,
    );
    expect(screen.getByText('Header Title')).toBeInTheDocument();
  });
});
