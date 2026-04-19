import React, { useState } from 'react';

import { PageShell } from 'designSystem/component/page-shell';

import { PayrollIntegration } from '../../shared/types/PayrollIntegration';
import PageContent from './components/PageContent/PageContent';
import { StickyHeaderVariant } from '../../shared/types/StickyHeaderVariant';
import { useBreadcrumbs } from '../../shared/hooks/useBreadcrumbs';
import TitleSection from './components/TitleSection/TitleSection';
import BackLink from './components/BackLink/BackLink';
import { useStickyHeaderObserver } from 'payroll/hook/use-sticky-header';

export const PayrollIntegrationSettings: React.FC<
  React.PropsWithChildren<{
    integration: PayrollIntegration;
  }>
> = ({ integration }) => {
  const [stickyHeaderVariant, setStickyHeaderVariant] =
    useState<StickyHeaderVariant>('none');
  const stickyHeaderObserver = useStickyHeaderObserver();
  const breadcrumbs = useBreadcrumbs(stickyHeaderVariant, integration);

  return (
    <PageShell>
      <BackLink />
      <PageShell.StickyHeader breadcrumbSchema={breadcrumbs}>
        <div />
      </PageShell.StickyHeader>
      <PageShell.Header>
        <TitleSection
          integration={integration}
          stickyHeaderObserver={stickyHeaderObserver}
          onStickyChange={(stuck: boolean) => {
            setStickyHeaderVariant(stuck ? 'full' : 'none');
          }}
        />
      </PageShell.Header>
      <PageShell.Layout>
        test
        {/* <PageContent integration={integration} /> */}
      </PageShell.Layout>
    </PageShell>
  );
};

export default PayrollIntegrationSettings;
