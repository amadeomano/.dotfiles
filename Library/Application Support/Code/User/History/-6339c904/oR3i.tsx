import { type EmployeeHoverCardQueryResult } from '@personio-web/design-system-gofer';
import {
  EmployeeHoverCardQueryResponse,
  GetPersonSlackDataQueryResponse,
} from '@personio-web/design-system-gofer/src/mocks';

import { mapPerson } from '../../utils/mapPerson';

const mockResult = {
  name: 'Chris Welch',
  legalName: undefined,
  picture: 'https://i.pravatar.cc/75?img=1',
  position: 'Director, Product Design',
  office: {
    name: 'Munich Office',
  },
  legalEntity: {
    name: 'Test Company GmbH',
  },
  department: {
    id: '10',
    name: 'IT',
    renderHoverCard: expect.any(Function),
  },
  team: {
    id: '20',
    name: 'Design Architecture',
    renderHoverCard: expect.any(Function),
  },
  supervisor: {
    name: 'Gui Schneider',
    picture: 'https://i.pravatar.cc/50?img=2',
    renderHoverCard: expect.any(Function),
  },
  reports: {
    total: 7,
    items: [
      {
        id: '2',
        name: 'John Doe',
        src: 'https://i.pravatar.cc/50?img=3',
      },
      {
        id: '3',
        name: 'Jane Smith',
        src: 'https://i.pravatar.cc/50?img=4',
      },
      {
        id: '4',
        name: 'Michael Brown',
        src: 'https://i.pravatar.cc/50?img=5',
      },
    ],
  },
  contacts: [
    {
      href: 'mailto:Elsie34@yahoo.com',
      icon: expect.any(Object),
      id: 'email',
      label: 'E-mail',
    },
  ],
};

describe('mapPerson', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined if person data is not provided', () => {
    expect(mapPerson({ personData: undefined })).toBeUndefined();
    expect(mapPerson({})).toBeUndefined();
  });

  it('should map person data correctly from the provided mock data', () => {
    const result = mapPerson({
      personData: EmployeeHoverCardQueryResponse.data,
    });

    expect(result).toEqual(mockResult);
  });

  it('should map person data with legal name', () => {
    const result = mapPerson({
      personData: EmployeeHoverCardQueryResponse.data,
      displayLegalName: true,
    });

    expect(result).toEqual({
      ...mockResult,
      legalName: 'Christopher Welch',
      reports: {
        ...mockResult.reports,
        items: [
          {
            id: '2',
            name: 'Johnathan Doe',
            src: 'https://i.pravatar.cc/50?img=3',
          },
          {
            id: '3',
            name: 'Janine Smith',
            src: 'https://i.pravatar.cc/50?img=4',
          },
          {
            id: '4',
            name: 'Michael Brown',
            src: 'https://i.pravatar.cc/50?img=5',
          },
        ],
      },
      supervisor: {
        ...mockResult.supervisor,
        name: 'Guilherme Schneider',
      },
    });
  });

  it('should map person data with slack link', () => {
    const result = mapPerson({
      personData: EmployeeHoverCardQueryResponse.data,
      slackData: GetPersonSlackDataQueryResponse.data,
    });

    expect(result).toEqual({
      ...mockResult,
      contacts: [
        {
          id: 'slack',
          icon: expect.any(Object),
          label: 'Slack',
          href: `slack://user?team=DEF456&id=ABC123`,
        },
        ...mockResult.contacts,
      ],
    });
  });

  it('should handle missing or empty fields', () => {
    const mockPersonEmptyData: EmployeeHoverCardQueryResult = {
      personandemployment_EmploymentService_GetEmployment_v1: {
        employment: {
          person: {
            id: '1',
            email: {
              value: '',
            },
            preferredName: {
              value: 'John Doe',
            },
            firstName: {
              value: '',
            },
            lastName: {
              value: '',
            },
            profilePicUrls: {
              paths: {
                small: '',
                medium: '',
                large: '',
              },
            },
          },
          positionTitle: {
            value: '',
          },
          workplaceEntity: {
            name: '',
            timeZone: null,
          },
          departmentEntity: {
            id: '',
            name: '',
          },
          teamEntity: {
            id: '',
            name: '',
          },
          legalEntityDetails: {
            id: '',
            name: '',
          },
          supervisorEmployment: null,
          directReportEmployments: [],
        },
      },
      personandemployment_EmploymentService_ListEmployments_v1: {
        pagination: {
          totalItems: {
            value: 0,
          },
        },
      },
    };

    const result = mapPerson({ personData: mockPersonEmptyData });

    expect(result).toEqual({
      name: 'John Doe',
      picture: '',
      position: '',
      office: undefined,
      department: undefined,
      team: undefined,
      legalEntity: undefined,
      supervisor: undefined,
      reports: undefined,
    });
  });
});
