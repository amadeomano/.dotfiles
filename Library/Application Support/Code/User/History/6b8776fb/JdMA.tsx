// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAmplitude } from '@personio-web/amplitude-provider';
import { getEmployeeHeaderHandlers } from '@personio-web/employees-organizations-data-employee-header/mocking';
import { getCompactEmploymentsHandlers } from '@personio-web/employees-organizations-data-compact-employments/mocking';
import { getSectionsWithAttributesHandlers } from '@personio-web/employees-organizations-data-attributes/mocking';
import {
  getEmployeeHeaderData200EmployeeHeaderExample,
  getEmployeeHeaderData200EmployeeHeaderInactive,
} from '@personio-web/employees-organizations-mocks-employee-header';
import { DialogsProvider } from '@personio-web/employees-organizations-util-dialogs';
import { renderWithWrapper } from '@personio-web/orchestrator-common/test-utils';
import { server } from '@personio-web/mocks/server';
import type { AxiosError } from '@personio-web/request';

import { getPersonioTranslation as getTranslation } from '@personio-web/config-jest/helpers';

import type SplitIO from '@splitsoftware/splitio/types/splitio';
import { getPersonioTranslation } from '@personio-web/config-jest/helpers';
import { type GetSectionsWithAttributesErrorResponse } from '@personio-web/employees-organizations-data-attributes-types';
import { generateOrgChartLink } from '@personio-web/eo-commons-org-chart-link';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AMPLITUDE_EVENT_NAVIGATED_TO_ANOTHER_CONTRACT,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AMPLITUDE_EVENT_OPENED_CONTRACT_DROPDOWN,
  AMPLITUDE_EVENT_STARTED_REHIRING,
  FF_CREATE_EMPLOYMENT_CONTRACT,
  FF_REHIRE,
  PIT_OVERHAUL_FF,
} from '../constants';
import { EmployeeLayout } from '../';
import * as sectionsWithAttributes from '../hooks/useGetSectionsWithAttributesError';

const push = jest.fn();
const { t: tDesignSystem } = getPersonioTranslation('design-system');
const { t: tTerminateEmploymentDialog } = getTranslation(
  'terminate-employment-dialog',
);

const content = 'Employee Layout Content';
const activeEmployeeId = getEmployeeHeaderData200EmployeeHeaderExample.data?.id;
const employeeId = getEmployeeHeaderData200EmployeeHeaderInactive.data?.id;

const oldWindowLocation = window.location;

const { t: tEO } = getTranslation('employees-organizations');

jest.mock('next/router', () => ({
  useRouter: () => ({
    push,
    query: {
      employeeId,
    },
    pathname: `https://pet-common.personio.de/staff/details/${employeeId}`,
    route: `/staff/details/{employeeId}`,
  }),
}));
jest.mock('@personio-web/amplitude-provider', () => ({
  useAmplitude: jest.fn(),
}));

const mockErrorResponseSectionsWithAttributes = {
  isAxiosError: true,
  toJSON: () => ({}),
  name: 'AxiosError',
  message: 'Request failed with status code 404',
  response: {
    status: 404,
    statusText: 'Not Found',
    config: {
      headers: {
        'content-type': 'application/json',
      },
    },
    data: {
      error: {
        code: '404',
        message: 'Employee not found',
      },
    },
  },
} as unknown as AxiosError<GetSectionsWithAttributesErrorResponse>;

function mockLocation() {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {},
  });

  const overriddenLocation = Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(oldWindowLocation),
      assign: {
        configurable: true,
        value: jest.fn(),
      },
    },
  );

  Object.defineProperty(window, 'location', {
    configurable: true,
    value: overriddenLocation,
  });
}

function resetLocation() {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: oldWindowLocation,
  });
}

const renderEmployeeLayout = (features?: SplitIO.MockedFeaturesMap) => {
  renderWithWrapper(
    <DialogsProvider>
      <EmployeeLayout>{content}</EmployeeLayout>
    </DialogsProvider>,
    {
      features: {
        ...{
          [FF_REHIRE]: 'on',
          [FF_CREATE_EMPLOYMENT_CONTRACT]: 'on',
        },
        ...features,
      },
    },
  );
};

const openDropdownMenu = async () => {
  const moreButton = await screen.findByLabelText(
    tDesignSystem('page.navigation-bar.more-options-aria-label'),
  );
  expect(moreButton).toBeInTheDocument();
  userEvent.click(moreButton);
};

describe('EmployeeLayout', () => {
  const { t } = getTranslation('employee-header');
  const mockTrack = jest.fn();

  beforeEach(() => {
    (useAmplitude as jest.Mock).mockReturnValue({ track: mockTrack });
    server.use(
      getEmployeeHeaderHandlers.getEmployeeHeader200Handler__employeeHeaderInactive,
    );
    server.use(getCompactEmploymentsHandlers.defaultHandler);
    mockLocation();
  });

  afterEach(() => {
    resetLocation();
  });

  it('should render content', async () => {
    renderEmployeeLayout();

    await screen.findByText(content);

    // Tabs
    expect(screen.getByText('Personal info')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Absence')).toBeInTheDocument();
    expect(screen.getByText('Onboarding')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Reminders')).toBeInTheDocument();
  });

  it('should render actions', async () => {
    renderEmployeeLayout();

    await screen.findByText(content);

    // Buttons
    expect(screen.getByLabelText('View in org chart')).toBeInTheDocument();
    expect(screen.getByLabelText('Login as this employee')).toBeInTheDocument();

    // Dropdown menu
    const moreButton = screen.getByLabelText(
      tDesignSystem('page.navigation-bar.more-options-aria-label'),
    );
    expect(moreButton).toBeInTheDocument();
    userEvent.click(moreButton);

    // Dropdown menu items
    expect(screen.getByText('Rehire this person')).toBeInTheDocument();
    expect(screen.getByText('Manage account')).toBeInTheDocument();
    expect(screen.getByText('Set a reminder')).toBeInTheDocument();
    expect(screen.getByText('Schedule leave')).toBeInTheDocument();
    expect(screen.getByText('Terminate employment')).toBeInTheDocument();
    expect(screen.getByText('Delete profile')).toBeInTheDocument();
  });

  it('should navigate to org chart', async () => {
    renderEmployeeLayout();

    const orgChartButton = await screen.findByLabelText('View in org chart');

    userEvent.click(orgChartButton);

    const link = generateOrgChartLink({
      source: 'Supervisor',
      activeCardId: employeeId?.toString(),
      filters: [],
    });
    expect(push).toHaveBeenNthCalledWith(1, link);
  });

  it('should rehire', async () => {
    renderEmployeeLayout();

    await openDropdownMenu();

    userEvent.click(screen.getByText('Rehire this person'));

    expect(mockTrack).toHaveBeenCalledWith(AMPLITUDE_EVENT_STARTED_REHIRING, {
      past_rehired_employee_id: Number(activeEmployeeId),
    });
    expect(push).toHaveBeenNthCalledWith(1, `/staff/rehire/${employeeId}`);
  });

  it('should render info when can rehire but no termination data or permission', async () => {
    server.use(
      getEmployeeHeaderHandlers.getEmployeeHeader200Handler__employeeHeaderAccessRights,
    );

    renderEmployeeLayout();

    await openDropdownMenu();

    userEvent.click(screen.getByText('Rehire this person'));

    // You don't have Permission to terminate
    await expect(
      screen.findByRole('heading', {
        name: 'You don’t have the necessary permissions',
      }),
    ).resolves.toBeInTheDocument();
  });

  it('should navigate to manage account page', async () => {
    renderEmployeeLayout();

    await openDropdownMenu();

    userEvent.click(screen.getByText('Manage account'));

    expect(push).toHaveBeenNthCalledWith(1, `/staff/account/${employeeId}`);
  });

  it('should set a reminder', async () => {
    renderEmployeeLayout();

    await openDropdownMenu();

    userEvent.click(screen.getByText('Set a reminder'));

    expect(push).toHaveBeenNthCalledWith(
      1,
      `/reminders/employee/${employeeId}`,
    );
  });

  it('should schedule leave', async () => {
    renderEmployeeLayout();

    await openDropdownMenu();

    const text = 'Schedule leave';

    userEvent.click(screen.getByText(text));

    await expect(
      screen.findByRole('heading', { name: t('schedule-leave-period') }),
    ).resolves.toBeInTheDocument();
  });

  it('should navigate to impersonation', async () => {
    renderEmployeeLayout();

    const impersonateBtn = await screen.findByLabelText(
      'Login as this employee',
    );

    userEvent.click(impersonateBtn);

    expect(window.location.assign).toHaveBeenNthCalledWith(
      1,
      `/account/login-as-employee/${employeeId}`,
    );
  });

  it('should terminate employment', async () => {
    renderEmployeeLayout();

    await openDropdownMenu();

    userEvent.click(screen.getByText('Terminate employment'));

    // Terminate employement dialog
    await expect(
      screen.findByRole('heading', {
        name: tTerminateEmploymentDialog('title'),
      }),
    ).resolves.toBeInTheDocument();
  });

  it('should delete profile', async () => {
    renderEmployeeLayout();

    await openDropdownMenu();

    const text = 'Delete profile';

    userEvent.click(screen.getByText(text));

    // Delete employee dialog
    await expect(
      screen.findByRole('heading', { name: text }),
    ).resolves.toBeInTheDocument();
  });

  describe('no public section access', () => {
    it('should display personal information tab and empty header', async () => {
      server.use(getEmployeeHeaderHandlers.getEmployeeHeader404Handler);
      renderEmployeeLayout();

      await screen.findByText('Personal info');

      await screen.findByTestId('employee-tabs-empty');
    });
  });

  describe('rehire', () => {
    it('Should disable rehire menu item and show reason if rehire validation is invalid', async () => {
      server.use(
        getEmployeeHeaderHandlers.getEmployeeHeader200Handler__employeeHeaderInvalidRehiring,
      );

      renderEmployeeLayout();

      await openDropdownMenu();

      const rehireMenuItem = await screen.findByTestId('rehire-menu-item');
      expect(rehireMenuItem).toHaveAttribute('aria-disabled', 'true');

      userEvent.hover(rehireMenuItem);
      await expect(screen.findByRole('tooltip')).resolves.toHaveTextContent(
        'This profile has a scheduled leave. Remove the scheduled leave to proceed with rehiring.',
      );
    });

    it('should not render if FF is off', async () => {
      renderEmployeeLayout({ [FF_REHIRE]: 'off' });

      await waitFor(() =>
        expect(
          screen.queryByTestId('employments-dropdown-trigger'),
        ).not.toBeInTheDocument(),
      );
    });
  });

  describe('PIT Error State', () => {
    beforeEach(() => {
      server.use(getEmployeeHeaderHandlers.getEmployeeHeader404Handler);
      server.use(
        getSectionsWithAttributesHandlers.getSectionsWithAttributes404Handler,
      );
      jest
        .spyOn(sectionsWithAttributes, 'useGetSectionsWithAttributesError')
        .mockReturnValue({
          error: null,
          hasEmptyQuery: false,
        });
    });

    it('should not render error state if FF is disabled', () => {
      renderEmployeeLayout({ [PIT_OVERHAUL_FF]: 'off' });

      const errorStateElement = screen.queryByTestId(
        'employee-layout-pit-error-state',
      );
      expect(errorStateElement).not.toBeInTheDocument();
    });

    it('should render error state if FF is enabled', async () => {
      renderEmployeeLayout({ [PIT_OVERHAUL_FF]: 'on' });
      jest
        .spyOn(sectionsWithAttributes, 'useGetSectionsWithAttributesError')
        .mockReturnValue({
          error: mockErrorResponseSectionsWithAttributes,
          hasEmptyQuery: false,
        });

      const errorStateElement = await screen.findByTestId(
        'employee-layout-pit-error-state',
      );
      expect(errorStateElement).toBeInTheDocument();
    });

    it('should render delayed creation state if FF is enabled and with matching query param', async () => {
      Object.defineProperty(window, 'history', {
        value: {
          state: {
            delayedCreation: true,
          },
          pushState: jest.fn(),
          replaceState: jest.fn(),
        },
        writable: true,
      });

      jest
        .spyOn(sectionsWithAttributes, 'useGetSectionsWithAttributesError')
        .mockReturnValue({
          error: mockErrorResponseSectionsWithAttributes,
          hasEmptyQuery: false,
        });

      renderEmployeeLayout({ [PIT_OVERHAUL_FF]: 'on' });

      const errorStateElement = await screen.findByTestId(
        'employee-layout-pit-error-state',
      );
      expect(errorStateElement).toBeInTheDocument();

      const delayedCreationTitle = await screen.findByText(
        tEO('employee-details.delayed-creation-state.title'),
      );
      expect(delayedCreationTitle).toBeInTheDocument();
    });
  });
});
