import { lazy, useMemo } from 'react';
import { useRouter } from 'next/router';

import { icons, type IconSVGComponent } from 'designSystem/component/icon';

import { type GetEmployeeHeaderData } from '@personio-web/employees-organizations-data-employee-header';
import {
  DialogsKeys,
  useDialog,
} from '@personio-web/employees-organizations-util-dialogs';
import { useAmplitude } from '@personio-web/amplitude-provider';
import { useAuthContext } from '@personio-web/auth-context';
import { useTranslation } from 'react-i18next';
import { useToggleFeatureFlag } from '@personio-web/use-feature-flag';
import {
  AMPLITUDE_EVENT_STARTED_REHIRING,
  FF_CREATE_EMPLOYMENT_CONTRACT,
  FF_REHIRE,
  TEST_IDS,
} from '../constants';
import type { FeatureFlag } from '../../../../../../featureFlags';
import { type TerminateEmploymentDialogVariant } from '@personio-web/employees-organizations-feature-terminate-employment-dialog-types';
import { generateOrgChartLink } from '@personio-web/employees-organizations-util-org-chart';
import { type CustomDropdownMenuItemProps } from '@personio-web/employees-organizations-feature-employee-layout-types';
import { useRehireStatusAttributeConfig } from '@personio-web/employees-organizations-hook-use-rehire-status-attribute-config';
import { type ParseKeys } from 'i18next';
import { isFuture } from 'date-fns';
import { orgChartLink } from '@personio-web/eo-commons-org-chart-link';

type DropdownActions = CustomDropdownMenuItemProps[];

type ButtonActions = {
  icon: IconSVGComponent;
  'aria-label': string;
  tooltipContent: string;
  onClick: () => void;
  metadata?: {
    testId?: string;
  };
}[];

const useIsFeatureOn = (featureKey: FeatureFlag) => {
  const toggle = useToggleFeatureFlag(featureKey);
  return toggle.isReady && toggle.isEnabled;
};

export const useActions = (data?: GetEmployeeHeaderData) => {
  const router = useRouter();
  const isRehireOn = useIsFeatureOn(FF_REHIRE);
  const isEmploymentContractOn = useIsFeatureOn(FF_CREATE_EMPLOYMENT_CONTRACT);
  const { track } = useAmplitude();
  const authContext = useAuthContext();
  const userId =
    authContext.entityType === 'employee' ? authContext.employeeId : null;
  const supportAgentId =
    authContext.entityType === 'support_agent' ? authContext.userId : null;

  const { isRehiredProfile } = useRehireStatusAttributeConfig(
    data?.data?.id || -1,
  );

  const { t } = useTranslation('employee-header');
  const { t: tEmployeeDialog } = useTranslation('delete-employee-dialog');
  const { t: tRehire } = useTranslation('rehire');

  const rehireValidationResult = data?.data?.rehire_validation_result ?? {
    valid: true,
  };
  const { valid: isValidRehire, reason: reasonKey } = rehireValidationResult;
  const reason =
    !isValidRehire && reasonKey
      ? tRehire(reasonKey as ParseKeys<'rehire'>)
      : '';

  const { openDialog } = useDialog();

  return useMemo(() => {
    const {
      id: employeeId,
      application,
      termination_date: terminationDate,
    } = data?.data ?? {};

    const buttonActions: ButtonActions = [];
    const topDropdownActions: DropdownActions = [];
    const bottomDropdownActions: DropdownActions = [];

    if (employeeId) {
      const {
        can_impersonate,
        can_view_orgchart,
        can_manage_account,
        can_set_reminder,
        can_schedule_leave,
        can_terminate_employee,
        can_delete_employee,
        can_create_employment,
        can_be_rehired,
      } = data?.data?.access_rights ?? {};

      const isLookingAtOwnProfile =
        supportAgentId === employeeId.toString() || userId === employeeId;

      const openTerminationDialog = (
        variant: TerminateEmploymentDialogVariant,
      ) => {
        openDialog({
          key: DialogsKeys.TERMINATE_EMPLOYMENT,
          Component: lazy(() =>
            import(
              '@personio-web/employees-organizations-feature-terminate-employment-dialog'
            ).then(({ TerminateEmploymentDialog }) => ({
              default: TerminateEmploymentDialog,
            })),
          ),
          props: { employeeId, variant },
        });
      };

      if (can_view_orgchart) {
        buttonActions.push({
          'aria-label': t('navigation.view-in-orgchart'),
          tooltipContent: t('navigation.view-in-orgchart'),
          icon: icons.orgChart,
          metadata: {
            testId: TEST_IDS.EMPLOYEE_HEADER_ORG_CHART,
          },
          onClick: () => {
            router.push(generateOrgChartLink({ employeeId, filters: [] }));
          },
        });
      }

      if (can_impersonate) {
        buttonActions.push({
          'aria-label': t('navigation.login-as-employee'),
          tooltipContent: t('navigation.login-as-employee'),
          icon: icons.personArrowsCirclepath,
          metadata: {
            testId: TEST_IDS.EMPLOYEE_HEADER_IMPERSONATE,
          },
          onClick: () => {
            router.push(`/account/login-as-employee/${employeeId}`);
          },
        });
      }

      if (isRehireOn && can_be_rehired) {
        topDropdownActions.push({
          name: t('rehire-employee'),
          icon: icons.arrowsCirclepath,
          disabled: !isValidRehire,
          tooltipContent: reason,
          metadata: { testId: 'rehire-menu-item' },
          onSelect: () => {
            track(AMPLITUDE_EVENT_STARTED_REHIRING, {
              past_rehired_employee_id: employeeId,
            });
            if (!terminationDate || isFuture(new Date(terminationDate))) {
              if (can_terminate_employee) openTerminationDialog('rehire');
              else {
                openDialog({
                  key: DialogsKeys.REHIRE_NO_TERMINATION_PERMISSION_INFO,
                  Component: lazy(() =>
                    import('../components/InfoDialog/InfoDialog').then(
                      ({ InfoDialog }) => ({
                        default: InfoDialog,
                      }),
                    ),
                  ),
                  props: {
                    variant: DialogsKeys.REHIRE_NO_TERMINATION_PERMISSION_INFO,
                  },
                });
              }
            } else {
              router.push(`/staff/rehire/${employeeId}`);
            }
          },
        });
      }

      if (can_create_employment && isEmploymentContractOn) {
        topDropdownActions.push({
          name: t('create-employment'),
          icon: icons.arrowsCirclepath,
          metadata: {
            testId: `${TEST_IDS.EMPLOYEE_HEADER_DROPDOWN_ACTIONS}-create-employment`,
          },
          onSelect: () => {
            router.push(`/staff/contract/${employeeId}`);
          },
        });
      }

      if (can_manage_account) {
        topDropdownActions.push({
          name: t('navigation.manage-account'),
          icon: icons.lines3HorizontalPencil,
          metadata: {
            testId: `${TEST_IDS.EMPLOYEE_HEADER_DROPDOWN_ACTIONS}-manage`,
          },
          onSelect: () => {
            router.push(`/staff/account/${employeeId}`);
          },
        });
      }

      if (can_set_reminder) {
        topDropdownActions.push({
          name: t('navigation.reminders'),
          icon: icons.clock,
          metadata: {
            testId: `${TEST_IDS.EMPLOYEE_HEADER_DROPDOWN_ACTIONS}-reminder`,
          },
          onSelect: () => {
            router.push(`/reminders/employee/${employeeId}`);
          },
        });
      }

      if (application) {
        //TODO: add data-eid=application.id
        topDropdownActions.push({
          name: t('applicant-profile'),
          icon: icons.personArrowUp,
          metadata: {
            testId: `${TEST_IDS.EMPLOYEE_HEADER_DROPDOWN_ACTIONS}-application`,
          },
          onSelect: () => {
            router.push(`${application.url}`);
          },
        });
      }

      if (can_schedule_leave) {
        topDropdownActions.push({
          name: t('schedule-leave'),
          icon: icons.calendar,
          metadata: {
            testId: `${TEST_IDS.EMPLOYEE_HEADER_DROPDOWN_ACTIONS}-scheduleLeave`,
          },
          tooltipContent: isRehiredProfile
            ? tRehire('validation.schedule-leave-in-past-profile')
            : undefined,
          disabled: isRehiredProfile,
          onSelect: () => {
            openDialog({
              key: DialogsKeys.SCHEDULE_EMPLOYEE_LEAVE,
              Component: lazy(() =>
                import(
                  '@personio-web/employees-organizations-feature-schedule-employee-leave-dialog'
                ).then(({ ScheduleEmployeeLeaveDialog }) => ({
                  default: ScheduleEmployeeLeaveDialog,
                })),
              ),
              props: { employeeId },
            });
          },
        });
      }

      if (can_terminate_employee) {
        topDropdownActions.push({
          name: t('terminate-employee'),
          icon: icons.exclamationMarkTriangle,
          metadata: {
            testId: `${TEST_IDS.EMPLOYEE_HEADER_DROPDOWN_ACTIONS}-terminate`,
          },
          onSelect: () => {
            openTerminationDialog('default');
          },
        });
      }

      if (can_delete_employee) {
        bottomDropdownActions.push({
          name: t('delete'),
          icon: icons.trash,
          metadata: {
            testId: `${TEST_IDS.EMPLOYEE_HEADER_DROPDOWN_ACTIONS}-delete`,
          },
          variant: 'destructive',
          disabled: isLookingAtOwnProfile,
          tooltipContent: isLookingAtOwnProfile
            ? tEmployeeDialog('error.delete-own-profile')
            : undefined,
          onSelect: () => {
            openDialog({
              key: DialogsKeys.DELETE_EMPLOYEE,
              Component: lazy(() =>
                import(
                  '@personio-web/employees-organizations-feature-delete-employee-dialog'
                ).then(({ DeleteEmployeeDialog }) => ({
                  default: DeleteEmployeeDialog,
                })),
              ),
              props: { employeeId },
            });
          },
        });
      }
    }

    return {
      buttonActions,
      topDropdownActions,
      bottomDropdownActions,
    };
  }, [data, isRehiredProfile]);
};
