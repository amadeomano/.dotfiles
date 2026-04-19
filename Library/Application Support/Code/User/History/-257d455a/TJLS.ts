import {
  type OrgChartRemoveFilters,
  type OrgUnitsConfirmationUpdate,
  type OrgUnitsExternalLink,
  type OrgChartPersonDrawer,
} from './consumerTypes';

/**
 * Format {feature}.{context}.{usage}: {consumer-type} | undefined
 * If your feature has a types folder, it's reccomended to import the types from there.
 * Otherwise add them to our consumerTypes
 */
export type Dialogs = {
  'org-units.table.external-link': OrgUnitsExternalLink;
  'org-units.details.external-link': OrgUnitsExternalLink;
  'org-units.edit.confirmation': OrgUnitsConfirmationUpdate;
  'org-chart.remove-filters': OrgChartRemoveFilters;
  'org-chart.other-people': object;
  'org-chart.export-limitation': object;
  'org-chart.export-limitation-safari': object;
  'org-chart.person-drawer': OrgChartPersonDrawer;
};

export type Dialog = {
  [N in keyof Dialogs]: Dialogs[N] extends undefined
    ? { dialogId: N }
    : { dialogId: N; data: Dialogs[N] };
}[keyof Dialogs];

export type DialogContextType = {
  dialogState?: Dialog;
  openDialog: <N extends keyof Dialogs>(
    ...args: Dialogs[N] extends undefined
      ? [dialogId: N]
      : [dialogId: N, data: Dialogs[N]]
  ) => void;
  isDialogOfType: <N extends keyof Dialogs>(
    dialogId: N,
    dialog?: Dialog,
  ) => dialog is Extract<Dialog, { dialogId: N }>;
  closeDialog: () => void;
};
