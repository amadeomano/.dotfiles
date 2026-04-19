import { PageShell } from 'designSystem/component/page-shell';
import React, { type FC, type PropsWithChildren } from 'react';
import { HubHeader } from './components/HubHeader/HubHeader';

const PayrollHubLayoutPure: FC<PropsWithChildren> = ({ children }) => {
  const cloneChildrenWithProps = (child: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(child)) {
      return child;
    }

    return React.cloneElement<any>(child);
  };

  const hydratedChildren = React.Children.map(children, cloneChildrenWithProps);

  return <>{hydratedChildren}</>;
};
type PayrollHubLayoutType = typeof PayrollHubLayoutPure & {
  Header: typeof HubHeader;
  Content: typeof HubContent;
};

export const PayrollHubLayout = PayrollHubLayoutPure as PayrollHubLayoutType;

type ContentProps = { usesPage: false } | { usesPage: true; title: string };
const HubContent: FC<PropsWithChildren<ContentProps>> = ({
  children,
  ...props
}) => <PageShell.TableLayout>{children}</PageShell.TableLayout>;
PayrollHubLayout.Content = HubContent;
PayrollHubLayout.Header = HubHeader;
