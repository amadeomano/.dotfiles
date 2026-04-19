import React, { type FC, type PropsWithChildren } from 'react';
import { PageShell } from 'designSystem/component/page-shell';
import { HubHeader } from './components/HubHeader/HubHeader';
import * as utils from '@personio-web/design-system-utils';

const PayrollHubLayoutPure: FC<PropsWithChildren> = ({ children }) => {
  const cloneChildrenWithProps = (child: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(child)) {
      return child;
    }

    return React.cloneElement<unknown>(child);
  };

  const hydratedChildren = React.Children.map(children, cloneChildrenWithProps);

  return <>{hydratedChildren}</>;
};
type PayrollHubLayoutType = typeof PayrollHubLayoutPure & {
  Header: typeof HubHeader;
  Content: typeof HubContent;
};

export const PayrollHubLayout = PayrollHubLayoutPure as PayrollHubLayoutType;

const HubContent: FC<PropsWithChildren> = ({ children }) => (
  <PageShell.TableLayout>{children}</PageShell.TableLayout>
);
PayrollHubLayout.Content = HubContent;
PayrollHubLayout.Header = HubHeader;
