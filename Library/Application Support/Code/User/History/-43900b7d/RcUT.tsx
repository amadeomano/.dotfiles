import { type PropsWithChildren } from 'react';

import { screen, waitFor } from '@testing-library/react';

import { type TestWrapperProps } from '@personio-web/orchestrator-common/test-utils';

import {
  mockOrgChartPreferencesProps,
  renderWithWrapper,
} from '../../../test-setup/testHelpers';
import { MockOrgChartPreferencesContext } from '../../../test-setup/mocks/MockOrgChartPreferencesContext';
import { FeatureFlags } from '../../constants';
import {
  OrgChartUIContextProvider,
  OrgChartDataSourceContextProvider,
} from '../../contexts';
import { LayoutProvider } from '../../layout';
import { PersonCardDataLoaderProvider } from '../../layout/person/loaders';
import { TestIds } from '../../utils';
import {
  SpanOfControl,
  type SpanOfControlComponentProps,
} from './SpanOfControl';

jest.mock('../../TreeLayout', () => ({
  ...jest.requireActual('../../TreeLayout'),
  useTreeLayout: jest.fn(() => ({
    getNodes: jest.fn().mockReturnValue([]),
    viewportInitialized: true,
  })),
}));

const mockPerson = {
  __typename: 'personandemployment_Person_v1' as const,
  id: 'person-id',
  profilePicUrls: null,
  preferredName: null,
};

const ellipsisButtonAriaLabel = 'More options';

const getContextWrapper =
  () =>
  ({ children }: PropsWithChildren) =>
    (
      <LayoutProvider>
        <OrgChartUIContextProvider>
          <MockOrgChartPreferencesContext {...mockOrgChartPreferencesProps}>
            <PersonCardDataLoaderProvider attributeIds={[]}>
              <OrgChartDataSourceContextProvider>
                {children}
              </OrgChartDataSourceContextProvider>
            </PersonCardDataLoaderProvider>
          </MockOrgChartPreferencesContext>
        </OrgChartUIContextProvider>
      </LayoutProvider>
    );

const renderComponent = ({
  nodeId = mockPerson.id,
  isActive = true,
  reports = { people: { direct: 0, total: 0 } },
  features = {},
  ...props
}: Partial<SpanOfControlComponentProps> & {
  features?: TestWrapperProps['features'];
}) =>
  renderWithWrapper(
    <SpanOfControl
      reports={reports}
      isActive={isActive}
      nodeId={nodeId}
      {...props}
    />,
    {
      innerWrapper: getContextWrapper(),
      features,
    },
  );

describe('SpanOfControl', () => {
  it('should render people report item', () => {
    renderComponent({ reports: { people: { direct: 5, total: 10 } } });

    expect(screen.getByText('5 (10)')).toBeInTheDocument();
  });

  it('should render positions report item', () => {
    renderComponent({
      reports: {
        positions: { direct: 3, total: 3 },
        people: { direct: 0, total: 0 },
      },
    });

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render only positions icon when it is not active', async () => {
    renderComponent({
      reports: {
        positions: { direct: 3, total: 3 },
        people: { direct: 0, total: 0 },
      },
      isActive: false,
    });

    await waitFor(() => {
      expect(screen.getByTestId('positions-icon')).toBeInTheDocument();
      expect(screen.queryByText('3')).not.toBeInTheDocument();
    });
  });

  it('should render positions icon and count when it not active', async () => {
    renderComponent({
      reports: {
        positions: { direct: 3, total: 3 },
        people: { direct: 0, total: 0 },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('positions-icon')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should render additionals icon when there are additional reports', async () => {
    renderComponent({
      reports: {
        additionals: [
          {
            name: 'shift manager',
            countSupervisors: 1,
            countReports: 2,
          },
        ],
        people: { direct: 0, total: 0 },
      },
    });

    await screen.findByTestId('additionals-icon');
  });

  it('should render CardMenu when isActive is true', async () => {
    renderComponent({
      reports: {
        people: { direct: 0, total: 0 },
        additionals: [
          {
            name: 'shift manager',
            countSupervisors: 1,
            countReports: 2,
          },
        ],
      },
      isActive: true,
    });

    await screen.findByRole('button', { name: ellipsisButtonAriaLabel });
  });

  it('should not render CardMenu when isActive is false', () => {
    renderComponent({
      reports: { people: { direct: 0, total: 0 } },
      isActive: false,
    });

    expect(
      screen.queryByRole('button', { name: ellipsisButtonAriaLabel }),
    ).not.toBeInTheDocument();
  });

  it('should render 99+ when reports people total is greater than 99', async () => {
    renderComponent({
      reports: { people: { direct: 100, total: 300 } },
      isActive: true,
    });

    await screen.findByText(/99\+/);
  });

  it('should render span of control with a smaller gap when position total has 2 digits and people total 3 digits', async () => {
    renderComponent({
      reports: {
        positions: { direct: 3, total: 100 },
        people: { direct: 100, total: 300 },
      },
      isActive: true,
    });

    await screen.findByTestId(TestIds.SpanOfControl);
    expect(screen.getByTestId(TestIds.SpanOfControl)).toHaveClass('gap-small');
  });

  it('should render span of control with rounded corners when redesign FF is enabled', async () => {
    renderComponent({
      reports: {
        positions: { direct: 3, total: 100 },
        people: { direct: 100, total: 300 },
      },
      isActive: true,
      features: {
        [FeatureFlags.ENABLE_REDESIGN_ORG_CHART_CARD]: 'on',
      },
    });

    await screen.findByRole('button', { name: ellipsisButtonAriaLabel });

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: ellipsisButtonAriaLabel }),
      ).toHaveClass('redesignEllipsis'),
    );
  });
});
