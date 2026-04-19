import { screen, waitFor } from '@testing-library/react';

import { server } from '@personio-web/mocks/server';
import { renderWithWrapper } from '@personio-web/orchestrator-common/test-utils';

import type { SmartHoverCardPersonProps } from '@personio-web/design-system-feature-smart-hover-card-types';
import {
  EmployeeHoverCardHandlers,
  GetPersonSlackDataHandlers,
  ListIntegrationsHandlers,
} from '@personio-web/design-system-gofer/mocking';
import { Token } from '@personio-web/design-system-component-token';

import { SmartHoverCard } from '../SmartHoverCard';
import * as helpers from './testHelpers';

const hoverCardTestId = 'person-hover-card';

const renderPersonHoverCard = (
  props: Partial<SmartHoverCardPersonProps> = {},
) =>
  renderWithWrapper(
    <SmartHoverCard.Person
      id="1"
      href="/person/1"
      metadata={{ testId: hoverCardTestId }}
      {...props}
    >
      <Token label="Person" />
    </SmartHoverCard.Person>,
    {
      authClaim: { companyId: -1, employeeId: -1, entityType: 'empty' },
    },
  );

describe('SmartHoverCardPerson', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it.each(['hover', 'focus'])(
    'should fetch data and render person hover card on %s',
    async (triggerMethod) => {
      server.use(EmployeeHoverCardHandlers.defaultHandler);
      renderPersonHoverCard();

      await waitFor(() => {
        expect(
          screen.queryByTestId(
            `${hoverCardTestId}-smart-hover-card-person-trigger`,
          ),
        ).toBeInTheDocument();
      });
      await helpers.openHoverCard('Person', triggerMethod);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Chris Welch' }),
        ).toBeInTheDocument();
      });
    },
  );

  it('should render legal name on person hover card', async () => {
    server.use(EmployeeHoverCardHandlers.defaultHandler);
    renderPersonHoverCard({ displayLegalName: true });

    await waitFor(() => {
      expect(
        screen.queryByTestId(
          `${hoverCardTestId}-smart-hover-card-person-trigger`,
        ),
      ).toBeInTheDocument();
    });
    await helpers.openHoverCard('Person');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Chris Welch' }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Christopher Welch')).toBeInTheDocument();
  });

  it('should not render slack link if integration is not enabled', async () => {
    server.use(EmployeeHoverCardHandlers.defaultHandler);
    server.use(ListIntegrationsHandlers.disabledHandler);
    renderPersonHoverCard();

    await waitFor(() => {
      expect(
        screen.queryByTestId(
          `${hoverCardTestId}-smart-hover-card-person-trigger`,
        ),
      ).toBeInTheDocument();
    });
    await helpers.openHoverCard('Person');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Chris Welch' }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('link', { name: 'Slack' }),
    ).not.toBeInTheDocument();
  });

  it('should not render slack link if user has no account', async () => {
    server.use(EmployeeHoverCardHandlers.defaultHandler);
    server.use(ListIntegrationsHandlers.defaultHandler);
    server.use(GetPersonSlackDataHandlers.graphqlErrorHandler);
    renderPersonHoverCard();

    await waitFor(() => {
      expect(
        screen.queryByTestId(
          `${hoverCardTestId}-smart-hover-card-person-trigger`,
        ),
      ).toBeInTheDocument();
    });
    await helpers.openHoverCard('Person');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Chris Welch' }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('link', { name: 'Slack' }),
    ).not.toBeInTheDocument();
  });

  it('should not render slack link', async () => {
    server.use(EmployeeHoverCardHandlers.defaultHandler);
    server.use(ListIntegrationsHandlers.defaultHandler);
    server.use(GetPersonSlackDataHandlers.defaultHandler);
    renderPersonHoverCard();

    await waitFor(() => {
      expect(
        screen.queryByTestId(
          `${hoverCardTestId}-smart-hover-card-person-trigger`,
        ),
      ).toBeInTheDocument();
    });
    await helpers.openHoverCard('Person');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Chris Welch' }),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Slack' })).toHaveProperty(
      'href',
      'slack://user?team=DEF456&id=ABC123',
    );
  });

  it('should render department and team with correct org chart link', async () => {
    server.use(EmployeeHoverCardHandlers.defaultHandler);
    renderPersonHoverCard();

    await waitFor(() => {
      expect(
        screen.queryByTestId(
          `${hoverCardTestId}-smart-hover-card-person-trigger`,
        ),
      ).toBeInTheDocument();
    });
    await helpers.openHoverCard('Person');

    const departmentLink = screen.getByRole('link', { name: 'IT' });
    const teamLink = screen.getByRole('link', { name: 'Design Architecture' });
    await waitFor(() => {
      expect(departmentLink).toBeInTheDocument();
      expect(teamLink).toBeInTheDocument();
    });
  });
});
