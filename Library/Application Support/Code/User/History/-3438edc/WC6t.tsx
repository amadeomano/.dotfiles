import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { toaster } from 'designSystem/component/toaster';
import { OptionLabel } from 'designSystem/component/picker';
import * as gofer from '@personio-web/employees-organizations-gofer';

import {
  getTranslation,
  renderWithWrapper,
} from '../../../../test-setup/testHelpers';
import { MockOrgChartPreferencesContext } from '../../../../test-setup/mocks/MockOrgChartPreferencesContext';
import { MockOrgChartDataSourceContext } from '../../../../test-setup/mocks/MockOrgChartDataSourceContext';
import { TreeLayoutProvider } from '../../../TreeLayout';
import * as hooks from '../../../hooks';
import * as orgUnitSearchHooks from './utils/useGetOrgUnitSearchResults';
import * as orgUnitByEmployeeIdHooks from './utils/useGetOrgUnitByEmployeeId';
import { OrgUnitSearch } from './OrgUnitSearch';

jest.mock('designSystem/component/toaster');

const useOrgUnitCardData = jest.spyOn(gofer, 'useOrgUnitCardData');
const useGetSearchResults = jest.spyOn(
  orgUnitSearchHooks,
  'useGetOrgUnitSearchResults',
);
const useGetOrgUnitByEmployeeId = jest.spyOn(
  orgUnitByEmployeeIdHooks,
  'useGetOrgUnitByEmployeeId',
);
const useViewportActions = jest.spyOn(hooks, 'useViewportActions');
const openDialog = jest.fn();
jest.mock(
  '@personio-web/employees-organizations-hook-use-dialog-context',
  () => ({ useDialogContext: () => ({ openDialog }) }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { t } = getTranslation('employees-organizations', {
  keyPrefix: 'org-chart.control-bar',
});
const { t: tError } = getTranslation('employees-organizations', {
  keyPrefix: 'org-chart.errors',
});

// TODO: get from translation
const PLACEHOLDER = 'Search Team';

type DataSourceCtx = Parameters<typeof MockOrgChartDataSourceContext>[0];
type PreferencesCtx = Parameters<typeof MockOrgChartPreferencesContext>[0];
const TestSearch = (args: {
  prefs?: PreferencesCtx;
  dataSource?: DataSourceCtx;
}) => {
  return (
    <TreeLayoutProvider>
      <MockOrgChartPreferencesContext {...args.prefs}>
        <MockOrgChartDataSourceContext {...args.dataSource}>
          <OrgUnitSearch />
        </MockOrgChartDataSourceContext>
      </MockOrgChartPreferencesContext>
    </TreeLayoutProvider>
  );
};

describe('OrgUnitSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOrgUnitCardData.mockReturnValue({
      isFetched: false,
      data: undefined,
    } as never);
  });

  describe('initial render', () => {
    it('should render the search component with the right placeholder', () => {
      renderWithWrapper(<TestSearch />);

      userEvent.click(screen.getByRole('button', { name: 'Search' }));
      expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
    });
  });

  it('should manage the state of search input', () => {
    renderWithWrapper(<TestSearch />);

    userEvent.click(screen.getByRole('button', { name: 'Search' }));
    const input = screen.getByPlaceholderText(PLACEHOLDER);
    userEvent.type(input, 'test search');

    expect((input as HTMLInputElement).value).toBe('test search');
  });

  describe('when selecting an org unit search result', () => {
    it('should indicate its focus and zoom to it', () => {
      const getDispHierarchyNode = jest.fn(() => ({
        id: '1',
        ancestors: [{ id: '1' }],
      }));
      const setActiveCardId = jest.fn();
      const findAndFocusOnNodeBranch = jest.fn();
      // @ts-expect-error enough for the test
      useViewportActions.mockReturnValue({ findAndFocusOnNodeBranch });

      useGetSearchResults.mockReturnValue({
        isLoading: false,
        searchResults: [
          {
            value: `${orgUnitSearchHooks.ORG_UNIT_PREFIX}1`,
            label: <OptionLabel.Token label="Team 1" />,
          },
        ],
      });

      renderWithWrapper(
        <TestSearch
          prefs={{ setActiveCardId }}
          dataSource={{
            // @ts-expect-error enough for the test
            displayableHierarchy: { getNode: getDispHierarchyNode },
          }}
        />,
      );

      const searchResult = screen.getByText('Team 1');
      expect(searchResult).toBeInTheDocument();
      userEvent.click(searchResult);

      expect(getDispHierarchyNode).toHaveBeenCalledWith('1');
      expect(setActiveCardId).toHaveBeenCalledWith('1', ['1']);
      expect(findAndFocusOnNodeBranch).toHaveBeenCalledWith('1');
    });

    it('should open details drawer when org unit is selected and card data is fetched', () => {
      const getDispHierarchyNode = jest.fn(() => ({
        id: '1',
        ancestors: [{ id: '1' }],
      }));
      const setActiveCardId = jest.fn();
      const findAndFocusOnNodeBranch = jest.fn();
      // @ts-expect-error enough for the test
      useViewportActions.mockReturnValue({ findAndFocusOnNodeBranch });

      useOrgUnitCardData.mockReturnValue({
        isFetched: true,
        data: {
          type: 'ORG_UNIT_TYPE_DEPARTMENT',
          departmentId: {
            __typename: 'protocore_hrdepartmentid_DepartmentId_v1',
            id: '123',
          },
        },
      });

      useGetSearchResults.mockReturnValue({
        isLoading: false,
        searchResults: [
          {
            value: `${orgUnitSearchHooks.ORG_UNIT_PREFIX}1`,
            label: <OptionLabel.Token label="Department 1" />,
          },
        ],
      });

      renderWithWrapper(
        <TestSearch
          prefs={{ setActiveCardId }}
          dataSource={{
            // @ts-expect-error enough for the test
            displayableHierarchy: { getNode: getDispHierarchyNode },
          }}
        />,
      );

      const searchResult = screen.getByText('Department 1');
      expect(searchResult).toBeInTheDocument();
      userEvent.click(searchResult);

      expect(openDialog).toHaveBeenCalledWith('org-units.details.drawer', {
        orgUnitId: 123,
        orgUnitType: 'department',
      });
    });

    it('should display a confirmation dialog to remove filters', () => {
      const getDispHierarchyNode = jest.fn(() => false);

      useGetSearchResults.mockReturnValue({
        isLoading: false,
        searchResults: [
          {
            value: `${orgUnitSearchHooks.ORG_UNIT_PREFIX}1`,
            label: <OptionLabel.Token label="Team 1" />,
          },
        ],
      });

      renderWithWrapper(
        <TestSearch
          dataSource={{
            // @ts-expect-error enough for the test
            displayableHierarchy: { getNode: getDispHierarchyNode },
            isFiltering: true,
          }}
        />,
      );

      const searchResult = screen.getByText('Team 1');
      expect(searchResult).toBeInTheDocument();
      userEvent.click(searchResult);

      expect(getDispHierarchyNode).toHaveBeenCalledWith('1');
      expect(openDialog).toHaveBeenCalledWith('org-chart.remove-filters', {
        employeeId: '1',
      });
    });

    it('should display an error if the org unit is not found', () => {
      const getDispHierarchyNode = jest.fn(() => undefined);

      useGetSearchResults.mockReturnValue({
        isLoading: false,
        searchResults: [
          {
            value: `${orgUnitSearchHooks.ORG_UNIT_PREFIX}1`,
            label: <OptionLabel.Token label="Team 1" />,
          },
        ],
      });

      renderWithWrapper(
        <TestSearch
          dataSource={{
            // @ts-expect-error enough for the test
            displayableHierarchy: { getNode: getDispHierarchyNode },
            isFiltering: false,
          }}
        />,
      );

      const searchResult = screen.getByText('Team 1');
      expect(searchResult).toBeInTheDocument();
      userEvent.click(searchResult);

      expect(getDispHierarchyNode).toHaveBeenCalledWith('1');
      expect(toaster.notify).toHaveBeenCalledWith({
        variant: 'error',
        title: tError('focus.title'),
        description: tError('focus.description'),
        showCloseButton: true,
      });
    });
  });

  describe('when selecting a person search result', () => {
    it('should focus and zoom to the persons org unit', () => {
      const setActiveCardId = jest.fn();
      const findAndFocusOnNodeBranch = jest.fn();
      // @ts-expect-error enough for the test
      useViewportActions.mockReturnValue({ findAndFocusOnNodeBranch });

      // @ts-expect-error enough for the test
      useGetOrgUnitByEmployeeId.mockImplementation((empId) => ({
        isFetched: !!empId,
        isLoading: false,
        node: { id: '1', ancestors: [{ id: '1' }] },
      }));
      useGetSearchResults.mockReturnValue({
        isLoading: false,
        searchResults: [
          {
            value: '1',
            label: <OptionLabel.Token label="John Doe" />,
          },
        ],
      });

      renderWithWrapper(<TestSearch prefs={{ setActiveCardId }} />);
      expect(useGetOrgUnitByEmployeeId).toHaveBeenCalledWith(null);

      const searchResult = screen.getByText('John Doe');
      expect(searchResult).toBeInTheDocument();
      userEvent.click(searchResult);

      expect(useGetOrgUnitByEmployeeId).toHaveBeenCalledWith('1');
      expect(setActiveCardId).toHaveBeenCalledWith('1', ['1']);
      expect(findAndFocusOnNodeBranch).toHaveBeenCalledWith('1');
    });

    it('should open details drawer when employee is selected and card data is fetched', () => {
      const setActiveCardId = jest.fn();
      const findAndFocusOnNodeBranch = jest.fn();
      // @ts-expect-error enough for the test
      useViewportActions.mockReturnValue({ findAndFocusOnNodeBranch });

      // @ts-expect-error enough for the test
      useGetOrgUnitByEmployeeId.mockImplementation((empId) => ({
        isFetched: !!empId,
        isLoading: false,
        node: { id: '42', ancestors: [{ id: '1' }] },
      }));

      useOrgUnitCardData.mockReturnValue({
        isFetched: true,
        data: {
          type: 'ORG_UNIT_TYPE_TEAM',
          teamId: {
            __typename: 'protocore_hrteamid_TeamId_v1',
            id: '456',
          },
        },
      });

      useGetSearchResults.mockReturnValue({
        isLoading: false,
        searchResults: [
          {
            value: '1',
            label: <OptionLabel.Token label="John Doe" />,
          },
        ],
      });

      renderWithWrapper(<TestSearch prefs={{ setActiveCardId }} />);

      const searchResult = screen.getByText('John Doe');
      expect(searchResult).toBeInTheDocument();
      userEvent.click(searchResult);

      expect(useGetOrgUnitByEmployeeId).toHaveBeenCalledWith('1');
      expect(setActiveCardId).toHaveBeenCalledWith('42', ['1']);
      expect(findAndFocusOnNodeBranch).toHaveBeenCalledWith('42');
      expect(openDialog).toHaveBeenCalledWith('org-units.details.drawer', {
        orgUnitId: 456,
        orgUnitType: 'team',
      });
    });

    it('should show an error if the persons org unit is not found', () => {
      const setActiveCardId = jest.fn();
      const findAndFocusOnNodeBranch = jest.fn();
      // @ts-expect-error enough for the test
      useViewportActions.mockReturnValue({ findAndFocusOnNodeBranch });

      useGetOrgUnitByEmployeeId.mockImplementation((empId) => ({
        isFetched: !!empId,
        isLoading: false,
        node: undefined,
      }));
      useGetSearchResults.mockReturnValue({
        isLoading: false,
        searchResults: [
          {
            value: '1',
            label: <OptionLabel.Token label="John Doe" />,
          },
        ],
      });

      renderWithWrapper(<TestSearch prefs={{ setActiveCardId }} />);
      expect(useGetOrgUnitByEmployeeId).toHaveBeenCalledWith(null);

      const searchResult = screen.getByText('John Doe');
      expect(searchResult).toBeInTheDocument();
      userEvent.click(searchResult);

      expect(useGetOrgUnitByEmployeeId).toHaveBeenCalledWith('1');
      expect(toaster.notify).toHaveBeenCalledWith({
        variant: 'error',
        title: tError('focus.title'),
        description: tError('focus.description'),
        showCloseButton: true,
      });
    });
  });
});
