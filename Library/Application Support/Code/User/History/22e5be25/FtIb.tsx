import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { InfoPicker } from '../types';
import { PayrollLayout } from '../';

describe('PayrollLayout', () => {
  it('renders the title', () => {
    render(<PayrollLayout title="Test Title" />);
    const screenAndBreadcrumbTitles = screen.getAllByText('Test Title');
    expect(screenAndBreadcrumbTitles).toHaveLength(2);
  });

  it('renders children content', () => {
    render(
      <PayrollLayout title="Test Title">
        <h1>Content</h1>
      </PayrollLayout>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  describe('legalEntities Prop', () => {
    const legalEntities: InfoPicker = {
      list: [{ label: 'Legal Entity 1', key: 'le-1' }],
      onSelect: jest.fn(),
      selected: '',
      placeholder: 'Select a legal entity',
    };

    it('should render the placeholder when selected doesnt exist', () => {
      render(<PayrollLayout title="" legalEntities={legalEntities} />);
      expect(screen.getByText('Select a legal entity')).toBeInTheDocument();
    });

    it('should render the label of the selected entity', () => {
      const LEs = { ...legalEntities, selected: 'le-1' };
      render(<PayrollLayout title="" legalEntities={LEs} />);
      expect(screen.getByText('Legal Entity 1')).toBeInTheDocument();
    });

    it('should call onSelect when an entity is picked', () => {
      window.HTMLElement.prototype.hasPointerCapture = jest.fn();
      window.HTMLElement.prototype.scrollIntoView = jest.fn();

      render(<PayrollLayout title="" legalEntities={legalEntities} />);
      // TODO: fix DS select to add aria-label so that we could use it as "getByRole('combobox', { name: 'Select a legal entity' })"
      const pickerTitle = screen.getByText('Select a legal entity');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userEvent.click(pickerTitle.parentElement!);
      userEvent.click(screen.getByText('Legal Entity 1'));
      expect(legalEntities.onSelect).toHaveBeenCalledWith('le-1');
    });
  });

  describe('tabs Prop', () => {
    const tabs: InfoPicker = {
      list: [
        { label: 'Payruns', key: 'runs' },
        { label: 'Documents', key: 'docs' },
      ],
      onSelect: jest.fn(),
      selected: 'runs',
    };

    it('should render the tab names', () => {
      render(<PayrollLayout title="" tabs={tabs} />);
      expect(screen.getByRole('tab', { name: 'Payruns' })).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: 'Documents' }),
      ).toBeInTheDocument();
    });

    it('should call onSelect when a tab is picked', async () => {
      render(<PayrollLayout title="" tabs={tabs} />);
      userEvent.click(screen.getByRole('tab', { name: 'Documents' }));
      expect(tabs.onSelect).toHaveBeenCalledWith('docs');
    });
  });
});
