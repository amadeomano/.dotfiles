import { type IconSVGComponent, icons } from 'designSystem/component/icon';
import {
  PersonSystemAttribute,
  type PersonAttribute,
} from '@personio-web/employees-organizations-util-people';

const iconBySystemAttribute: Partial<
  Record<PersonAttribute, IconSVGComponent>
> = {
  [PersonSystemAttribute.ID]: icons.badgeIdHorizontal,
  [PersonSystemAttribute.FirstName]: icons.person,
  [PersonSystemAttribute.LastName]: icons.person,
  [PersonSystemAttribute.PreferredName]: icons.person,
  [PersonSystemAttribute.Email]: icons.atSign,
  [PersonSystemAttribute.Department]: icons.personCircle,
  [PersonSystemAttribute.Team]: icons.circles2Overlapping,
  [PersonSystemAttribute.Supervisor]: icons.personArrowUp,
  [PersonSystemAttribute.Office]: icons.pin,
  [PersonSystemAttribute.PermanentEstablishmentId]: icons.pin,
  [PersonSystemAttribute.Position]: icons.briefcase,
  [PersonSystemAttribute.LegalEntity]: icons.buildingOffice,
  [PersonSystemAttribute.CostCenter]: icons.moneyBag,
  [PersonSystemAttribute.Status]: icons.pulse,
  [PersonSystemAttribute.BirthDate]: icons.birthdayCake,
  [PersonSystemAttribute.Gender]: icons.person,
  [PersonSystemAttribute.EmploymentType]: icons.tag,
  [PersonSystemAttribute.TerminationType]: icons.receipt,
  [PersonSystemAttribute.TerminationReason]: icons.infoCircle,
  [PersonSystemAttribute.HireDate]: icons.calendarCheckmark,
  [PersonSystemAttribute.TerminationDate]: icons.calendarCross,
  [PersonSystemAttribute.ContractEndDate]: icons.calendarCross,
  [PersonSystemAttribute.NoticeAnnounced]: icons.calendar,
  [PersonSystemAttribute.LastWorkingDay]: icons.calendar,
  [PersonSystemAttribute.LengthOfProbation]: icons.calendar,
  [PersonSystemAttribute.ProbationPeriodEnd]: icons.calendar,
  [PersonSystemAttribute.WeeklyWorkingHours]: icons.clock,
  [PersonSystemAttribute.FullTimeWeeklyWorkingHours]: icons.clock,
  [PersonSystemAttribute.Children]: icons.person,
  [PersonSystemAttribute.FixedSalary]: icons.moneyStack,
  [PersonSystemAttribute.HourlySalary]: icons.moneyStack,
  [PersonSystemAttribute.FTE]: icons.barChart,
  [PersonSystemAttribute.EmployeeRoles]: icons.infoCircle,
  [PersonSystemAttribute.InvitationStatus]: icons.pulse,
  [PersonSystemAttribute.LastLogin]: icons.clock,
  [PersonSystemAttribute.WorkSchedule]: icons.clock,
  [PersonSystemAttribute.OvertimeBalance]: icons.clock,
  [PersonSystemAttribute.OvertimeLimit]: icons.clock,
  [PersonSystemAttribute.OnboardingStatus]: icons.pulse,
  [PersonSystemAttribute.OffboardingStatus]: icons.pulse,
  [PersonSystemAttribute.JobName]: icons.briefcase,
  [PersonSystemAttribute.JobFamily]: icons.briefcase,
  [PersonSystemAttribute.JobTrack]: icons.arrowTriangleBranch,
  [PersonSystemAttribute.JobLevel]: icons.stairs,
};

export const getAttributeIcon = (
  attributeId: PersonAttribute,
): IconSVGComponent => {
  return iconBySystemAttribute[attributeId] || icons.infoCircle;
};
