import type React from 'react';

import type { IconSVGComponent } from '@personio-web/design-system-component-icon-types';
import { type ComponentMetadata } from '@personio-web/design-system-utils';

/* ViewActionsBar */
export type ViewActionsBarComponentProps = {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  metadata?: ComponentMetadata;
};

export type ViewActionsBarComponent = React.FC<ViewActionsBarComponentProps>;

/* ViewActionsBarItem */
export type ViewActionsBarItemComponentProps = {
  hint: string;
  shortcuts: string[];
  icon: IconSVGComponent;
  disabled?: boolean;
  onClick?: () => void;
  metadata?: ComponentMetadata;
};

export type ViewActionsBarItemComponent =
  React.FC<ViewActionsBarItemComponentProps>;
