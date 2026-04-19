import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PayrollLayout } from '../PayrollLayout';
import { type InfoPicker } from '../Pickers/types';

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

  describe('legalEntitiesProp', () => {
    const legalEntities: InfoPicker = {
      list: [{ label: 'Legal Entity', key: '1' }],
      onSelect: jest.fn(),
      selected: '',
      placeholder: 'Select a legal entity',
    };

    it('should render the placeholder when selected doesnt exist', () => {
      render(<PayrollLayout title="" legalEntities={legalEntities} />);
      expect(screen.getByText('Select a legal entity')).toBeInTheDocument();
    });

    it('should render the label of the selected entity', () => {
      legalEntities.selected = '1';
      render(<PayrollLayout title="" legalEntities={legalEntities} />);
      expect(screen.getByText('Legal Entity')).toBeInTheDocument();
    });

    it('should call onSelect when an entity is picked', () => {
      render(<PayrollLayout title="" legalEntities={legalEntities} />);
      const picker = screen.getByText('Select a legal entity');
      picker.click();
      const firstEntity = screen.getByText('Legal Entity');
      firstEntity.click();
      expect(legalEntities.onSelect).toHaveBeenCalledWith('1');
    });
  });

  it('renders tabs if provided', () => {
    const tabs = { label: 'Tab 1', value: 'Tab 1 Content' };
    render(
      <PayrollLayout title="Test Title" tabs={tabs}>
        Content
      </PayrollLayout>,
    );
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
  });

  it('renders both legalEntities and tabs if provided', () => {
    const legalEntities = { label: 'Legal Entity', value: 'Entity 1' };
    const tabs = { label: 'Tab 1', value: 'Tab 1 Content' };
    render(
      <PayrollLayout
        title="Test Title"
        legalEntities={legalEntities}
        tabs={tabs}
      >
        Content
      </PayrollLayout>,
    );
    expect(screen.getByText('Legal Entity')).toBeInTheDocument();
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
  });
});
