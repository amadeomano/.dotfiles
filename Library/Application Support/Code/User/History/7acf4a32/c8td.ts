import type React from 'react';

import type { ComponentMetadata } from '@personio-web/design-system-utils';
import type { AvatarProps } from '@personio-web/design-system-component-avatar-types';
import type { EnumProps } from '@personio-web/design-system-component-enum-types';
import type { FacepileProps } from '@personio-web/design-system-component-facepile-types';
import type { IconProps } from '@personio-web/design-system-component-icon-types';
import type { LinkProps } from '@personio-web/design-system-component-link-types';
import type { TokenProps } from '@personio-web/design-system-component-token-types';

/*
 * Metadata Item
 */
type MetadataItemProps = {
  icon: IconProps['icon'];
  renderHoverCard?: (props: { children: React.ReactNode }) => React.JSX.Element;
};

export type MetadataItemBaseProps = MetadataItemProps;

export type MetadataItemTextProps = MetadataItemProps & {
  avatar?: Omit<AvatarProps, 'size'>;
  label: string;
};

export type MetadataItemTokenProps = MetadataItemProps & {
  items: (TokenProps & { id: string })[];
};

export type MetadataItemFacePileProps = MetadataItemProps & {
  items?: FacepileProps['items'];
  label: string;
};

export type MetadataItemEnumProps = MetadataItemProps & {
  items: (EnumProps & { id: string })[];
};

export type MetadataItemLinkProps = MetadataItemProps &
  Omit<LinkProps, 'children' | 'unstyled'> & {
    label: string;
  };

/*
 * Hover Card
 */
export type HoverCardBaseProps = React.PropsWithChildren<{
  href?: string;
  isLoading?: boolean;
  isError?: boolean;
  metadata?: ComponentMetadata;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  /* Delay in opening the hovercard in ms */
  openDelay?: number;
}>;

/*
 * Company Hover Card
 */
export type HoverCardCompanyProps = HoverCardBaseProps & {
  company?: {
    name: string;
    logo?: string;
    description?: string;
    offices?: {
      total: number;
      renderHoverCard?: MetadataItemProps['renderHoverCard'];
    };
    people?: {
      total: number;
      items?: MetadataItemFacePileProps['items'];
      renderHoverCard?: MetadataItemProps['renderHoverCard'];
    };
  };
};

/*
 * Office Hover Card
 */
export type HoverCardOfficeProps = HoverCardBaseProps & {
  office?: {
    name: string;
    address?: {
      line1?: string;
      line2?: string;
      country?: string;
    };
    openingHours?: {
      period: string;
      isOpen?: boolean;
    };
    phoneNumber?: string;
    departments?: {
      total: number;
      renderHoverCard?: MetadataItemProps['renderHoverCard'];
    };
    teams?: {
      total: number;
      renderHoverCard?: MetadataItemProps['renderHoverCard'];
    };
    people?: {
      total: number;
      items?: MetadataItemFacePileProps['items'];
      renderHoverCard?: MetadataItemProps['renderHoverCard'];
    };
  };
};

/*
 * Department + Teams (Org units) Hover Cards
 */
export type HoverCardOrgUnitProps = {
  name: string;
  ancestors?: (string | null)[];
  description?: string;
  code?: string;
  descendants?: {
    total: number;
    renderHoverCard?: MetadataItemProps['renderHoverCard'];
  };
  members?: {
    total: number;
    items?: MetadataItemFacePileProps['items'];
    renderHoverCard?: MetadataItemProps['renderHoverCard'];
  };
};

export type HoverCardDepartmentProps = HoverCardBaseProps & {
  department?: HoverCardOrgUnitProps;
};

export type HoverCardTeamProps = HoverCardBaseProps & {
  team?: HoverCardOrgUnitProps;
};

/*
 * Position Hover Card
 */
export type HoverCardPositionProps = HoverCardBaseProps & {
  position?: {
    name: string;
    description?: string;
    people?: {
      total: number;
      items?: MetadataItemFacePileProps['items'];
      renderHoverCard?: MetadataItemProps['renderHoverCard'];
    };
  };
};

/*
 * Person Hover Card
 */
export type HoverCardPersonProps = HoverCardBaseProps & {
  person?: {
    name: string;
    legalName?: string;
    picture?: string;
    position?: string;
    description?: string;
    timezone?: string;
    office?: {
      name: string;
      renderHoverCard?: MetadataItemProps['renderHoverCard'];
    };
    legalEntity?: {
      name: string;
    };
    department?: {
      id: string;
      name: string;
      renderHoverCard?: MetadataItemProps['renderHoverCard'];
    };
    team?: {
      id: string;
      name: string;
      renderHoverCard?: MetadataItemProps['renderHoverCard'];
    };
    supervisor?: {
      name: string;
      picture?: string;
      renderHoverCard?: MetadataItemProps['renderHoverCard'];
    };
    reports?: {
      total: number;
      items?: MetadataItemFacePileProps['items'];
      renderHoverCard?: MetadataItemProps['renderHoverCard'];
    };
    contacts?: Contact[];
  };
};

/*
 * Direct Reports Hover Card
 */
export type HoverCardReportProps = HoverCardBaseProps & {
  report?: {
    name: string;
    legalName?: string;
    picture?: string;
    position?: string;
    birthday: string;
    anniversary: string;
    time_off: string;
    sick_days: string;
    scheduled_time_off: string;
    weekly_hours: string;
    current_period_extra_hours: string;
    contacts?: Contact[];
  };
};

export type Contact = {
  id: string;
  icon: IconProps['icon'];
  label: string;
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
};

export type HoverCardComponent = {
  Company: React.FC<HoverCardCompanyProps>;
  Office: React.FC<HoverCardOfficeProps>;
  Department: React.FC<HoverCardDepartmentProps>;
  Team: React.FC<HoverCardTeamProps>;
  Position: React.FC<HoverCardPositionProps>;
  Person: React.FC<HoverCardPersonProps>;
  Report: React.FC<HoverCardReportProps>;
};
