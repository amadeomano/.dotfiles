import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EmploymentEntities } from './EmploymentEntities';
import { renderWithWrapper } from '@personio-web/orchestrator-common/test-utils';

const mockGenerateOrgChartLink = jest.fn();
jest.mock('@personio-web/eo-commons-org-chart-link', () => ({
  generateOrgChartLink: (params: string) => mockGenerateOrgChartLink(params),
}));

describe('Employment Entites', () => {
  // TODO investigate why it's failing on gitlab pipelines
  // https://personio.slack.com/archives/CLSAD1CFN/p1738073699881859
  test.skip('renders Employment Entities', async () => {
    renderWithWrapper(
      <EmploymentEntities
        position={'Developer'}
        department={{ name: 'PTech', id: '123' }}
        office={{ name: 'Dublin', id: '456' }}
        team={{ name: 'PET', id: '879' }}
        legalEntity="PET entity"
        variant="default"
      />,
    );

    // position
    await expect(screen.findByText('Developer')).resolves.toBeInTheDocument();

    // office
    await expect(screen.findByText('Dublin')).resolves.toBeInTheDocument();

    // department
    await expect(screen.findByText('PTech')).resolves.toBeInTheDocument();

    // team
    await expect(screen.findByText('PET')).resolves.toBeInTheDocument();

    // Legal entity
    await expect(screen.findByText('PET entity')).resolves.toBeInTheDocument();
  });

  test('renders Employment Entities without department and office if ids are empty', async () => {
    renderWithWrapper(
      <EmploymentEntities
        position={'Developer'}
        department={{ name: '', id: '' }}
        office={{ name: '', id: '' }}
        variant="default"
      />,
    );

    // position
    await expect(screen.findByText('Developer')).resolves.toBeInTheDocument();

    // office
    expect(
      screen.queryByTestId(
        'empoyee-header-office-smart-hover-card-office-trigger',
      ),
    ).toBeNull();

    // team
    expect(
      screen.queryByTestId(
        'empoyee-header-team-smart-hover-card-department-trigger',
      ),
    ).toBeNull();
  });

  // TODO investigate why it's failing on gitlab pipelines
  // https://personio.slack.com/archives/CLSAD1CFN/p1738073699881859
  test.skip('renders departments and click handler correctly', async () => {
    renderWithWrapper(
      <EmploymentEntities
        department={{ name: 'PTech', id: '123' }}
        variant="default"
      />,
    );

    const department = await screen.findByText('PTech');

    userEvent.click(department);
    expect(mockGenerateOrgChartLink).toHaveBeenNthCalledWith(1, {
      filters: [
        {
          id: 'department_id',
          value: { condition: 'contains', value: ['123'] },
        },
      ],
    });
  });

  // TODO investigate why it's failing on gitlab pipelines
  // https://personio.slack.com/archives/CLSAD1CFN/p1738073699881859
  test.skip('renders teams and its click handler correctly', async () => {
    renderWithWrapper(
      <EmploymentEntities
        team={{ name: 'PET', id: '879' }}
        variant="default"
      />,
    );

    const team = await screen.findByText('PET');

    userEvent.click(team);

    expect(mockGenerateOrgChartLink).toHaveBeenNthCalledWith(1, {
      filters: [
        {
          id: 'team_id',
          value: { condition: 'contains', value: ['879'] },
        },
      ],
    });
  });
});
