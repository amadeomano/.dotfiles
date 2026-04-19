export type User = {
  position: string;
  department: {
    id: string;
    name: string;
  };
  team?: string;
  birthdate: string;
  image: string;
  first_name: string;
  last_name: string;
  gender_identity: string;
  supervisor: string;
  joined: string;
  onboarding_complete: boolean;
  visa_approved?: boolean | null;
  location: {
    office_name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  payroll: {
    weekly_hours: number;
    salary: {
      amount: number;
      currency: string;
    };
    iban: string;
    tax_class: string;
    tax_identifier: string;
  };
  id: number;
  href: string;
  resume?: string;
};

export type Company = {
  id: number;
  department: string;
  headcount: number;
  fte: number;
};

export type Team = {
  abbreviation: string;
  description: string;
  id: number;
  name: string;
  resource_url: string;
  parentId?: number;
  subTeams?: Team[];
};
