import { type UpdateOrgUnitMutationResult } from '@personio-web/employees-organizations-gofer';
import { type PresetType } from '@personio-web/employees-organizations-util-org-units';

export type OrgUnitsUpdateDrawerConfig = {
  onEditSuccess: (orgUnitId: string) => void;
  onEditCancel: () => void;
  onEditConfirmationCancel?: () => void;
  onDeleteClick?: () => void;
};

export type OrgUnitsUpdateProps = {
  type: PresetType;
  id: string;
  isGlobalHierarchiesEnabled?: boolean;
  isLeadsEnabled?: boolean;
  drawerConfig?: OrgUnitsUpdateDrawerConfig;
};

export type OrgUnitsConfirmationUpdateProps = {
  type: PresetType;
  previousParentName: string;
  newParentName?: string;
  onSubmit: () => void;
  onCancel: () => void;
  cascadedChangesList?: NonNullable<
    UpdateOrgUnitMutationResult['orgUnit']
  >['cascadedChangesList'];
};
