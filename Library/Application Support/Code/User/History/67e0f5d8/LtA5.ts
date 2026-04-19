type CardsPreferences = {
  personalInfo: boolean;
  avatars: boolean;
  cardClustering: boolean;
  openPositions: boolean;
};

type OrgChartFilter = {
  id: string;
  value: {
    value: string[];
    condition: 'contains' | 'does_not_contain';
  };
};

export type GenerateOrgChartLinkOptions = {
  attributes: string[];
  cardCustomizationPreferences: CardsPreferences;
  filters: OrgChartFilter[];
  highlighted: string;
  employeeId: number;
  spotlight: string;
};
