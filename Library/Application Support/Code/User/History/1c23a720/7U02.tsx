import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getPersonioTranslation } from '@personio-web/config-jest/src/helpers';

import { assertNoA11yViolations } from '@personio-web/design-system-utils-testing';
import type {
  HoverCardCompanyProps,
  HoverCardDepartmentProps,
  HoverCardOfficeProps,
  HoverCardPersonProps,
  HoverCardPositionProps,
  HoverCardReportProps,
  HoverCardTeamProps,
} from '@personio-web/design-system-component-hover-card-types';
import { icons } from '@personio-web/design-system-component-icon';
import { Token } from '@personio-web/design-system-component-token';

import { HoverCard } from '../HoverCard';

const hoverCardTestId = 'test-hover-card';
const hoverCardContentTestId = `${hoverCardTestId}-content`;
const hoverCardAncestorsTestId = `${hoverCardTestId}-ancestors`;
const nestedHoverCardTestId = `${hoverCardTestId}-nested`;
const hoverCardErrorStateTestId = `${hoverCardTestId}-error-state`;
const hoverCardSkeletonTestId = `${hoverCardTestId}-skeleton`;

const mockPeopleItems = [
  {
    id: '1',
    name: 'John Doe',
    src: 'avatar-1',
  },
  {
    id: '2',
    name: 'Jane Smith',
    src: 'avatar-2',
  },
  {
    id: '3',
    name: 'Michael Brown',
    src: 'avatar-3',
  },
];

const mockCompany: HoverCardCompanyProps['company'] = {
  name: 'Personio',
};

const renderCompanyHoverCard = (props: Partial<HoverCardCompanyProps> = {}) =>
  render(
    <HoverCard.Company
      href="/company"
      company={mockCompany}
      metadata={{ testId: hoverCardTestId }}
      {...props}
    >
      <Token label="Personio" />
    </HoverCard.Company>,
  );

async function openHoverCard(triggerName: string) {
  const trigger = screen.getByRole('link', { name: triggerName });
  userEvent.hover(trigger);

  await waitFor(() => {
    expect(trigger).toHaveAttribute('data-state', 'open');
  });
}

async function openNestedHoverCard() {
  const trigger = screen.getByTestId(`${nestedHoverCardTestId}-trigger`);
  userEvent.hover(trigger);

  await waitFor(() => {
    expect(trigger).toHaveAttribute('data-state', 'open');
  });
}

describe('HoverCard / A11y', () => {
  it('should not violate accessibility standards', async () => {
    const { container } = renderCompanyHoverCard();
    await assertNoA11yViolations(container);
  });
});

describe('HoverCard', () => {
  const { t } = getPersonioTranslation('design-system');

  it('should open hover card on trigger hover', async () => {
    renderCompanyHoverCard();
    await openHoverCard('Personio');
    expect(screen.getByTestId(hoverCardContentTestId)).toBeInTheDocument();
  });

  it('should open hover card on trigger focus', async () => {
    renderCompanyHoverCard();

    const trigger = screen.getByRole('link', { name: 'Personio' });
    trigger.focus();

    await waitFor(() => {
      expect(trigger).toHaveAttribute('data-state', 'open');
    });
    expect(screen.getByTestId(hoverCardContentTestId)).toBeInTheDocument();
  });

  it('should render error state', async () => {
    renderCompanyHoverCard({ isError: true });
    await openHoverCard('Personio');

    expect(screen.getByTestId(hoverCardErrorStateTestId)).toBeInTheDocument();
  });

  describe('<HoverCard.Company />', () => {
    it('should correctly display company hover card', async () => {
      renderCompanyHoverCard();
      await openHoverCard('Personio');

      expect(
        screen.getByRole('heading', { name: 'Personio' }),
      ).toBeInTheDocument();
    });

    it('should render loading state', async () => {
      renderCompanyHoverCard({ isLoading: true });
      await openHoverCard('Personio');

      expect(screen.getByTestId(hoverCardSkeletonTestId)).toBeInTheDocument();
    });

    it('should display company logo', async () => {
      renderCompanyHoverCard({
        company: {
          ...mockCompany,
          logo: 'mock-logo',
        },
      });
      await openHoverCard('Personio');

      expect(screen.getByRole('img', { name: 'Personio' })).toHaveAttribute(
        'src',
        'mock-logo',
      );
    });

    it('should display description', async () => {
      renderCompanyHoverCard({
        company: {
          ...mockCompany,
          description: 'mock-description',
        },
      });
      await openHoverCard('Personio');

      expect(screen.getByText('mock-description')).toBeInTheDocument();
    });

    it('should display offices metadata', async () => {
      renderCompanyHoverCard({
        company: {
          ...mockCompany,
          offices: {
            total: 8,
          },
        },
      });
      await openHoverCard('Personio');

      expect(
        screen.getByText(t('hover-card.offices_plural', { count: 8 })),
      ).toBeInTheDocument();
    });

    it('should display people metadata', async () => {
      renderCompanyHoverCard({
        company: {
          ...mockCompany,
          people: {
            total: 1345,
            items: mockPeopleItems,
          },
        },
      });
      await openHoverCard('Personio');

      expect(
        screen.getByText(t('hover-card.people_plural', { count: 1345 })),
      ).toBeInTheDocument();
    });
  });

  describe('<HoverCard.Office />', () => {
    const mockOffice: HoverCardOfficeProps['office'] = {
      name: 'Munich office',
    };

    const renderOfficeHoverCard = (props: Partial<HoverCardOfficeProps> = {}) =>
      render(
        <HoverCard.Office
          href="/office/123"
          office={mockOffice}
          metadata={{ testId: hoverCardTestId }}
          {...props}
        >
          <Token label="Munich office" />
        </HoverCard.Office>,
      );

    it('should correctly display office hover card', async () => {
      renderOfficeHoverCard();
      await openHoverCard('Munich office');

      expect(
        screen.getByRole('heading', { name: 'Munich office' }),
      ).toBeInTheDocument();
    });

    it('should render loading state', async () => {
      renderOfficeHoverCard({ isLoading: true });
      await openHoverCard('Munich office');

      expect(screen.getByTestId(hoverCardSkeletonTestId)).toBeInTheDocument();
    });

    it('should display office address', async () => {
      renderOfficeHoverCard({
        office: {
          ...mockOffice,
          address: {
            line1: 'Seidlstraße 3',
            line2: '80335 München',
            country: 'Germany',
          },
        },
      });
      await openHoverCard('Munich office');

      expect(screen.getByText('Seidlstraße 3')).toBeInTheDocument();
      expect(screen.getByText('80335 München')).toBeInTheDocument();
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });

    it('should display office opening hours', async () => {
      renderOfficeHoverCard({
        office: {
          ...mockOffice,
          openingHours: {
            period: '7:00 – 19:00',
            isOpen: true,
          },
        },
      });
      await openHoverCard('Munich office');

      expect(screen.getByText('7:00 – 19:00')).toBeInTheDocument();
      expect(
        screen.getByText(t('hover-card.opening-hours.open-now')),
      ).toHaveClass('opened');
    });

    it('should display departments, teams, and people', async () => {
      renderOfficeHoverCard({
        office: {
          ...mockOffice,
          departments: { total: 5 },
          teams: { total: 10 },
          people: { total: 50, items: mockPeopleItems },
        },
      });
      await openHoverCard('Munich office');

      expect(
        screen.getByText(t('hover-card.departments_plural', { count: 5 })),
      ).toBeInTheDocument();
      expect(
        screen.getByText(t('hover-card.teams_plural', { count: 10 })),
      ).toBeInTheDocument();
      expect(
        screen.getByText(t('hover-card.people_plural', { count: 50 })),
      ).toBeInTheDocument();
    });

    it('should display office phone number link', async () => {
      renderOfficeHoverCard({
        office: {
          ...mockOffice,
          phoneNumber: '123-456-7890',
        },
      });
      await openHoverCard('Munich office');

      expect(
        screen.getByRole('link', {
          name: `${t('hover-card.actions.call')} (123-456-7890)`,
        }),
      ).toHaveAttribute('href', 'tel:123-456-7890');
    });
  });

  describe('<HoverCard.Department />', () => {
    const mockDepartment: HoverCardDepartmentProps['department'] = {
      name: 'PTech',
    };

    const renderDepartmentHoverCard = (
      props: Partial<HoverCardDepartmentProps> = {},
    ) =>
      render(
        <HoverCard.Department
          href="/department/123"
          department={mockDepartment}
          metadata={{ testId: hoverCardTestId }}
          {...props}
        >
          <Token label="PTech" />
        </HoverCard.Department>,
      );

    it('should correctly display department hover card', async () => {
      renderDepartmentHoverCard();
      await openHoverCard('PTech');

      expect(
        screen.getByRole('heading', { name: 'PTech' }),
      ).toBeInTheDocument();
    });

    it('should render loading state', async () => {
      renderDepartmentHoverCard({ isLoading: true });
      await openHoverCard('PTech');

      expect(screen.getByTestId(hoverCardSkeletonTestId)).toBeInTheDocument();
    });

    it('should display department ancestors', async () => {
      renderDepartmentHoverCard({
        department: {
          ...mockDepartment,
          ancestors: ['SubSubDep', 'SubDep', 'RootDep'],
        },
      });
      await openHoverCard('PTech');

      expect(screen.getByTestId(hoverCardAncestorsTestId).textContent).toBe(
        'RootDepSubDepSubSubDep',
      );
    });

    it('should display description', async () => {
      renderDepartmentHoverCard({
        department: {
          ...mockDepartment,
          description: 'mock-description',
        },
      });
      await openHoverCard('PTech');

      expect(screen.getByText('mock-description')).toBeInTheDocument();
    });

    it('should display code, descendants, and members', async () => {
      renderDepartmentHoverCard({
        department: {
          ...mockDepartment,
          code: 'mock-code',
          descendants: { total: 10 },
          members: { total: 50, items: mockPeopleItems },
        },
      });
      await openHoverCard('PTech');

      expect(screen.getByText('mock-code')).toBeInTheDocument();
      expect(
        screen.getByText(t('hover-card.sub-departments_plural', { count: 10 })),
      ).toBeInTheDocument();
      expect(
        screen.getByText(t('hover-card.members_plural', { count: 50 })),
      ).toBeInTheDocument();
    });
  });

  describe('<HoverCard.Team />', () => {
    const mockTeam: HoverCardTeamProps['team'] = {
      name: 'Studio',
    };

    const renderTeamHoverCard = (props: Partial<HoverCardTeamProps> = {}) =>
      render(
        <HoverCard.Team
          href="/team/123"
          team={mockTeam}
          metadata={{ testId: hoverCardTestId }}
          {...props}
        >
          <Token label="Studio" />
        </HoverCard.Team>,
      );

    it('should correctly display department hover card', async () => {
      renderTeamHoverCard();
      await openHoverCard('Studio');

      expect(
        screen.getByRole('heading', { name: 'Studio' }),
      ).toBeInTheDocument();
    });

    it('should render loading state', async () => {
      renderTeamHoverCard({ isLoading: true });
      await openHoverCard('Studio');

      expect(screen.getByTestId(hoverCardSkeletonTestId)).toBeInTheDocument();
    });

    it('should display department ancestors', async () => {
      renderTeamHoverCard({
        team: {
          ...mockTeam,
          ancestors: ['SubSubTeam', 'SubTeam', 'RootTeam'],
        },
      });
      await openHoverCard('Studio');

      expect(screen.getByTestId(hoverCardAncestorsTestId).textContent).toBe(
        'RootTeamSubTeamSubSubTeam',
      );
    });

    it('should display description', async () => {
      renderTeamHoverCard({
        team: {
          ...mockTeam,
          description: 'mock-description',
        },
      });
      await openHoverCard('Studio');

      expect(screen.getByText('mock-description')).toBeInTheDocument();
    });

    it('should display code, descendants, and members', async () => {
      renderTeamHoverCard({
        team: {
          ...mockTeam,
          code: 'mock-code',
          descendants: { total: 10 },
          members: { total: 50, items: mockPeopleItems },
        },
      });
      await openHoverCard('Studio');

      expect(screen.getByText('mock-code')).toBeInTheDocument();
      expect(
        screen.getByText(t('hover-card.sub-teams_plural', { count: 10 })),
      ).toBeInTheDocument();
      expect(
        screen.getByText(t('hover-card.members_plural', { count: 50 })),
      ).toBeInTheDocument();
    });
  });

  describe('<HoverCard.Position />', () => {
    const mockPosition: HoverCardPositionProps['position'] = {
      name: 'Product Designer, L7',
    };

    const renderPositionHoverCard = (
      props: Partial<HoverCardPositionProps> = {},
    ) =>
      render(
        <HoverCard.Position
          href="/position/123"
          position={mockPosition}
          metadata={{ testId: hoverCardTestId }}
          {...props}
        >
          <Token label="Product Designer, L7" />
        </HoverCard.Position>,
      );

    it('should correctly display position hover card', async () => {
      renderPositionHoverCard();
      await openHoverCard('Product Designer, L7');

      expect(
        screen.getByRole('heading', { name: 'Product Designer, L7' }),
      ).toBeInTheDocument();
    });

    it('should render loading state', async () => {
      renderPositionHoverCard({ isLoading: true });
      await openHoverCard('Product Designer, L7');

      expect(screen.getByTestId(hoverCardSkeletonTestId)).toBeInTheDocument();
    });

    it('should display description', async () => {
      renderPositionHoverCard({
        position: {
          ...mockPosition,
          description: 'mock-description',
        },
      });
      await openHoverCard('Product Designer, L7');

      expect(screen.getByText('mock-description')).toBeInTheDocument();
    });

    it('people', async () => {
      renderPositionHoverCard({
        position: {
          ...mockPosition,
          people: { total: 7, items: mockPeopleItems },
        },
      });
      await openHoverCard('Product Designer, L7');

      expect(
        screen.getByText(t('hover-card.people_plural', { count: 7 })),
      ).toBeInTheDocument();
    });
  });

  describe('<HoverCard.Person />', () => {
    const mockPerson: HoverCardPersonProps['person'] = {
      name: 'Michael Scott',
    };

    const renderPersonHoverCard = (props: Partial<HoverCardPersonProps> = {}) =>
      render(
        <HoverCard.Person
          href="/person/123"
          person={mockPerson}
          metadata={{ testId: hoverCardTestId }}
          {...props}
        >
          <Token label="Michael Scott" />
        </HoverCard.Person>,
      );

    it('should correctly display person hover card', async () => {
      renderPersonHoverCard();
      await openHoverCard('Michael Scott');

      expect(
        screen.getByRole('heading', { name: 'Michael Scott' }),
      ).toBeInTheDocument();
    });

    it('should correctly display person legal name', async () => {
      renderPersonHoverCard({
        person: { name: 'Michael Scott', legalName: 'Michael Gary Scott' },
      });
      await openHoverCard('Michael Scott');

      expect(screen.getByText('Michael Gary Scott')).toBeInTheDocument();
    });

    it('should not display person legal name if matches preferred name', async () => {
      renderPersonHoverCard({
        person: { name: 'Michael Scott', legalName: 'Michael Scott' },
      });
      await openHoverCard('Michael Scott');

      expect(screen.queryByText('Michael Gary Scott')).not.toBeInTheDocument();
    });

    it('should render loading state', async () => {
      renderPersonHoverCard({ isLoading: true });
      await openHoverCard('Michael Scott');

      expect(screen.getByTestId(hoverCardSkeletonTestId)).toBeInTheDocument();
    });

    it('should display image when profile picture is provided', async () => {
      renderPersonHoverCard({
        person: {
          ...mockPerson,
          picture: 'mock-logo',
        },
      });
      await openHoverCard('Michael Scott');

      expect(
        screen.getByRole('img', { name: 'Michael Scott' }),
      ).toHaveAttribute('src', 'mock-logo');
    });

    it('should render initials if no profile picture but name is passed', async () => {
      renderPersonHoverCard({
        person: {
          ...mockPerson,
          picture: undefined,
        },
      });
      await openHoverCard('Michael Scott');

      expect(screen.getByText('MS')).toBeInTheDocument();
    });

    it('should display position', async () => {
      renderPersonHoverCard({
        person: {
          ...mockPerson,
          position: 'mock-position',
        },
      });
      await openHoverCard('Michael Scott');

      expect(screen.getByText('mock-position')).toBeInTheDocument();
    });

    it('should display description', async () => {
      renderPersonHoverCard({
        person: {
          ...mockPerson,
          description: 'mock-description',
        },
      });
      await openHoverCard('Michael Scott');

      expect(screen.getByText('mock-description')).toBeInTheDocument();
    });

    it('should display department, team, legal entity, supervisor, and reports', async () => {
      renderPersonHoverCard({
        person: {
          ...mockPerson,
          office: {
            name: 'mock-office',
          },
          department: {
            id: '1',
            name: 'mock-department',
          },
          team: {
            id: '1',
            name: 'mock-team',
          },
          legalEntity: {
            name: 'mock-legal-entity',
          },
          supervisor: {
            name: 'mock-supervisor',
            picture: 'mock-image',
          },
          reports: {
            total: 7,
            items: mockPeopleItems,
          },
        },
      });
      await openHoverCard('Michael Scott');

      expect(screen.getByText('mock-office')).toBeInTheDocument();
      expect(screen.getByText('mock-legal-entity')).toBeInTheDocument();
      expect(screen.getByText('mock-department')).toBeInTheDocument();
      expect(screen.getByText('mock-team')).toBeInTheDocument();
      expect(
        screen.getByText(t('hover-card.reports-to-supervisor')),
      ).toBeInTheDocument();
      expect(screen.getByText('mock-supervisor')).toBeInTheDocument();

      expect(
        screen.getByText(t('hover-card.reports_plural', { count: 7 })),
      ).toBeInTheDocument();
    });

    it('should display nested office hover card', async () => {
      renderPersonHoverCard({
        person: {
          ...mockPerson,
          office: {
            name: 'mock-office',
            renderHoverCard: ({ children }) => (
              <HoverCard.Office
                href="/office/123"
                office={{ name: 'mock-office' }}
                metadata={{ testId: nestedHoverCardTestId }}
              >
                {children}
              </HoverCard.Office>
            ),
          },
        },
      });
      await openHoverCard('Michael Scott');

      expect(screen.getByText('mock-office')).toBeInTheDocument();

      await openNestedHoverCard();

      expect(
        screen.getByRole('heading', { name: 'mock-office' }),
      ).toBeInTheDocument();
    });

    it('should display nested department hover card', async () => {
      renderPersonHoverCard({
        person: {
          ...mockPerson,
          department: {
            id: '1',
            name: 'mock-department',
            renderHoverCard: ({ children }) => (
              <HoverCard.Department
                href="/department/123"
                department={{ name: 'mock-department' }}
                metadata={{ testId: nestedHoverCardTestId }}
              >
                {children}
              </HoverCard.Department>
            ),
          },
        },
      });
      await openHoverCard('Michael Scott');

      expect(screen.getByText('mock-department')).toBeInTheDocument();

      await openNestedHoverCard();

      expect(
        screen.getByRole('heading', { name: 'mock-department' }),
      ).toBeInTheDocument();
    });

    it('should display nested team hover card', async () => {
      renderPersonHoverCard({
        person: {
          ...mockPerson,
          team: {
            id: '123',
            name: 'mock-team',
            renderHoverCard: ({ children }) => (
              <HoverCard.Team
                href="/team/123"
                team={{ name: 'mock-team' }}
                metadata={{ testId: nestedHoverCardTestId }}
              >
                {children}
              </HoverCard.Team>
            ),
          },
        },
      });
      await openHoverCard('Michael Scott');

      expect(screen.getByText('mock-team')).toBeInTheDocument();

      await openNestedHoverCard();

      expect(
        screen.getByRole('heading', { name: 'mock-team' }),
      ).toBeInTheDocument();
    });

    it('should display person contact links', async () => {
      renderPersonHoverCard({
        person: {
          ...mockPerson,
          contacts: [
            {
              id: 'slack',
              icon: icons.speechBubble,
              label: 'Slack',
              href: 'https://slack-link',
              target: '_blank',
            },
            {
              id: 'email',
              icon: icons.inbox,
              label: 'Email',
              href: 'mailto:email@personio.de',
            },
          ],
        },
      });
      await openHoverCard('Michael Scott');

      expect(
        screen.getByRole('link', {
          name: 'Slack',
        }),
      ).toHaveAttribute('href', 'https://slack-link');
      expect(
        screen.getByRole('link', {
          name: 'Slack',
        }),
      ).toHaveAttribute('target', '_blank');

      expect(
        screen.getByRole('link', {
          name: 'Email',
        }),
      ).toHaveAttribute('href', 'mailto:email@personio.de');
      expect(
        screen.getByRole('link', {
          name: 'Email',
        }),
      ).not.toHaveAttribute('target');
    });
  });

  describe('<HoverCard.Report />', () => {
    const mockReport: HoverCardReportProps['report'] = {
      name: 'Michael Scott',
      birthday: '',
      anniversary: '',
      time_off: '',
      sick_days: '',
      scheduled_time_off: '',
      weekly_hours: '',
      current_period_extra_hours: '',
    };

    const renderReportHoverCard = (props: Partial<HoverCardReportProps> = {}) =>
      render(
        <HoverCard.Report
          href="/person/123"
          report={mockReport}
          metadata={{ testId: hoverCardTestId }}
          {...props}
        >
          <Token label="Michael Scott" />
        </HoverCard.Report>,
      );

    it('should correctly display person hover card', async () => {
      renderReportHoverCard();
      await openHoverCard('Michael Scott');

      expect(
        screen.getByRole('heading', { name: 'Michael Scott' }),
      ).toBeInTheDocument();
    });

    it('should correctly display person legal name', async () => {
      renderReportHoverCard({
        report: { ...mockReport, legalName: 'Michael Gary Scott' },
      });
      await openHoverCard('Michael Scott');

      expect(screen.getByText('Michael Gary Scott')).toBeInTheDocument();
    });

    it('should render loading state', async () => {
      renderReportHoverCard({ isLoading: true });
      await openHoverCard('Michael Scott');

      expect(screen.getByTestId(hoverCardSkeletonTestId)).toBeInTheDocument();
    });

    it('should display image when profile picture is provided', async () => {
      renderReportHoverCard({
        report: {
          ...mockReport,
          picture: 'mock-logo',
        },
      });
      await openHoverCard('Michael Scott');

      expect(
        screen.getByRole('img', { name: 'Michael Scott' }),
      ).toHaveAttribute('src', 'mock-logo');
    });

    it('should render initials if no profile picture but name is passed', async () => {
      renderReportHoverCard({
        report: {
          ...mockReport,
          picture: undefined,
        },
      });
      await openHoverCard('Michael Scott');

      expect(screen.getByText('MS')).toBeInTheDocument();
    });

    it('should display position', async () => {
      renderReportHoverCard({
        report: {
          ...mockReport,
          position: 'mock-position',
        },
      });
      await openHoverCard('Michael Scott');

      expect(screen.getByText('mock-position')).toBeInTheDocument();
    });

    it('should display direct report information', async () => {
      renderReportHoverCard({
        report: {
          ...mockReport,
          birthday: '17 May',
          anniversary: '23 October',
          time_off: '13 / 20',
          sick_days: '7 / 10',
          scheduled_time_off: '21-26 May',
          weekly_hours: '27/40 hr',
          current_period_extra_hours: '13 hr',
        },
      });

      await openHoverCard('Michael Scott');

      expect(screen.getByText('17 May')).toBeInTheDocument();
      expect(screen.getByText('23 October')).toBeInTheDocument();
      expect(screen.getByText('13 / 20')).toBeInTheDocument();
      expect(screen.getByText('7 / 10')).toBeInTheDocument();
      expect(screen.getByText('21-26 May')).toBeInTheDocument();
      expect(screen.getByText('27/40 hr')).toBeInTheDocument();
      expect(screen.getByText('13 hr')).toBeInTheDocument();
    });

    it('should display person contact links', async () => {
      renderReportHoverCard({
        report: {
          ...mockReport,
          contacts: [
            {
              id: 'slack',
              icon: icons.speechBubble,
              label: 'Slack',
              href: 'https://slack-link',
              target: '_blank',
            },
            {
              id: 'email',
              icon: icons.inbox,
              label: 'Email',
              href: 'mailto:email@personio.de',
            },
          ],
        },
      });
      await openHoverCard('Michael Scott');

      expect(
        screen.getByRole('link', {
          name: 'Slack',
        }),
      ).toHaveAttribute('href', 'https://slack-link');
      expect(
        screen.getByRole('link', {
          name: 'Slack',
        }),
      ).toHaveAttribute('target', '_blank');

      expect(
        screen.getByRole('link', {
          name: 'Email',
        }),
      ).toHaveAttribute('href', 'mailto:email@personio.de');
      expect(
        screen.getByRole('link', {
          name: 'Email',
        }),
      ).not.toHaveAttribute('target');
    });
  });
});
