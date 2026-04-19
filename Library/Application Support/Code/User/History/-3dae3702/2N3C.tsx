/* eslint-disable  @nx/enforce-module-boundaries */
import { HoverCard } from '@personio-web/design-system-component-hover-card';
import type {
  HoverCardPersonProps,
  HoverCardBaseProps,
} from '@personio-web/design-system-component-hover-card-types';
import { icons } from '@personio-web/design-system-component-icon';
import { Token } from '@personio-web/design-system-component-token';

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

export const DemoHoverCardCompany = () => (
  <HoverCard.Company
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

export const DemoHoverCardOffice = () => (
  <HoverCard.Office office={office}>
    <Token label="Munich office" />
  </HoverCard.Office>
);

export const DemoHoverCardDepartment = () => (
  <HoverCard.Department
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

export const DemoHoverCardTeam = () => (
  <HoverCard.Team team={team}>
    <Token label="Studio" />
  </HoverCard.Team>
);

export const DemoHoverCardPosition = () => (
  <HoverCard.Position
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
  team: {
    id: '123',
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

export const DemoHoverCardPerson = ({
  name = 'Chris Welch',
  ...props
}: HoverCardBaseProps & { name?: string }) => (
  <HoverCard.Person {...props} person={{ ...person, name }}>
    <Token
      label={name}
      avatar={{ src: 'https://i.pravatar.cc/200?img=3', name }}
    />
  </HoverCard.Person>
);
