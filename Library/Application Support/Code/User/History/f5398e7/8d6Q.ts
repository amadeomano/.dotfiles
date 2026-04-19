import { type CardCustomisation } from '../preferences/types';

export type CustomisationId =
  | 'description'
  | 'layer'
  | 'abbreviation'
  | 'leads'
  | 'totalMembers'
  | 'openPositions';

const defaultsTable: Record<CustomisationId, CardCustomisation> = {
  description: { id: 'description', isActive: true },
  layer: { id: 'layer', isActive: false },
  abbreviation: { id: 'abbreviation', isActive: false },
  leads: { id: 'leads', isActive: true },
  totalMembers: { id: 'totalMembers', isActive: true },
  openPositions: { id: 'openPositions', isActive: false },
};

export const defaultCustomisations: CardCustomisation[] =
  Object.values(defaultsTable);
