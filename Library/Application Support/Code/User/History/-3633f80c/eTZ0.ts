import { type PresetType } from '@personio-web/employees-organizations-util-org-units';

export type DrawerConfig = {
  showParentOrgUnit: boolean;
  showSubOrgUnits: boolean;
  onCloseClick: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
};

export type Props = {
  id: number;
  type: PresetType;
  drawerConfig?: DrawerConfig;
};
