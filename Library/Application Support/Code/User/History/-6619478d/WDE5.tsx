import { type UpdateOrgUnitMutationResult } from '@personio-web/employees-organizations-gofer';
import { type PresetType } from '@personio-web/employees-organizations-util-org-units';

export type OrgUnitsUpdateProps = {
  type: PresetType;
  id: string;
  isGlobalHierarchiesEnabled?: boolean;
  isLeadsEnabled?: boolean;
  onEditSuccess: (orgUnitId: string) => void;
  onEditCancel: () => void;
  onEditConfirmationCancel?: () => void;
  onDelete: () => void;
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
