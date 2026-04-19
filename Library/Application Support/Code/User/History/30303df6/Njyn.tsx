import { useMemo } from 'react';

import {
  Button,
  IconButton,
} from '@personio-web/design-system-component-button';
import { HoverCard } from '@personio-web/design-system-component-hover-card';
import { icons } from '@personio-web/design-system-component-icon';
import { type ColumnConfig } from '@personio-web/design-system-component-table';

import { TableCell } from '../cells/TableCell';
import type { Team, User } from './types';

const PersonTokenCell = ({ value, row }: { value: string; row: User }) =>
  useMemo(() => {
    const person = {
      name: `${row.first_name} ${row.last_name}`,
      picture: row.image,
      position: row.position,
      office: {
        name: row.location.office_name,
      },
      team: {
        id: row.department.id,
        name: row.department.name,
      },
      supervisor: {
        name: row.supervisor,
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
          href: 'mailto:example@personio.de',
        },
      ],
    };
    return (
      <TableCell.Token
        value={value}
        avatar={{ src: row.image, name: value }}
        renderHoverCard={({ children }) => (
          <HoverCard.Person href={row.href} person={person}>
            {children}
          </HoverCard.Person>
        )}
      />
    );
  }, [value, row]);

export const columnConfig: ColumnConfig<User, any>[] = [
  {
    id: 'first_name',
    header: 'First name',
    columnSize: 'small',
    icon: icons.person,
    accessor: (row) => row.first_name,
    cell: PersonTokenCell,
  },
  {
    id: 'last_name',
    header: 'Last name',
    columnSize: 'small',
    icon: icons.person,
    accessor: (row) => row.last_name,
    cell: ({ value, row }) => {
      const nameIsChanging = value === 'Lopez';
      return (
        <TableCell.Link
          value={value}
          href={row.href}
          truncate
          {...(nameIsChanging && {
            tooltip: { content: `Last name has been requested to change` },
          })}
        />
      );
    },
  },
  {
    id: 'department',
    header: 'Department',
    columnSize: 'small',
    icon: icons.orgChart,
    accessor: (row) => row.department,
    cell: ({ value }) => {
      return <TableCell.Enum value={value} color="random" />;
    },
    enableSorting: false,
    enableGrouping: true,
  },
  {
    id: 'position',
    header: 'Position',
    columnSize: 'medium',
    icon: icons.briefcase,
    accessor: (row) => row.position,
    cell: ({ value }) => {
      return <TableCell.Enum value={value} />;
    },
    enableGrouping: true,
  },
  {
    id: 'hours',
    header: 'Weekly Hours',
    columnSize: 'small',
    icon: icons.coinStack,
    accessor: (row) => row.payroll.weekly_hours,
    cell: ({ value }) => {
      const isPartTime = value < 30;
      return (
        <TableCell.Number
          value={value}
          {...(isPartTime && {
            tooltip: { content: 'This employee is part-time' },
          })}
        />
      );
    },
  },
  {
    id: 'salary',
    header: 'Salary',
    headerTooltipContent: (
      <div>
        <strong>Example</strong> tooltip content for Salary
      </div>
    ),
    columnSize: 'small',
    icon: icons.coinStack,
    accessor: (row) => row.payroll.salary,
    cell: ({ value }: { value: User['payroll']['salary'] }) => {
      const unconfirmed = value.amount < 5000;
      return (
        <TableCell.Currency
          value={value.amount}
          currency={value.currency}
          locale={'en-GB'}
          {...(unconfirmed && {
            tooltip: {
              content: 'This amount has not yet been confirmed',
              variant: 'warning',
            },
          })}
        />
      );
    },
  },
  {
    id: 'onboarding',
    header: 'Onboarded',
    columnSize: 'small',
    accessor: (row) => row.onboarding_complete,
    cell: ({ value, row }) => {
      const handleChecked = () =>
        console.log('making network request to update value');

      const canUpdate = row.location.city === 'Madrid';

      return (
        <TableCell.Checkbox
          value={value}
          label={'Onboarding Complete'}
          {...(canUpdate && { onCheckedChange: handleChecked })}
        />
      );
    },
    icon: icons.checkList,
  },
  {
    id: 'visa_approved',
    header: 'Visa approved',
    columnSize: 'small',
    accessor: (row) => row.visa_approved,
    cell: ({ row, value }) => {
      const fromDublin = row.location.city === 'Dublin';
      const handleChecked = () =>
        console.log('making network request to update value');

      return (
        <TableCell.Switch
          value={value}
          label={'Visa approved'}
          {...(fromDublin && { onCheckedChange: handleChecked })}
        />
      );
    },
    icon: icons.globe,
  },
  {
    id: 'iban',
    header: 'IBAN',
    columnSize: 'medium',
    accessor: (row) => row.payroll.iban,
    cell: ({ value }) => {
      const shouldShowTooltip = value.startsWith('DE5');
      return (
        <TableCell.Text
          value={value}
          {...(shouldShowTooltip && {
            tooltip: {
              content: 'This IBAN is not yet confirmed',
              variant: 'warning',
            },
          })}
        />
      );
    },
    icon: icons.infoCircle,
  },
  {
    id: 'city',
    header: 'City',
    icon: icons.pin,
    columnSize: 'small',
    accessor: (row) => row.location.city,
    cell: ({ value }) => {
      const shouldShowTooltip = value === 'Madrid';
      return (
        <TableCell.Text
          value={value}
          {...(shouldShowTooltip && {
            tooltip: { content: 'This office opens on May 22nd' },
          })}
        />
      );
    },
  },
  {
    id: 'country',
    header: 'Country',
    columnSize: 'small',
    icon: icons.globe,
    accessor: (row) => row.location.country,
    cell: ({ value }) => {
      const isLocalOffice = value === 'United Kingdom';
      return (
        <TableCell.Text
          value={value}
          {...(isLocalOffice && { icon: icons.house })}
        />
      );
    },
  },
  {
    id: 'joined',
    header: 'Joined',
    columnSize: 'small',
    icon: icons.calendar,
    accessor: (row) => row.joined,
    cell: ({ value }: { value: User['joined'] }) => {
      const year = value.split('-')[0];
      const newStarter = parseInt(year, 10) > 2024;
      return (
        <TableCell.Date
          value={new Date(value)}
          locale="en-GB"
          {...(newStarter && {
            tooltip: {
              content: 'This person has not joined yet',
            },
          })}
        />
      );
    },
  },
  {
    id: 'resume',
    header: 'Resume',
    columnSize: 'small',
    icon: icons.documentText,
    accessor: (row) => row.resume,
    enableSorting: false,
    cell: ({ value }) => {
      return (
        <TableCell.Button
          value={value ? 'Download' : value}
          icon={icons.rectangleHorizontalArrowDown}
          onClick={() => console.log('Resume: ', value)}
        />
      );
    },
  },
  {
    id: 'actions',
    header: 'Action',
    columnSize: 'small',
    icon: icons.personCircle,
    accessor: (row) => row.resume,
    enableSorting: false,
    cell: () => {
      return (
        <TableCell.Actions>
          <Button size="small">Share</Button>
          <IconButton aria-label="Send" icon={icons.arrowUp} size="small" />
        </TableCell.Actions>
      );
    },
  },
  {
    id: 'info',
    header: 'Info',
    icon: icons.infoCircle,
    columnSize: 'small',
    accessor: (row) => row.first_name,
    enableSorting: false,
    cell: ({ value }) => {
      return (
        <TableCell.Button
          value={'More'}
          icon={icons.chevronRight}
          iconOnly={true}
          variant={'ghost'}
          onClick={() => console.log('More info', { value })}
        />
      );
    },
  },
];

export const teamsColumnConfig: ColumnConfig<Team, string>[] = [
  {
    id: 'name',
    header: 'Name',
    columnSize: 'medium',
    icon: icons.briefcase,
    enableSorting: false,
    accessor: (row) => row.name,
    cell: ({ value }) => {
      return <TableCell.Text value={String(value)} />;
    },
  },
  {
    id: 'abbreviation',
    header: 'Abbrv.',
    columnSize: 'small',
    icon: icons.person,
    enableSorting: false,
    accessor: (row) => row.abbreviation,
    cell: ({ value }) => {
      return <TableCell.Text value={String(value)} />;
    },
  },
  {
    id: 'description',
    header: 'About',
    columnSize: 'large',
    icon: icons.receipt,
    enableSorting: false,
    accessor: (row) => row.description,
    cell: ({ value }) => {
      return <TableCell.Text value={String(value)} />;
    },
  },
  {
    id: 'resource',
    header: 'Resource',
    columnSize: 'small',
    icon: icons.link,
    enableSorting: false,
    accessor: (row) => row.resource_url,
    cell: ({ value }) => {
      return <TableCell.Link href={String(value)} value="Link" />;
    },
  },
];
