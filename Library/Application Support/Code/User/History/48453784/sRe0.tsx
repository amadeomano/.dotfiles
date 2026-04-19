import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@highlight-ui/button';
import { DeprecatedLink as Link } from '@highlight-ui/link';
import { Tooltip } from '@highlight-ui/tooltip';
import { generateOrgChartLink } from '@personio-web/eo-commons-org-chart-link';

import { EmployeeActionsDropDown } from '../../components/employeeActions/EmployeeActionsDropdown';
import { GLOBAL_CLASSNAME_COMPACT_HIDDEN } from '../../components/employeeHeader/EmployeeHeaderCompact';
import { dataActionNames } from '../../helpers/dataActionNames';
import { showScheduleLeave } from '../../helpers/showScheduleLeave';
import { testIds } from '../../helpers/testIds';

import styles from './EmployeeActions.module.scss';

export const EmployeeActions: React.FC<
  React.PropsWithChildren<{
    profile: Employee;
    accessRights: AccessRights;
  }>
> = ({ profile, accessRights }) => {
  const { t } = useTranslation('employee-header');

  const orgChartLink = useMemo(
    () =>
      generateOrgChartLink({
        employeeId: profile.id,
        filters: [],
      }),
    [profile.id],
  );

  if (accessRights === undefined) {
    return null;
  }

  const {
    can_set_reminder,
    can_schedule_leave,
    can_terminate_employee,
    can_delete_employee,
    can_manage_account,
    can_be_rehired,
  } = accessRights;

  const showScheduleLeaveOption = showScheduleLeave(
    profile.hire_date,
    can_schedule_leave,
  );

  const shouldDisplayDropdown =
    can_set_reminder ||
    showScheduleLeaveOption ||
    can_terminate_employee ||
    can_delete_employee ||
    can_manage_account ||
    can_be_rehired ||
    profile.application;

  return (
    <div className={GLOBAL_CLASSNAME_COMPACT_HIDDEN}>
      {accessRights.can_view_orgchart && (
        <Tooltip content={t('navigation.view-in-orgchart')}>
          <Link
            href={orgChartLink}
            metadata={{
              actionName: dataActionNames.menu.orgchart,
              testId: testIds.menu.orgchart,
            }}
            className={styles.actionButton}
          >
            <IconButton
              aria-label="orgchart-button"
              variant="default"
              icon="sitemap"
            />
          </Link>
        </Tooltip>
      )}

      {accessRights.can_impersonate && (
        <Tooltip content={t('navigation.login-as-employee')}>
          <Link
            href={`/account/login-as-employee/${profile.id}`}
            metadata={{
              actionName: dataActionNames.menu.impersonate,
              testId: testIds.menu.impersonate,
            }}
            className={styles.actionButton}
          >
            <IconButton
              aria-label="login-as-employee-button"
              variant="default"
              icon="sign-in"
            />
          </Link>
        </Tooltip>
      )}

      {shouldDisplayDropdown && (
        <EmployeeActionsDropDown
          accessRights={accessRights}
          application={profile.application}
        />
      )}
    </div>
  );
};
