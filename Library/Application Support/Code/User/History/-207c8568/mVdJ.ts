export const toTranslate = {
  orgUnitCard: {
    members: '{{count}} member',
    members_plural: '{{count}} members',
    noMembers: 'No members',
    totalMembers: ' ({{count}} total)',
    unmatchedDescription:
      'The {{orgunitType}} is not included in the selected filter.',
    unmatchedType: {
      department: 'department',
      team: 'team',
    },
    customisation: {
      description: 'Description',
      layer: 'Layer',
      code: 'Code',
      leads: 'Leads',
      totalMembers: 'Total members',
      openPositions: 'Open positions',
    },
    accessibleLabels: {
      description: 'description: {{description}}',
      noDescription: 'no description defined',
      code: 'code: {{code}}',
      noCode: 'no code defined',
      leads: '{{count}} leads: {{leadNames}}',
      noLeads: 'no leads defined',
      members: 'members: {{direct}} direct and {{total}} total',
      subordinates: 'subordinates: {{direct}} direct and {{total}} total',
    },
    tooltips: {
      membersDepartment:
        '{{count}} direct members in {{name}}<br />{{total}} total members including sub-departments',
      membersTeam:
        '{{count}} direct members in {{name}}<br />{{total}} total members including sub-teams',
      subordinatesDepartment:
        '{{count}} direct sub-departments<br />{{total}} total sub-departments',
      subordinatesTeam:
        '{{count}} direct sub-teams<br />{{total}} total sub-teams',
    },
  },
  orgChart: {
    emptyState: {
      title: 'No results found',
      description:
        'We can’t seem to find any {{source}} matching your filters.',
      source: {
        supervisor: 'employee',
        department: 'department',
        team: 'team',
      },
    },
    controlBar: {
      savedViews: {
        arrangeBySection: 'Arrange by',
      },
      sourceSwitcher: {
        subtitle: 'Arrange org chart by:',
        people: 'People',
        departments: 'Departments',
        teams: 'Teams',
      },
      orgUnitSearch: {
        label: 'Search {{orgunitType}}',
        groups: {
          department: 'Department',
          team: 'Team',
          people: 'People',
        },
      },
    },
  },
};
