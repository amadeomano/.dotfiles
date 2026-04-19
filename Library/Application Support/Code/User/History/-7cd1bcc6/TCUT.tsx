import { type ReactElement } from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getEmployeeListColumnsHandlers } from '@personio-web/employees-organizations-data-people-list/mocking';
import { server } from '@personio-web/mocks/server';

import type { TFunction } from 'i18next';

import { type TestWrapperProps } from '@personio-web/config-jest/src/helpers';
import {
  getTranslation,
  renderWithWrapper as renderWithWrapperBase,
} from '../../test-setup/testHelpers';
import { MockOrgChartDataSourceContext } from '../../test-setup/mocks/MockOrgChartDataSourceContext';
import { MockOrgChartPreferencesContext } from '../../test-setup/mocks/MockOrgChartPreferencesContext';
import { MockOrgChartUIContext } from '../../test-setup/mocks/MockOrgChartUIContext';
import { TreeLayoutProvider } from '../TreeLayout';
import { FeatureFlags } from '../constants/featureFlags';
import { getFilterColumnConfig } from './consts/filterConfig';
import { ControlBar } from './ControlBar';

const mockExportNode = jest.fn();

const tErrors = jest.fn((key) => key) as unknown as TFunction<
  'employees-organizations',
  'org-chart.errors'
>;

const mockTrackAmplitudeEvent = jest.fn();

jest.mock('@personio-web/amplitude-provider', () => ({
  useAmplitude: () => ({
    track: mockTrackAmplitudeEvent,
  }),
}));

jest.mock('../TreeLayout', () => ({
  ...jest.requireActual('../TreeLayout'),
  exportNodes: (args: never[]) => mockExportNode({ ...args, t: tErrors }),
  useTreeLayout: jest.fn(() => ({
    getNodes: jest.fn().mockReturnValue([]),
    viewportInitialized: true,
  })),
}));

const clipboardMethods = { clipboard: { writeText: jest.fn() } };
Object.assign(navigator, clipboardMethods);
jest.spyOn(navigator.clipboard, 'writeText');

const TestControlBar = () => {
  return (
    <TreeLayoutProvider>
      <MockOrgChartPreferencesContext>
        <MockOrgChartDataSourceContext>
          <MockOrgChartUIContext>
            <ControlBar />
          </MockOrgChartUIContext>
        </MockOrgChartDataSourceContext>
      </MockOrgChartPreferencesContext>
    </TreeLayoutProvider>
  );
};

const renderWithWrapper = (
  component: ReactElement,
  options?: TestWrapperProps,
) => {
  return act(() => renderWithWrapperBase(component, options));
};

describe('<ControlBar />', () => {
  const { t: tDS } = getTranslation('design-system', {
    keyPrefix: 'control-bar',
  });
  const { t: tAttributes } = getTranslation('models', {
    keyPrefix: 'employee',
  });
  const { t } = getTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar',
  });

  beforeEach(() => {
    server.use(getEmployeeListColumnsHandlers.defaultHandler);
  });

  it('renders ControlBar with all menus', async () => {
    await renderWithWrapper(<TestControlBar />, {
      features: { [FeatureFlags.ENABLE_ORG_UNITS_IN_ORG_CHART]: 'on' },
    });

    expect(screen.getByText(t('views.label'))).toBeInTheDocument();
    expect(screen.getByText(t('cards.customize-label'))).toBeInTheDocument();
    expect(screen.getByText(t('highlight.label'))).toBeInTheDocument();
    expect(screen.getByText(t('spotlight.title'))).toBeInTheDocument();
    expect(screen.getByText(tDS('trigger.filter'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('search.placeholder'))).toBeInTheDocument();
    expect(screen.getByLabelText(tDS('trigger.share'))).toBeInTheDocument();
    // The source switcher is under a feature flag
    expect(screen.getByText(t('source-switcher.people'))).toBeInTheDocument();
  });

  it('renders ControlBar and interacts with Cards menu', async () => {
    await renderWithWrapper(<TestControlBar />);

    const menu = screen.getByText(t('cards.customize-label'));
    userEvent.click(menu);

    expect(
      screen.getByText(t('cards.customize-cards.nodes.title')),
    ).toBeInTheDocument();

    expect(
      screen.getByText(t('cards.customize-cards.content.title')),
    ).toBeInTheDocument();
  });

  // TODO: Skipped due to testing against implementation details. to be moved to Highlight itself
  it.skip('should select highlight attribute', async () => {
    renderWithWrapper(<TestControlBar />);

    userEvent.click(screen.getByText(t('highlight.label')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    userEvent.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(screen.getByRole('option')).toBeInTheDocument();
    });
    userEvent.click(screen.getAllByRole('option')[0], undefined, {
      skipPointerEventsCheck: true,
    });

    await screen.findByRole('button', {
      name: `${t('highlight.by')} Gender`,
    });
  });

  // TODO: Skipped due to testing against implementation details. to be moved to Highlight itself
  it.skip('should clear selected highlight attribute', async () => {
    const mockSetHighlighted = jest.fn();
    renderWithWrapper(<TestControlBar />);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', {
          name: 'Clear', // Not translated in the DS component
        }),
      ).toBeInTheDocument();
    });

    userEvent.click(
      screen.getByRole('button', {
        name: 'Clear',
      }),
    );

    expect(mockSetHighlighted).toHaveBeenCalledWith('');
  });

  it('renders ControlBar and interacts with Filter menu', async () => {
    await renderWithWrapper(<TestControlBar />);

    const menu = screen.getByText(tDS('trigger.filter'));
    userEvent.click(menu);

    const filterColumnConfig = getFilterColumnConfig(
      tAttributes as unknown as TFunction<'models', 'employee'>,
    );
    await screen.findByText(filterColumnConfig?.[0]?.header || '');
    filterColumnConfig.forEach((column) => {
      expect(screen.getByText(column.header || '')).toBeInTheDocument();
    });
  });

  it('renders ControlBar filters with limited attribute options', async () => {
    server.use(
      getEmployeeListColumnsHandlers.getEmployeeListColumns200Handler__limitedAccess,
    );
    renderWithWrapper(<TestControlBar />);

    await screen.findByText(tDS('trigger.filter'));
    const menu = screen.getByText(tDS('trigger.filter'));
    userEvent.click(menu);

    await screen.findByTestId('control-bar-filter-popover-content');
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });
});
