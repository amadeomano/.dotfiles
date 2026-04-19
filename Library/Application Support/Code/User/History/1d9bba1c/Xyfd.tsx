import { Avatar } from 'designSystem/component/avatar';
import { Button } from 'designSystem/component/button';
import { Icon, icons } from 'designSystem/component/icon';
import { useGetEmployeeProfile } from '@personio-web/payroll-data-preliminary-payroll';
import { Skeleton } from '@personio-web/payroll-component-skeleton';
import styles from './BasicEmployeeSidepanelHeader.module.scss'; // TODO Move header specific things closer
import { useTranslation } from 'react-i18next';
import { useNavigation } from '../../../integrations/preliminary/hooks/useNavigation';
import { redirectToEmployeeProfile } from '../../../utils';

type Employee = {
  full_name: string;
  avatar: string;
  designation: string;
};

type BasicEmployeeSidepanelHeaderProps = {
  employeeId?: string;
};

export const BasicEmployeeSidepanelHeader = () => {
  const { t } = useTranslation('payroll');

  const { employeeId, asPath, push } = useNavigation();

  const { data: profileResponse, isLoading } = useGetEmployeeProfile({
    requestPathParams: { employeeId: employeeId! },
  });

  const redirectToEmployee = () => {
    const redirectEmployeeUrl = redirectToEmployeeProfile({
      asPath,
    });
    push(redirectEmployeeUrl);
  };

  const employee = profileResponse?.data as Employee;

  if (isLoading || !employeeId) {
    return (
      <div className={styles.primaryLayout}>
        <Skeleton
          className={styles.avatarSkeleton}
          width="96px"
          height="96px"
        />
        <div className={styles.skeletonBlockPrimary}>
          <Skeleton width="60%" className={styles.firstItem}></Skeleton>
          <Skeleton width="30%"></Skeleton>
          <Skeleton width="45%"></Skeleton>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.primaryLayout}>
      <div className={styles.avatar}>
        <Avatar
          src={employee.avatar}
          name={`${employee.full_name}`}
          size="full"
        />
      </div>
      <div className={styles.headerBlockPrimary}>
        <h2>{`${employee.full_name}`}</h2>
        {employee.designation && (
          <div className={styles.iconInfo}>
            <Icon icon={icons.briefcase} size="large" color="secondary"></Icon>
            <p>{employee.designation}</p>
          </div>
        )}
        <div className={styles.viewProfileButton}>
          <Button
            fullWidth={true}
            onClick={redirectToEmployee}
            icon={icons.person}
          >
            {t('features.employee-sidepanel.header.view-profile')}
          </Button>
        </div>
      </div>
    </div>
  );
};
