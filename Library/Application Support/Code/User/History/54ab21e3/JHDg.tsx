import type { Meta, StoryFn } from '@storybook/react';
import { PersonSystemAttribute } from '@personio-web/eo-commons-org-chart-link';
import { Icon } from 'designSystem/component/icon';
import { getAttributeIcon } from './getAttributeIcon';

const config: Meta = {
  id: 'get-attribute-icon',
  title: 'Employees Organizations/Features/Attribute Icons',
  argTypes: {
    // Add your argTypes here
  },
};

const iconsToRender = [
  PersonSystemAttribute.ID,
  PersonSystemAttribute.FirstName,
  PersonSystemAttribute.LastName,
  PersonSystemAttribute.PreferredName,
  PersonSystemAttribute.Email,
  PersonSystemAttribute.Department,
  PersonSystemAttribute.Team,
  PersonSystemAttribute.Supervisor,
  PersonSystemAttribute.Office,
  PersonSystemAttribute.Position,
  PersonSystemAttribute.LegalEntity,
  PersonSystemAttribute.CostCenter,
  PersonSystemAttribute.Status,
  PersonSystemAttribute.BirthDate,
  PersonSystemAttribute.Gender,
  PersonSystemAttribute.EmploymentType,
  PersonSystemAttribute.TerminationType,
  PersonSystemAttribute.TerminationReason,
  PersonSystemAttribute.HireDate,
  PersonSystemAttribute.TerminationDate,
  PersonSystemAttribute.ContractEndDate,
  PersonSystemAttribute.NoticeAnnounced,
  PersonSystemAttribute.LastWorkingDay,
  PersonSystemAttribute.LengthOfProbation,
  PersonSystemAttribute.ProbationPeriodEnd,
  PersonSystemAttribute.WeeklyWorkingHours,
  PersonSystemAttribute.FullTimeWeeklyWorkingHours,
  PersonSystemAttribute.Children,
  PersonSystemAttribute.FixedSalary,
  PersonSystemAttribute.HourlySalary,
  PersonSystemAttribute.FTE,
  PersonSystemAttribute.EmployeeRoles,
  PersonSystemAttribute.InvitationStatus,
  PersonSystemAttribute.LastLogin,
  PersonSystemAttribute.WorkSchedule,
  PersonSystemAttribute.OvertimeBalance,
  PersonSystemAttribute.OvertimeLimit,
  PersonSystemAttribute.OnboardingStatus,
  PersonSystemAttribute.OffboardingStatus,
];

function getEnumKeyByValue(value: string): string | undefined {
  return (
    Object.keys(PersonSystemAttribute) as unknown as Array<
      keyof typeof PersonSystemAttribute
    >
  ).find((key) => PersonSystemAttribute[key] === value);
}

function splitByCapitalLetters(input: string): string[] {
  return input.split(/(?=[A-Z])/);
}

function getIconLabel(icon: string): string {
  const key = getEnumKeyByValue(icon);
  if (!key) return icon;
  if (key === 'ID' || key === 'FTE') return key;
  return splitByCapitalLetters(key).join(' ');
}

const AttributeIconsStory: StoryFn = () => {
  return (
    <div>
      {iconsToRender.map((icon) => (
        <div
          key={icon}
          style={{ display: 'flex', alignItems: 'center', padding: 16, gap: 4 }}
        >
          <Icon icon={getAttributeIcon(icon)} />
          {getIconLabel(icon)}
        </div>
      ))}
    </div>
  );
};

export const AttributeIcons = AttributeIconsStory.bind({});

export default config;
