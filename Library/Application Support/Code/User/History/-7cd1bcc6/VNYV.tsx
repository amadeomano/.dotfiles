import { type ReactElement } from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getEmploymentBaseDataHandlers } from '@personio-web/employees-organizations-data-gofer/mocking';
import {
  getEmployeeListColumnsHandlers,
  getEmployeeListFiltersHandlers,
  getEmployeeListMetadataHandlers,
} from '@personio-web/employees-organizations-data-people-list/mocking';
import { type UseHierarchicalDataReturnType } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { PersonSystemAttribute } from '@personio-web/employees-organizations-util-people';
import { server } from '@personio-web/mocks/server';
import { OptionLabel } from 'designSystem/component/picker';

import type { TFunction } from 'i18next';

import {
  getTranslation,
  renderWithWrapper as renderWithWrapperBase,
} from '../../test-setup/testHelpers';
import { personFilterableAttribute } from '../constants';
import * as Amp from '../constants/amplitude';
import { useOrgChartPreferences } from '../hooks';
import { type EntityNode, FilterCondition, View } from '../types';
import { exportOptions } from './consts/exportConfig';
import { getFilterColumnConfig } from './consts/filterConfig';
import { viewLabelsMap } from './consts/viewsConfig';
import { ControlBar } from './ControlBar';
import { type ControlBarProps } from './types';

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

const TestControlBar = (otherProps?: Partial<ControlBarProps>) => {
  const props = useOrgChartPreferences();
  const localProps = {
    hierarchy: {
      getNode: jest.fn(),
      nodes: [],
      rootNodes: [],
    } as UseHierarchicalDataReturnType<EntityNode, undefined>,
  };

  return (
    <ControlBar
      {...props}
      {...localProps}
      {...otherProps}
      setIsExporting={otherProps?.setIsExporting ?? jest.fn()}
    />
  );
};

const renderWithWrapper = (component: ReactElement) => {
  return act(() => renderWithWrapperBase(component));
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
    server.use(getEmployeeListMetadataHandlers.defaultHandler);
  });

  it('renders ControlBar with all menus', async () => {
    await renderWithWrapper(<TestControlBar />);

    expect(screen.getByText(t('views.label'))).toBeInTheDocument();
    expect(screen.getByText(t('cards.customize-label'))).toBeInTheDocument();
    expect(screen.getByText(t('highlight.label'))).toBeInTheDocument();
    expect(screen.getByText(tDS('trigger.filter'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('search.placeholder'))).toBeInTheDocument();
    expect(screen.getByLabelText(tDS('trigger.share'))).toBeInTheDocument();
  });

  describe('Views menu', () => {
    it('renders ControlBar and interacts with Views menu', async () => {
      await renderWithWrapper(<TestControlBar />);

      const menu = screen.getByText(t('views.label'));
      userEvent.click(menu);

      expect(screen.getByText(t('views.default.title'))).toBeInTheDocument();
      expect(screen.getByText(t('views.advanced.title'))).toBeInTheDocument();
    });

    it('should list all user-dependent views', async () => {
      server.use(getEmploymentBaseDataHandlers.defaultHandler);

      await renderWithWrapper(<TestControlBar />);

      userEvent.click(screen.getByRole('button', { name: t('views.label') }));

      await waitFor(() => {
        expect(
          screen.getByRole('menuitem', {
            name: t(viewLabelsMap[View.MyDepartment]),
          }),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('menuitem', { name: t(viewLabelsMap[View.MyTeam]) }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: t(viewLabelsMap[View.MyOffice]) }),
      ).toBeInTheDocument();
    });

    it('should not list views which the user has no assignment', async () => {
      server.use(getEmploymentBaseDataHandlers.partialHandler);

      await renderWithWrapper(<TestControlBar />);

      userEvent.click(screen.getByRole('button', { name: t('views.label') }));

      await waitFor(() => {
        expect(
          screen.getByRole('menuitem', {
            name: t(viewLabelsMap[View.MyDepartment]),
          }),
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('menuitem', { name: t(viewLabelsMap[View.MyTeam]) }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', {
          name: t(viewLabelsMap[View.MyOffice]),
        }),
      ).not.toBeInTheDocument();
    });

    it('selecting a view should update view and filter state', async () => {
      const mockSetView = jest.fn();
      const mockSetFilters = jest.fn();
      await renderWithWrapper(
        <TestControlBar setView={mockSetView} setFilters={mockSetFilters} />,
      );

      userEvent.click(screen.getByRole('button', { name: t('views.label') }));
      userEvent.click(
        screen.getByRole('menuitem', {
          name: t(viewLabelsMap[View.InternalOnly]),
        }),
      );

      expect(mockSetView).toHaveBeenCalledWith(View.InternalOnly);
      expect(mockSetFilters).toHaveBeenCalledWith([
        {
          id: PersonSystemAttribute.EmploymentType,
          value: {
            value: ['internal'],
            condition: FilterCondition.Contains,
          },
        },
      ]);
    });

    it('updating the filter conditions should clear the view state', async () => {
      server.use(getEmployeeListFiltersHandlers.defaultHandler);
      const mockFilters = [
        {
          id: PersonSystemAttribute.Position,
          value: {
            value: ['21080'],
            condition: FilterCondition.Contains,
          },
        },
      ];
      const mockSetView = jest.fn();
      const mockSetFilters = jest.fn();
      await renderWithWrapper(
        <TestControlBar
          view={View.MyDepartment}
          filters={mockFilters}
          setView={mockSetView}
          setFilters={mockSetFilters}
        />,
      );

      await waitFor(() =>
        expect(
          screen.getByRole('button', {
            name: `${tDS('trigger.filtered-by')} ${tAttributes(
              personFilterableAttribute.Position,
            )}`,
          }),
        ).toBeInTheDocument(),
      );

      userEvent.click(
        screen.getByRole('button', {
          name: `${tDS('trigger.filtered-by')} ${tAttributes(
            personFilterableAttribute.Position,
          )}`,
        }),
      );
      userEvent.click(
        screen.getByRole('combobox', {
          name: tDS('filter-menu.select-placeholder'),
        }),
      );
      await waitFor(() => {
        expect(screen.getAllByRole('option')).toBeTruthy();
      });
      userEvent.click(screen.getAllByRole('option')[0], undefined, {
        skipPointerEventsCheck: true,
      });

      expect(mockSetView).toHaveBeenCalledWith(null);
      expect(mockSetFilters).toHaveBeenCalledWith([
        {
          id: PersonSystemAttribute.Position,
          value: {
            value: ['21080', '21085'],
            condition: FilterCondition.Contains,
          },
        },
      ]);
    });
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

  it('should select highlight attribute', async () => {
    renderWithWrapper(<TestControlBar />);

    userEvent.click(screen.getByText(t('highlight.label')));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toBeTruthy();
    });
    userEvent.click(screen.getAllByRole('option')[0], undefined, {
      skipPointerEventsCheck: true,
    });

    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: `${t('highlight.by')} Gender`,
        }),
      ).toBeInTheDocument(),
    );
  });

  it('should clear selected highlight attribute', async () => {
    const mockSetHighlighted = jest.fn();
    renderWithWrapper(
      <TestControlBar
        highlighted={PersonSystemAttribute.Gender}
        setHighlighted={mockSetHighlighted}
      />,
    );

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
    await waitFor(() =>
      expect(
        screen.getByText(filterColumnConfig?.[0]?.header || ''),
      ).toBeInTheDocument(),
    );
    filterColumnConfig.forEach((column) => {
      expect(screen.getByText(column.header || '')).toBeInTheDocument();
    });
  });

  it('renders ControlBar filters with limited attribute options', async () => {
    server.use(
      getEmployeeListColumnsHandlers.getEmployeeListColumns200Handler__limitedAccess,
    );
    renderWithWrapper(<TestControlBar />);

    await waitFor(() =>
      expect(screen.getByText(tDS('trigger.filter'))).toBeInTheDocument(),
    );
    const menu = screen.getByText(tDS('trigger.filter'));
    userEvent.click(menu);

    await waitFor(() =>
      expect(
        screen.getByTestId('control-bar-filter-popover-content'),
      ).toBeInTheDocument(),
    );
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('renders ControlBar and interacts with Search control', async () => {
    await renderWithWrapper(<TestControlBar />);

    const menu = screen.getByLabelText(t('search.placeholder'));
    userEvent.click(menu);

    const searchInput = screen.getByPlaceholderText<HTMLInputElement>(
      t('search.label'),
    );
    userEvent.type(searchInput, 'test search');

    expect(searchInput.value).toBe('test search');
  });

  it('renders ControlBar and interacts with search results', async () => {
    const onSearchResultSelect = jest.fn();

    await renderWithWrapper(
      <TestControlBar
        searchTerm="em"
        searchResults={[
          {
            value: '1',
            label: (
              <OptionLabel.Token
                label="Emma Weber"
                avatar={{
                  name: 'Emma Weber',
                }}
              />
            ),
          },
        ]}
        onSearchResultSelect={onSearchResultSelect}
      />,
    );

    const searchInput = screen.getByPlaceholderText<HTMLInputElement>(
      t('search.label'),
    );
    expect(searchInput.value).toBe('em');

    searchInput.focus();
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const searchResult = screen.getByText('Emma Weber');
    expect(searchResult).toBeInTheDocument();

    userEvent.click(searchResult);
    expect(onSearchResultSelect).toHaveBeenCalledWith('1');
  });

  describe('Share menu', () => {
    it('renders ControlBar and checks "Copy URL" in Share menu', async () => {
      await renderWithWrapper(<TestControlBar />);

      const menu = screen.getByLabelText(tDS('trigger.share'));
      userEvent.click(menu);

      const copyUrlItem = screen.getByText(t('share.copy-url'));
      expect(copyUrlItem).toBeInTheDocument();

      userEvent.click(copyUrlItem);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('renders ControlBar and checks "Export" in Share menu', async () => {
      await renderWithWrapper(<TestControlBar />);

      const menu = screen.getByLabelText(tDS('trigger.share'));
      userEvent.click(menu);

      const exportMenu = screen.getByText(t('share.export'));
      expect(exportMenu).toBeInTheDocument();

      userEvent.click(exportMenu);

      exportOptions.forEach((format) => {
        expect(screen.getByText(format)).toBeInTheDocument();
      });
    });

    test.each(exportOptions)(
      'interacts with "Export" submenu in Share menu',
      async (format) => {
        const setIsExporting = jest.fn();
        await renderWithWrapper(
          <TestControlBar setIsExporting={setIsExporting} />,
        );

        userEvent.click(screen.getByLabelText(tDS('trigger.share')));

        const exportMenu = screen.getByText(t('share.export'));
        expect(exportMenu).toBeInTheDocument();

        userEvent.click(exportMenu);

        act(() => userEvent.click(screen.getByText(format)));

        expect(setIsExporting).toHaveBeenCalledWith(true);
        expect(mockExportNode).toHaveBeenCalledWith({
          format,
          nodes: [],
          onFinish: expect.toBeFunction(),
          t: tErrors,
        });

        expect(mockTrackAmplitudeEvent).toHaveBeenCalledWith(Amp.EXPORTED, {
          format,
        });
      },
    );
  });

  it('should not render Export menu on ControlBar Share menu', async () => {
    server.use(
      getEmployeeListMetadataHandlers.getEmployeeListMetadata200Handler__metadataResponseWithNoAccessAccessRights,
    );

    await renderWithWrapper(<TestControlBar />);

    const menu = screen.getByLabelText(tDS('trigger.share'));
    userEvent.click(menu);

    expect(screen.queryByText(t('share.export'))).not.toBeInTheDocument();
  });
});
