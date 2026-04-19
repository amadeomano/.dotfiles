import { Inline } from 'designSystem/component/layout';
import { TertiaryNavigation } from 'designSystem/component/tertiary-navigation';
import { type NextRouter, useRouter } from 'next/router';
import { type MouseEvent } from 'react';
import { HmrcRtiFpsProcess } from './HmrcRtiFpsProcess';
import { Icon, icons } from 'designSystem/component/icon';

const getActiveRoute = (
  router: NextRouter,
  boundary?: Record<string, unknown>,
) => {
  const secondSlug = router.query.slug?.at(1) ?? 'fps';
  if (!secondSlug) return undefined;
  if (boundary && !boundary[secondSlug]) return undefined;
  return secondSlug;
};

const routeComponents = {
  payments: () => <div>Placeholder for processing payments</div>,
  payslips: () => <div>Placeholder for releasing payslips</div>,
  fps: HmrcRtiFpsProcess,
} as const;

export const ProcessTab = () => {
  const router = useRouter();
  const handleNavigation = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(e.currentTarget.href);
  };

  const hydrateHrefWithQueryParams = (href: string) => {
    const query = new URLSearchParams(router.query as Record<string, string>);
    query.delete('slug');
    const queryParams = query.toString();
    if (queryParams) return `${href}?${queryParams}`;
    return href;
  };

  const activeRoute = getActiveRoute(router, routeComponents) ?? 'fps';
  const ActiveSection =
    activeRoute in routeComponents ? routeComponents[activeRoute] : null;

  return (
    <Inline>
      <TertiaryNavigation>
        <TertiaryNavigation.Item
          href={hydrateHrefWithQueryParams('/payroll/process/fps')}
          selected={getActiveRoute(router) === 'fps'}
          onClick={handleNavigation}
        >
          <Icon icon={icons.circleStatus0}></Icon> FPS
        </TertiaryNavigation.Item>
        <TertiaryNavigation.Item
          href={hydrateHrefWithQueryParams('/payroll/process/payslips')}
          selected={getActiveRoute(router) === 'payslips'}
          onClick={handleNavigation}
        >
          <Icon icon={icons.circleStatus0}></Icon> Payslips
        </TertiaryNavigation.Item>
        <TertiaryNavigation.Item
          href={hydrateHrefWithQueryParams('/payroll/process/payments')}
          selected={getActiveRoute(router) === 'payments'}
          onClick={handleNavigation}
        >
          <Icon icon={icons.circleStatus0}></Icon> Payments
        </TertiaryNavigation.Item>
      </TertiaryNavigation>
      <main>{}</main>
    </Inline>
  );
};
