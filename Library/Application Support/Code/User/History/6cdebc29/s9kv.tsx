import type { Meta, StoryFn } from '@storybook/react';

import type {
  HoverCardBaseProps,
  HoverCardPersonProps,
  HoverCardReportProps,
} from '@personio-web/design-system-component-hover-card-types';
import { icons } from '@personio-web/design-system-component-icon';
import { Token } from '@personio-web/design-system-component-token';

import { HoverCard } from './HoverCard';

const config: Meta<HoverCardBaseProps> = {
  id: 'HoverCard',
  title: 'Design System/Components/Hover Card',
  args: {
    isLoading: false,
    isError: false,
  },
};

const peopleItems = [
  {
    id: '1',
    name: 'John Doe',
    src: 'https://i.pravatar.cc/100?img=1',
  },
  {
    id: '2',
    name: 'Jane Smith',
    src: 'https://i.pravatar.cc/100?img=2',
  },
  {
    id: '3',
    name: 'Michael Brown',
    src: 'https://i.pravatar.cc/100?img=3',
  },
];

const CompanyTemplate: StoryFn<HoverCardBaseProps> = (args) => (
  <HoverCard.Company
    {...args}
    href="https://www.personio.de/"
    company={{
      name: 'Personio',
      logo: 'https://www.personio.foundation/wp-content/uploads/2021/12/cropped-personio-1-270x270.png',
      description:
        'The all-in-one HR software solution. Make every HR process seamless with Personio’s HR management system, trusted by 10,000+ companies.',
      offices: {
        total: 8,
      },
      people: {
        total: 1345,
        items: peopleItems,
      },
    }}
  >
    <Token
      label="Personio"
      avatar={{
        src: 'https://www.personio.foundation/wp-content/uploads/2021/12/cropped-personio-1-270x270.png',
        format: 'square',
      }}
    />
  </HoverCard.Company>
);

export const Company = CompanyTemplate.bind({});

const office = {
  name: 'Munich office',
  address: {
    line1: 'Seidlstraße 3',
    line2: '80335 München',
    country: 'Germany',
  },
  openingHours: {
    period: '7:00 – 19:00',
    isOpen: true,
  },
  phoneNumber: '+49 999 999 9999',
  departments: {
    total: 7,
  },
  teams: {
    total: 63,
  },
  people: {
    total: 854,
    items: peopleItems,
  },
};

const OfficeTemplate: StoryFn<HoverCardBaseProps> = (args) => (
  <HoverCard.Office {...args} office={office}>
    <Token label="Munich office" />
  </HoverCard.Office>
);

export const Office = OfficeTemplate.bind({});

const DepartmentTemplate: StoryFn<HoverCardBaseProps> = (args) => (
  <HoverCard.Department
    {...args}
    department={{
      name: 'PTech',
      ancestors: ['Engineering', 'Mobile Apps', 'iOS'],
      description: 'Product & Technology',
      code: 'PTECH',
      descendants: {
        total: 8,
      },
      members: {
        total: 128,
        items: peopleItems,
      },
    }}
  >
    <Token label="PTech" />
  </HoverCard.Department>
);

export const Department = DepartmentTemplate.bind({});

const team = {
  name: 'Studio',
  ancestors: ['Engineering', 'Mobile Apps', 'iOS'],
  description: 'Designing for scale at Personio',
  code: 'STUDIO',
  descendants: {
    total: 10,
  },
  members: {
    total: 237,
    items: peopleItems,
  },
};

const department = {
  name: 'IT',
  description: 'IT Department',
  code: 'IT',
  descendants: {
    total: 15,
  },
  members: {
    total: 144,
    items: peopleItems,
  },
};

const TeamTemplate: StoryFn<HoverCardBaseProps> = (args) => (
  <HoverCard.Team {...args} team={team}>
    <Token label="Studio" />
  </HoverCard.Team>
);

export const Team = TeamTemplate.bind({});

const PositionTemplate: StoryFn<HoverCardBaseProps> = (args) => (
  <HoverCard.Position
    {...args}
    position={{
      name: 'Product Designer, L7',
      description:
        'Accountable for managing work-streams, providing product direction, leading within the design team, and tackling complex problems.',
      people: {
        total: 7,
        items: peopleItems,
      },
    }}
  >
    <Token label="Product Designer, L7" />
  </HoverCard.Position>
);

export const Position = PositionTemplate.bind({});

const person: HoverCardPersonProps['person'] = {
  name: 'Chris Welch',
  picture: 'https://i.pravatar.cc/200?img=3',
  position: 'Director, Product Design',
  description:
    'Accountable for managing work-streams, providing product direction, leading within the design team, and tackling complex problems.',
  timezone: 'PST',
  office: {
    name: 'Munich Office',
    renderHoverCard: ({ children }) => (
      <HoverCard.Office href="/office/123" office={office}>
        {children}
      </HoverCard.Office>
    ),
  },
  department: {
    name: 'IT',
    renderHoverCard: ({ children }) => (
      <HoverCard.Department department={{ ...department, name: 'IT' }}>
        {children}
      </HoverCard.Department>
    ),
  },
  team: {
    name: 'Design Architecture',
    renderHoverCard: ({ children }) => (
      <HoverCard.Team team={{ ...team, name: 'Design Architecture' }}>
        {children}
      </HoverCard.Team>
    ),
  },
  supervisor: {
    name: 'Gui Schneider',
    picture: 'https://i.pravatar.cc/200?img=5',
    renderHoverCard: ({ children }) => (
      <HoverCard.Person
        person={{
          ...person,
          name: 'Gui Schneider',
          picture: 'https://i.pravatar.cc/200?img=5',
        }}
      >
        {children}
      </HoverCard.Person>
    ),
  },
  reports: {
    total: 7,
    items: peopleItems,
  },
  contacts: [
    {
      id: 'slack',
      icon: icons.speechBubble,
      label: 'Slack',
      href: '/',
    },
    {
      id: 'email',
      icon: icons.inbox,
      label: 'Email',
      href: 'mailto:chris.welch@personio.de',
    },
  ],
};

const PersonTemplate: StoryFn<HoverCardBaseProps> = (args) => (
  <HoverCard.Person {...args} person={person}>
    <Token
      label="Chris Welch"
      avatar={{ src: 'https://i.pravatar.cc/200?img=3', name: 'Chris Welch' }}
    />
  </HoverCard.Person>
);

export const Person = PersonTemplate.bind({});

const report: HoverCardReportProps['report'] = {
  name: 'Chris Welch',
  picture: 'https://i.pravatar.cc/200?img=3',
  position: 'Director, Product Design',
  birthday: '17 May',
  anniversary: '23 October',
  time_off: '13 / 20',
  sick_days: '7 / 10',
  scheduled_time_off: '21-26 May',
  weekly_hours: '27/40',
  current_period_extra_hours: '13',
  contacts: [
    {
      id: 'slack',
      icon: icons.speechBubble,
      label: 'Slack',
      href: '/',
    },
    {
      id: 'email',
      icon: icons.inbox,
      label: 'Email',
      href: 'mailto:chris.welch@personio.de',
    },
  ],
};

const ReportTemplate: StoryFn<HoverCardBaseProps> = (args) => (
  <HoverCard.Report {...args} report={report}>
    <Token
      label="Chris Welch"
      avatar={{ src: 'https://i.pravatar.cc/200?img=3', name: 'Chris Welch' }}
    />
  </HoverCard.Report>
);
export const Report = ReportTemplate.bind({});

export default config;
