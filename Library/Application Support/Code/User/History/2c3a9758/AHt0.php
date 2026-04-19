<?php

namespace Workzag\Service\Payroll;

use App;
use AttributeLog;
use AttributeNotFoundException;
use Carbon\Carbon;
use Carbon\Exceptions\InvalidFormatException;
use Client\todos\PayrollReview;
use Company;
use DB;
use Employee;
use EmployeeInfoSection;
use EmployeePreference;
use EmployeeSalary;
use EmployeeSalaryValue;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use InvalidArgumentException;
use LanguageHelper;
use NoAccessException;
use PayrollExport;
use PayrollSetting;
use Personio\Auth\Common\Guards\AuthenticationContext;
use Personio\Auth\Entities\IdpUser;
use Personio\Core\Exceptions\GrpcException;
use Personio\Core\Exceptions\HttpRequestException;
use Personio\Core\Exceptions\MaximumRetriesReachedException;
use Personio\Core\FeatureFlags\Domain\Services\FeatureFlagAwareInterface;
use Personio\Core\FeatureFlags\Domain\Services\FeatureFlagAwareTrait;
use Personio\Core\Logger\LoggerInterface;
use Personio\Core\Mailers\MailerService;
use Personio\Core\Mailers\PayrollReviewMailerJob;
use Personio\Core\Rights\AuthorizationException;
use Personio\CoreHR\AttributeLog\Repositories\AttributeLogRepository;
use Personio\CoreHR\Common\FeatureFlags;
use Personio\CoreHR\LegalEntities\LegalEntity;
use Personio\HRM\AbsenceBalance\Exceptions\AbsenceBalanceException;
use Personio\HRM\Attributes\Services\AttributeDefinitionsService;
use Personio\HRM\Attributes\ValueObjects\AttributeDefinition;
use Personio\HRM\Exports\ExcelExporter;
use Personio\HRM\Exports\ExportConfigurationService;
use Personio\HRM\Exports\Infrastructure\GenericExport;
use Personio\HRM\Payroll\Api\PreliminaryPayroll\Enums\TabEnum;
use Personio\HRM\Payroll\BonusSalary\Infrastructure\BonusSalaryEnum;
use Personio\HRM\Payroll\Compensation\Domain\CompensationValue;
use Personio\HRM\Payroll\Compensation\Domain\CompensationValueInterface;
use Personio\HRM\Payroll\Compensation\Domain\HourlySalaryOverrideOrBonusPayoutInterface;
use Personio\HRM\Payroll\Compensation\Infrastructure\Exceptions\CompensationServiceException;
use Personio\HRM\Payroll\Compensation\Infrastructure\OneTimeCompensationRepository;
use Personio\HRM\Payroll\Core\Enums\SalaryEnum;
use Personio\HRM\Payroll\Core\Enums\SalaryIntervalEnum;
use Personio\HRM\Payroll\Core\Enums\SalaryOriginEnum;
use Personio\HRM\Payroll\Core\Repositories\EmployeeSalaryRepository;
use Personio\HRM\Payroll\Core\Services\PayrollStatusService;
use Personio\HRM\Payroll\Domain\EmployeeSalary\Exceptions\InvalidSalaryOwnerException;
use Personio\HRM\Payroll\Domain\EmployeeSalary\Exceptions\SameSalaryDateException;
use Personio\HRM\Payroll\Domain\EmployeeSalary\Jobs\SyncEmployeeSalariesJob;
use Personio\HRM\Payroll\Domain\PayrollDetail\Interfaces\PayrollDataInterface;
use Personio\HRM\Payroll\Domain\PayrollDetail\ValueObjects\PayrollDetail;
use Personio\HRM\Payroll\Domain\Setting\Services\PayrollSettingService;
use Personio\HRM\Payroll\MainSalary\Core\Infrastructure\MainSalaryEnum;
use Personio\HRM\Payroll\PreliminaryPayroll\Services\BillingPeriodService;
use Personio\HRM\Payroll\PreliminaryPayroll\Services\PreliminaryPayrollDataService;
use Personio\HRM\Payroll\SalaryProration\Enums\ProrateMode;
use Personio\HRM\Salary\Domain\ValueObjects\EmployeeCustomSalaryCompensationTypeInterface;
use Personio\HRM\Salary\Domain\ValueObjects\EmployeeSalaryPaymentInterface;
use Personio\HRM\Salary\Domain\WeeklyWorkingHoursService;
use Personio\Internal\Events\Event;
use Personio\Internal\Events\EventPublishService;
use Personio\Messages\Auditlog\V0\ChangeData\ChangeType;
use Personio\Payroll\GrossCompensationCalculation\Entities\GrossCompensationCalculationOutput;
use Personio\Payroll\GrossCompensationCalculation\Services\GrossCompensationCalculationService;
use Personio\Payroll\Infrastructure\Client\PayrollConfigurationClient;
use Personio\Payroll\Infrastructure\Client\PersonioPayrollMode;
use Personio\PreliminaryPayroll\Domain\PayrollContext;
use Right;
use Subcompany;
use Throwable;
use TimeOffType;
use UnexpectedValueException;
use ValidationException;
use Workzag\Exceptions\LocalizedValidationException;
use Workzag\models\OvertimePayoutInterface;
use Workzag\Repositories\Payroll\AdditionalCompensationTypeRepository;
use Workzag\Repositories\Payroll\PayrollExportRepository;
use Workzag\Repositories\Salary\EmployeeSalaryValueRepository;
use Workzag\Service\Cache\CacheInterface;
use Workzag\Service\Rights\RightsService;
use Workzag\Service\Staff\AttributeService;
use Workzag\Service\Staff\EmployeeService;
use Workzag\Service\Staff\ScheduledChangeService;
use Workzag\Service\TimeOff\TimeOffService;

/**
 * @affectsAccessRights
 */
class PayrollService implements FeatureFlagAwareInterface
{
    use FeatureFlagAwareTrait;

    /** @deprecated */
    const PAYROLL_TAB_PERSONAL = TabEnum::PERSONAL;
    /** @deprecated */
    const PAYROLL_TAB_SALARY = TabEnum::SALARY;
    /** @deprecated */
    const PAYROLL_TAB_ABSENCE = TabEnum::ABSENCE;

    const INDEX_MAIN_SALARY = 'main-salary';
    const INDEX_BONUS_SALARY = 'bonus-salary';
    const INDEX_CUSTOM_SALARY = 'custom-salary';

    /**
     * This FF is only being used for logging purposes to monitor if we have any personioPayroll companies missing from
     * the Personio Payroll Enabled FF segments in SPLIT.
     *
     * Once these segments are no longer in use, this FF and the logging can go away.
     **/
    const FF_USING_PERSONIOPAYROLL_SEGMENTS = 'PAYINIT-109-new-proration-value-in-ui';

    const SALARY_ATTRIBUTE_PREFIX = 'salary:';
    const EXTRA_PAYMENT_SALARY_ATTRIBUTE_PREFIX = 'salary-extra:';

    const FIX_SALARY = 'fix_salary';
    const HOURLY_SALARY = 'hourly_salary';
    const SALARY_ATTRIBUTE_LOGS_NAMES = [self::FIX_SALARY, self::HOURLY_SALARY];

    private MainSalaryProcessor $mainSalaryProcessor;
    private BonusSalaryProcessor $bonusSalaryProcessor;
    private SalaryComponentProcessor $salaryComponentProcessor;
    private ?ExcelPayrollProcessor $excelDataProcessor = null;

    public function __construct(
        private readonly PayrollExportRepository $payrollExport,
        private readonly EmployeeSalaryValueRepository $employeeSalaryValueRepository,
        private readonly AdditionalCompensationTypeRepository $additionalCompensationTypeRepository,
        private readonly AttributeLogRepository $attributeLogRepository,
        private readonly CacheInterface $cache,
        private readonly OneTimeCompensationRepository $oneTimeCompensationRepository,
        private readonly EmployeeSalaryRepository $employeeSalaryRepository,
        private readonly LoggerInterface $logger,
        private readonly PayrollTodoTaskService $payrollTodoTaskService,
        private readonly BillingPeriodService $billingPeriodService,
        private readonly PreliminaryPayrollDataService $preliminaryPayrollDataService,
        private readonly PayrollConfigurationClient $payrollConfigurationClient,
    ) {
    }

    private function getTimeOffService(): TimeOffService
    {
        return app(TimeOffService::class);
    }

    private function getAttributeService(): AttributeService
    {
        return app(AttributeService::class);
    }

    private function getRightsService(): RightsService
    {
        return app(RightsService::class);
    }

    private function getExcelExporter(): ExcelExporter
    {
        return app(ExcelExporter::class);
    }

    private function getScheduledChangeService(): ScheduledChangeService
    {
        return app(ScheduledChangeService::class);
    }

    private function getWeeklyWorkingHoursService(): WeeklyWorkingHoursService
    {
        return app(WeeklyWorkingHoursService::class);
    }

    private function getExportConfigurationService(): ExportConfigurationService
    {
        return app(ExportConfigurationService::class);
    }

    private function getPayrollDataService(): PayrollDataService
    {
        return app(PayrollDataService::class);
    }

    private function getPayrollStatusService(): PayrollStatusService
    {
        return app(PayrollStatusService::class);
    }

    private function getPayrollSettingService(): PayrollSettingService
    {
        return app(PayrollSettingService::class);
    }

    private function getEmployeeService(): EmployeeService
    {
        return app(EmployeeService::class);
    }

    private function getAttributeDefinitionsService(): AttributeDefinitionsService
    {
        return app(AttributeDefinitionsService::class);
    }

    private function getEmployeeSalaryRepository(): EmployeeSalaryRepository
    {
        return app(EmployeeSalaryRepository::class);
    }

    private function getGrossCompensationCalculationService(): GrossCompensationCalculationService
    {
        return app(GrossCompensationCalculationService::class);
    }

    /**
     * Map a list of human readable string into payroll attributes, eg:
     * Given
     *   [First name, Last name]
     *
     * It will result in:
     *   [first_name, last_name]
     *
     * @param Company $company
     * @param array $formattedAttributes
     * @return array
     *
     * @throws InvalidArgumentException if any string can't be mapped to a payroll attribute.
     */
    public function mapHumanReadableStringsToPayrollAttributes(Company $company, array $formattedAttributes): array
    {
        $flipTrim = function (array $values) {
            return array_flip(
                array_map(
                    function ($val) {
                        return trim($val);
                    },
                    $values
                )
            );
        };
        $employeeAttributes = $flipTrim(
            $this->getAttributeService()->getEmployeeInfoAttributeHashes($company)
        );
        $payrollAttributes = $flipTrim($this->getPayrollSettingService()->getPayrollAttributes($company));
        $timeOffAttributes = $flipTrim($this->getTimeOffService()->getExportAttributes());

        /**
         * Flip before merging to be sure to have a more predictable outcome in case of same name attributes
         */
        $attributeMap = array_merge(
            $employeeAttributes,
            $timeOffAttributes,
            $payrollAttributes
        );

        $result = [];
        foreach ($formattedAttributes as $attribute) {
            $attribute = trim($attribute);

            if (isset($attributeMap[$attribute])) {
                $result[] = $attributeMap[$attribute];
            } else {
                throw new InvalidArgumentException("Cannot process the following attribute: '$attribute'");
            }
        }

        return $result;
    }

    public function getAdditionalSalaryTypes(Company $company = null)
    {
        return $this->getPayrollDataService()->getAdditionalSalaryTypes($company)
            ->sortBy('name')
            ->values();
    }

    /**
     * Sets the new employee salary. This method is kept for compatibility with the `Employee` model.
     *
     * @param Employee $employee The employee that will receive the new salary
     * @param string $salaryType In case of custom salaries, it should be the attribute name
     * @param mixed $value The new salary
     * @param float $since Effective date of the change (seconds since epoch)
     * @return EmployeeSalary The new salary entity
     *
     * @throws SameSalaryDateException if $ignoreSameSalaryDate is false and non-virtual salary already exists for the
     *     same period (after $since)
     * @throws InvalidArgumentException if compensation type $salaryType is not a standard type, and a custom
     *    compensation type does not exist with the ID $salaryType.
     * @throws AuthorizationException if `$salaryType` is {@see MainSalaryEnum::FIX} and authenticated user does not
     *     have weekly working hours edit rights.
     * @throws AttributeNotFoundException if `$salaryType` is {@see MainSalaryEnum::FIX} and `$employee` does not
     *     have a 'weekly_working_hours' attribute.
     * @throws Exception if `$salaryType` is a custom compensation type but the custom compensation type with ID
     *    `$salaryType` does not exist.
     */
    public function updateSalary(
        Employee $employee,
        string $salaryType,
        $value,
        float $since
    ): CompensationValueInterface {
        return $this->updateSalaryInternal($employee, $salaryType, $value, $since);
    }

    /**
     * Applies a salary update by first normalizing the `value`, taking into account the working hours of reference.
     *
     * **Example:** setting a salary of 500 to an employee working one third of the department time will make a change to the total salary to 1500.
     * This way, the employee will effectively receive 500.
     *
     * @param Employee $employee The employee that will receive the new salary
     * @param string $salaryType In case of custom salaries, it should be the attribute name
     * @param float $value The new effective salary
     * @param float $since Effective date of the change (seconds since epoch)
     * @return EmployeeSalary The new salary entity
     *
     * @throws UnexpectedValueException if `$salaryType` is not a main salary type.
     * @throws ValidationException if weekly working hours value is 0.
     * @throws AttributeNotFoundException if `$salaryType` is {@see MainSalaryEnum::FIX} and `$employee` does not
     *     have a 'weekly_working_hours' attribute.
     */
    public function updateSalaryWithWorkingHoursNormalization(
        Employee $employee,
        string $salaryType,
        float $value,
        float $since,
        string $interval = SalaryIntervalEnum::MONTHLY
    ): CompensationValueInterface {
        if (!in_array($salaryType, MainSalaryEnum::all())) {
            throw new UnexpectedValueException('Normalization can only be applied on main salaries');
        }

        if ($employee->getWeeklyWorkingHoursAttribute() == 0) {
            throw new ValidationException(tt('errors.payroll.weekly-hours-empty'));
        }

        $multiplier = $employee->getFullTimeWeeklyWorkingHours() / $employee->getWeeklyWorkingHoursAttribute();
        $fteEquivalentValue = round($value * $multiplier, 2);

        return $this->updateSalaryInternal(
            $employee,
            $salaryType,
            $fteEquivalentValue,
            $since,
            1,
            true,
            $interval,
            null,
            false,
            true
        );
    }

    /**
     * Sets the new employee salary.
     *
     * **Note**: This method outgrew its context quite a bit and it's `public` ONLY for the sake of testing.
     * Please don't use this method directly in new code.
     *
     * @param Employee $employee The employee that will receive the new salary
     * @param string $salaryType In case of custom salaries, it should be the attribute name
     * @param mixed $value The new salary
     * @param float $since Effective date of the change (seconds since epoch)
     * @param float $partTimeValue A scalar in the range 0-1 defining the work time compared to the reference weekly working hours of the employee or department
     * @param bool $ignoreSameSalaryDate Set to `true` to avoid an exception when trying to set a salary for the same date as an existing one
     * @param string $interval A value from `SalaryIntervalEnum`
     * @param int|null $month Change the salary only for a specific month
     * @param bool $shouldUpdateExistingSalary Acts on different salaries (additional salaries only)
     * @param bool $useEmployeeWeeklyHours Use the employee's working hours as a reference, instead of the department ones
     * @return EmployeeSalary The new salary entity
     *
     * @throws SameSalaryDateException if `$salaryType` is in {@see EmployeeSalary::$MAIN_SALARY_TYPES} and
     *   `$ignoreSameSalaryDate` is false and non-virtual salary already exists for the same period (after `$since`)
     * @throws AuthorizationException if `$salaryType` is {@see MainSalaryEnum::FIX} and authenticated user does not
     *    have weekly working hours edit rights.
     * @throws AttributeNotFoundException if `$salaryType` is {@see MainSalaryEnum::FIX} and `$employee` does not
     *    have a 'weekly_working_hours' attribute.
     * @throws ValidationException if `$salaryType` is {@see MainSalaryEnum::FIX}, _and_ `$since` is a date in the
     *    future, _and_ `$weeklyHours` is over 4000 (!) digits long.
     * @throws Exception if `$salaryType` is a custom compensation type but the custom compensation type with ID
     *   `$salaryType` does not exist.
     */
    public function updateSalaryInternal(
        Employee $employee,
        string $salaryType,
        $value,
        float $since,
        float $partTimeValue = 1,
        bool $ignoreSameSalaryDate = false,
        string $interval = SalaryIntervalEnum::MONTHLY,
        ?int $month = null,
        bool $shouldUpdateExistingSalary = false,
        bool $useEmployeeWeeklyHours = false
    ) {
        if (in_array($salaryType, EmployeeSalary::$MAIN_SALARY_TYPES)) {
            return $this->updateMainSalaryByWWH(
                $employee,
                $salaryType,
                $value,
                $interval,
                $partTimeValue * ($useEmployeeWeeklyHours ?
                    $employee->getWeeklyWorkingHoursAttribute() : $employee->getFullTimeWeeklyWorkingHours()),
                $since,
                $ignoreSameSalaryDate,
                $month
            );
        } elseif (in_array($salaryType, EmployeeSalary::$BONUS_SALARY_TYPES)) {
            return $this->updateBonusSalary($employee, $salaryType, $value, $interval, $since, $month);
        } else {
            preg_match('/\d+/', $salaryType, $match);
            $salaryId = intval($match[0]);
            try {
                return $this->updateAdditionalSalary(
                    $employee,
                    $salaryId,
                    $value,
                    $since,
                    $interval,
                    $month,
                    $shouldUpdateExistingSalary
                );
            } catch (Throwable $e) {
                throw new Exception('Cannot update additional salary ' . $e->getMessage(), 0, $e);
            }
        }
    }

    /**
     * Update by Weekly Working Hours
     *
     * When creating a Fixed or Hourly salary, this method is called. The Salary is built here and then
     * uses the repository to save the new salary.
     *
     * @throws SameSalaryDateException if `$ignoreSameSalaryDate` is false and non-virtual salary already exists for
     *   the same period (after `$since`)
     * @throws AuthorizationException if `$salaryType` is {@see MainSalaryEnum::FIX} and authenticated user does not
     *   have weekly working hours edit rights.
     * @throws InvalidArgumentException if `$salaryType` is not in {@see EmployeeSalary::$MAIN_SALARY_TYPES}
     * @throws AttributeNotFoundException if `$salaryType` is {@see MainSalaryEnum::FIX} and `$employee` does not
     *   have a 'weekly_working_hours' attribute.
     * @throws ValidationException if `$salaryType` is {@see MainSalaryEnum::FIX}, _and_ `$since` is a date in the
     *   future, _and_ `$weeklyHours` is over 4000 (!) digits long.
     *
     * @SuppressWarnings(PHPMD.CyclomaticComplexity)
     */
    public function updateMainSalaryByWWH(
        Employee $employee,
        string $salaryType,
        float $value,
        ?string $salaryInterval,
        float $weeklyHours,
        int $since,
        bool $ignoreSameSalaryDate = false,
        ?string $month = null,
        ?string $actionOrigin = SalaryOriginEnum::MANUAL_ADD,
        ?IdpUser $_idpUser = null
    ): CompensationValueInterface {
        if (!in_array($salaryType, EmployeeSalary::$MAIN_SALARY_TYPES)) {
            throw new InvalidArgumentException();
        }

        if ($weeklyHours < 0) {
            throw new InvalidArgumentException("Weekly working hours cannot be negative");
        }

        // We allow passing Idp user so we can run this code on an async job
        $idpUser = $_idpUser instanceof IdpUser ? $_idpUser : AuthenticationContext::user();

        // PER-5025
        $since = $this->getValidSinceTimestampForEmployee(
            $employee,
            // make sure we always have $since at start of the day
            Carbon::createFromTimestamp($since)->startOfDay()->timestamp
        );

        $salary = $this->findNonVirtualSalaryByDate($employee, $since);

        // Don't allow salaries for the same date
        if (!$ignoreSameSalaryDate && $salary !== null) {
            throw new SameSalaryDateException($employee, $since);
        }

        if ($salaryType === EmployeeSalary::TYPE_SALARY_FIX) {
            $weeklyHours = round(floatval($weeklyHours), 2);
            $this->updatePartTime(
                $idpUser,
                $employee,
                $weeklyHours,
                $since
            );
        }

        if ($salary === null) {
            $savedSalary = $this->employeeSalaryRepository->saveMainSalary(
                companyId: $employee->company->id,
                employeeId: $employee->id,
                salaryType: $salaryType,
                since: date('Y-m-d', $since),
                value: $value,
                interval: $salaryInterval ?: EmployeeSalary::INTERVAL_MONTHLY,
                payoutMonth: $month,
                actionOrigin: $actionOrigin,
            );
        } else {
            $savedSalary = $this->employeeSalaryRepository->updateMainSalary(
                ulid: $salary->ULID,
                companyId: $employee->company->id,
                employeeId: $employee->id,
                since: date('Y-m-d', $since),
                value: $value,
                type: $salaryType,
                compensationTypeId: $salary->getCompensationTypeId(),
                actionOrigin: $actionOrigin,
            );
        }
        $this->publishSalaryCreated($savedSalary);
        $this->dispatchSalarySyncJob(
            company: app()->company(),
            employeeId: $employee->getId(),
        );
        return $savedSalary;
    }

    private function findNonVirtualSalaryByDate(Employee $employee, int $since): ?CompensationValueInterface
    {
        $currentMainSalaryTable = $this->getMainSalaryTable($employee);
        if (empty($currentMainSalaryTable)) {
            return null;
        }

        foreach ($currentMainSalaryTable as $currentSalary) {
            if (empty($currentSalary['virtual']) && $currentSalary['since'] === $since) {
                return $this->getEmployeeSalary($currentSalary);
            }
        }
        return null;
    }

    public function hasNonVirtualSalaryOnDate(Employee $employee, int $since): bool
    {
        $salary = $this->findNonVirtualSalaryByDate($employee, $since);
        return $salary !== null;
    }

    /**
     * @param $currentSalary
     * @return CompensationValueInterface|null
     */
    private function getEmployeeSalary($currentSalary): ?CompensationValueInterface
    {
        $salary = $this->employeeSalaryRepository->findByUlid($currentSalary['salary_ulid']);
        return $salary;
    }

    private function publishSalaryCreated($salary)
    {
        $this->publishSalaryCreatedEventByUlid($salary->getUlid(), $salary);
    }

    public function publishSalaryCreatedEventByUlid(string $employeeSalaryUlid, $salaryCreated = null)
    {
        if ($salaryCreated !== null) {
            $this->publishEvent($salaryCreated);
            return;
        }
        $salaryFetched = $this->getEmployeeSalaryRepository()->findByUlid($employeeSalaryUlid);
        $this->publishEvent($salaryFetched);
    }

    private function publishEvent($employeeSalary)
    {
        $event = new Event('employee.salary.created', $employeeSalary->company_id, [
            'id' => $employeeSalary->id,
            'employee_id' => $employeeSalary->employee_id,
            'interval' => $employeeSalary->interval,
            'since' => $employeeSalary->since,
            'value' => $employeeSalary->value,
            'type' => $employeeSalary->type
        ]);
        $eventPublishService = app(EventPublishService::class);
        $eventPublishService->publish($event);
    }

    /**
     * @throws AuthorizationException if authenticated user does not have weekly working hours edit rights.
     * @throws AttributeNotFoundException if `$employee` does not have a 'weekly_working_hours' attribute.
     * @throws ValidationException if `$since` is a date in the future and `$weeklyHours` is over 4000 (!) digits long.
     */
    private function updatePartTime(IdpUser $idpUser, Employee $employee, float $weeklyHours, int $since)
    {
        $weeklyHourBySince = $this->getWeeklyWorkingHoursService()
            ->getEffectiveWeeklyWorkingHoursByDate($employee, Carbon::createFromTimestamp($since));
        if ($weeklyHours == $weeklyHourBySince) {
            return;
        }

        $canEdit = $this->getRightsService()->hasPersonalDataAttributeAccess(
            $idpUser,
            $employee,
            'weekly_working_hours',
            Right::EDIT_RIGHT
        );

        if (!$canEdit) {
            throw new AuthorizationException('weekly_working_hours');
        }

        $this->createArtificialWeeklyWorkingHoursAttributeLogEntryForEmployee($employee, $idpUser);

        $this->updateWeeklyWorkingHoursForEmployee($employee, $weeklyHours, $since, $idpUser);

        if ($since > Carbon::now()->timestamp) {
            $this->getScheduledChangeService()->setScheduledChangeForEmployeeIfNeeded(
                $employee,
                $idpUser,
                Carbon::createFromTimestamp($since),
                'weekly_working_hours',
                $weeklyHours
            );
        }
        $this->dispatchSalarySyncJob(company: app()->company(), employeeId: $employee->getId(), _modifierUserId: $idpUser->getUserId());
    }

    /**
     * Alias of {@see PayrollService::updateMainSalaryByWWH()}
     * @deprecated use {@see PayrollService::updateMainSalaryByWWH()} directly instead.
     */
    public function updateMainSalary(
        Employee $employee,
        $salaryType,
        $value,
        $salaryInterval,
        $partTimeValue,
        int $since,
        $ignoreSameSalaryDate = false,
        $month = null,
        ?string $actionOrigin = SalaryOriginEnum::MANUAL_ADD,
        ?IdpUser $idpUser = null
    ): CompensationValueInterface {
        return $this->updateMainSalaryByWWH(
            $employee,
            $salaryType,
            $value,
            $salaryInterval,
            $partTimeValue * $this->getFullTimeWeeklyWorkingHoursValidOnDate($employee, $since),
            $since,
            $ignoreSameSalaryDate,
            $month,
            $actionOrigin,
            $idpUser
        );
    }

    private function getFullTimeWeeklyWorkingHoursValidOnDate(Employee $employee, int $since): float
    {
        $dateSince = Carbon::createFromTimestamp($since);
        $attributeLog = $this->getAttributeService()->findLatestLogByEmployeeAndKeyBeforeDate($employee, 'full_time_weekly_working_hours', $dateSince);
        return $attributeLog?->new_value ?? Employee::DEFAULT_WEEKLY_WORKING_HOURS;
    }

    /**
     * @param Employee $employee
     * @param int $since
     * @return int
     */
    public function getValidSinceTimestampForEmployee(Employee $employee, int $since)
    {
        // PER-5025 if the employee has hire_date in the future, and since value is before hire_date only create
        // salary with since hire_date, otherwise salary in employee's salary tab will be displayed before hire date
        if ($employee->hire_date) {
            $hireDate = new Carbon($employee->hire_date);
            return ($since < $hireDate->timestamp) ? $hireDate->timestamp : $since;
        }
        return $since;
    }

    private function createArtificialWeeklyWorkingHoursAttributeLogEntryForEmployee(Employee $employee, ?IdpUser $idpUser = null)
    {
        if (
            $employee->hire_date
            && count($this->getAttributeService()->getAttributeHistory(employee: $employee, attributeKey: 'weekly_working_hours', _idpUser: $idpUser)) == 0
        ) {
            $modifierUserId = $idpUser?->getUserId() ?? AuthenticationContext::user()?->getUserId();
            // if we don't have an entry yet, create an artificial first one. otherwise, creating the entry
            // below and calling recalculateAttributeLogHistory on it would reset the entry's date to hire_date
            // (first entry is always reset to hire_date when recalculating)
            $partTimeLog = new AttributeLog();
            $partTimeLog->company_id = $employee->company_id;
            $partTimeLog->model_type = 'Employee';
            $partTimeLog->model_id = $employee->id;
            $partTimeLog->attribute_name = 'weekly_working_hours';
            $partTimeLog->old_value = null;
            $partTimeLog->new_value = $employee->getFullTimeWeeklyWorkingHours();   // standard
            $partTimeLog->modifier_user_id = $modifierUserId;
            $partTimeLog->when = $employee->hire_date;
            $partTimeLog->save();
        }
    }

    private function updateWeeklyWorkingHoursForEmployee(Employee $employee, float $weeklyHours, int $since, ?IdpUser $idpUser = null)
    {
        $modifierUserId = $idpUser?->getUserId() ?? AuthenticationContext::user()?->getUserId();
        $partTimeLog = new AttributeLog();
        $partTimeLog->company_id = $employee->company_id;
        $partTimeLog->model_type = 'Employee';
        $partTimeLog->model_id = $employee->id;
        $partTimeLog->attribute_name = 'weekly_working_hours';
        $partTimeLog->old_value = null; // will be set during recalcalculation below
        $partTimeLog->new_value = $weeklyHours;
        $partTimeLog->modifier_user_id = $modifierUserId;
        $partTimeLog->when = date('Y-m-d', $since);
        $partTimeLog->save();

        // If there is a salary after this one, we do not want to
        // change the weekly working hours associated with it.
        // Therefore, if that date does not already have an attribute
        // log, we need to look up the WWH that were in effect before
        // this new one that we've just added, and create a new
        // attribute log on the date of the next salary that sets it
        // back to that value. For example:
        //
        // Before this new salary is created:
        // Salary on 2024-01-01: 5000 EUR @ 50%
        // Salary on 2024-05-01: 7000 EUR @ 50%
        //
        // There will be no attribute log for WWH on 2024-05-01, because it's the
        // same as 2024-01-01
        //
        // After this salary is created, we want:
        // 2024-01-01: 5000 EUR @ 50%
        // 2024-03-01: 6000 EUR @ 100%
        // 2024-05-01: 7000 EUR @ 50%
        //
        // All three should have an attribute log.
        //
        // There will always also be an attribute log on the
        // employee's hire date. See the
        // `createArtificialWeeklyWorkingHoursAttributeLogEntryForEmployee` function
        // for details.

        $laterSalaryChange = $this->employeeSalaryRepository->getMainSalaryLaterSalaryChange($employee, $partTimeLog->when);

        if ($laterSalaryChange) {
            $alreadyExistsLogOnLaterSalaryDate = false;
            /** @var AttributeLog|null $logBeforeNewOne */
            $latestLogBeforeNewOne = null;

            $historyLogs = $this->getAttributeService()->getAttributeHistory(
                $employee,
                'weekly_working_hours',
            );
            foreach ($historyLogs as $historyLog) {
                if ($historyLog->when == $laterSalaryChange->since) {
                    $alreadyExistsLogOnLaterSalaryDate = true;
                }
                if (strtotime($historyLog->when) < strtotime($partTimeLog->when)) {
                    $latestLogBeforeNewOne = $historyLog;
                }
            }

            if (!$alreadyExistsLogOnLaterSalaryDate && $latestLogBeforeNewOne) {
                // create an entry
                $laterLog = new AttributeLog();
                $laterLog->company_id = $employee->company_id;
                $laterLog->model_type = 'Employee';
                $laterLog->model_id = $employee->id;
                $laterLog->attribute_name = 'weekly_working_hours';
                $laterLog->old_value = null; // This will be set via the recalculation below
                $laterLog->new_value = $latestLogBeforeNewOne->new_value;
                $laterLog->modifier_user_id = $modifierUserId;
                $laterLog->when = $laterSalaryChange->since;
                $laterLog->save();
            }
        }

        $this->getAttributeService()->recalculateWeeklyWorkingHoursLogs($employee, $idpUser);
    }

    /**
     * @param Employee $employee
     * @param int $customTypeId
     * @param float $value
     * @param int $since
     * @param string $interval
     * @param int|null $month
     * @param bool $shouldUpdateExistingSalary
     * @param string|null $actionOrigin
     * @return CompensationValueInterface
     *
     * @throws InvalidArgumentException if compensation type with given `$customTypeId` does not exist.
     */
    public function updateAdditionalSalary(
        Employee $employee,
        int $customTypeId,
        float $value,
        int $since,
        string $interval = EmployeeSalary::INTERVAL_MONTHLY,
        int $month = null,
        bool $shouldUpdateExistingSalary = false,
        ?string $actionOrigin = SalaryOriginEnum::MANUAL_ADD,
    ): CompensationValueInterface {
        $salaryTypeExists = $this->additionalCompensationTypeRepository->existsById($customTypeId);
        if ($salaryTypeExists === false) {
            throw new InvalidArgumentException("There is no Salary Component with ID $customTypeId");
        }

        // PER-5025: can set bonus salary with since before the employee's hire_date
        $since = Carbon::createFromTimestamp($this->getValidSinceTimestampForEmployee($employee, $since));

        $recurringCompensationValue = null;
        if ($shouldUpdateExistingSalary) {
            $recurringCompensationValue = $this->getEmployeeSalaryRepository()->getLastCreatedSalaryCompensationWithSince(
                $employee,
                $customTypeId,
                $since
            );
        }

        $companyId = $employee->company->id;
        if (empty($recurringCompensationValue)) {
            $recurringCompensationValue = $this->employeeSalaryRepository->createRecurringCompensationValue(
                $companyId,
                $employee->id,
                $customTypeId,
                $since,
                $value,
                $interval,
                $month,
                $actionOrigin
            );
        } else {
            $recurringCompensationValue = $this->employeeSalaryRepository->updateRecurringCompensationValueByUlid(
                $recurringCompensationValue->ULID,
                $companyId,
                $employee->id,
                $customTypeId,
                $since,
                $value,
                $interval,
                $month,
                $actionOrigin
            );
        }

        return $recurringCompensationValue;
    }

    /**
     * @param EmployeeSalary $salary
     * @param Carbon $since
     * @param string|null $actionOrigin
     */
    public function updateRecurringCompensationValidSince(
        CompensationValueInterface $salary,
        Carbon $since,
        ?string $actionOrigin = SalaryOriginEnum::MANUAL_ADD,
    ) {
        $this->employeeSalaryRepository->updateRecurringCompensationValueValidSinceByUlid(
            $salary->getUlid(),
            $since,
            $actionOrigin
        );
    }

    /**
     * @param int $employeeId
     * @param int $salaryCompensationId
     * @param Carbon $from
     * @param Carbon $to
     * @return CompensationValueInterface|null
     */
    public function findLatestAdditionalSalaryWithinRange(
        int $employeeId,
        int $salaryCompensationId,
        Carbon $from,
        Carbon $to
    ): ?CompensationValueInterface {
        return $this->getEmployeeSalaryRepository()->findLatestSalaryCompensationWithinRange(
            $employeeId,
            $salaryCompensationId,
            $from,
            $to
        );
    }

    /**
     * @throws InvalidArgumentException if `$salaryType` is not in {@see EmployeeSalary::$BONUS_SALARY_TYPES}
     */
    public function updateBonusSalary(
        Employee $employee,
        $salaryType,
        $value,
        $bonusInterval,
        $since,
        $month = null
    ): CompensationValueInterface {
        if (!in_array($salaryType, EmployeeSalary::$BONUS_SALARY_TYPES)) {
            throw new InvalidArgumentException();
        }

        // PER-5025: can set bonus salary with since before the employee's hire_date
        $since = $this->getValidSinceTimestampForEmployee($employee, $since);

        $salaryValue = ($salaryType == EmployeeSalary::TYPE_BONUS_MAX ? $value : 0);
        $sinceDate = date('Y-m-d', $since);

        return $this->employeeSalaryRepository->saveOrUpdate(
            $employee,
            $salaryType,
            $salaryValue,
            $sinceDate,
            $month,
            $bonusInterval
        );
    }

    public function getCurrentMainSalary(Employee $employee)
    {
        return $this->getMainSalaryOnDate($employee, Carbon::now());
    }

    public function getCurrentMainSalaries(array $employees, array $typeFilter): array
    {
        return $this->getPayrollDataService()->getCurrentEmployeesMainSalary(collect($employees), $typeFilter);
    }

    public function getCurrentSalariesForEmployees(array $employees, array $typeFilter): array
    {
        return $this->getPayrollDataService()->getCurrentSalariesForEmployees(collect($employees), $typeFilter);
    }

    public function getCurrentCustomSalaries(array $employees, array $customTypeFilter = []): array
    {
        return $this->getPayrollDataService()->getCurrentEmployeesCustomSalaries(collect($employees), $customTypeFilter);
    }

    public function getFirstMainSalary(Employee $employee)
    {
        return collect($this->getMainSalaryTable($employee))->sortBy('since')
            ->first();
    }

    public function getMainSalaryOnDate(Employee $employee, Carbon $date)
    {
        $table = $this->getMainSalaryTable($employee);
        return collect($table)->first(function ($salary) use ($date) {
            return $date->timestamp >= $salary['since'];
        });
    }

    public function getLastMainSalary(Employee $employee)
    {
        $table = $this->getMainSalaryTable($employee);
        if (count($table) > 0) {
            return $table[0];
        } else {
            return null;
        }
    }

    public function getMainSalaryTable(Employee $employee): array
    {
        return $this->getPayrollDataService()->getMainSalaryTable($employee);
    }

    public function getLastBonusSalary(Employee $employee)
    {
        $table = $this->getBonusSalaryTable($employee);
        if (count($table) > 0) {
            return $table[0];
        } else {
            return null;
        }
    }

    public function getBonusSalaryTable(Employee $employee)
    {
        return $this->getPayrollDataService()->getBonusSalaryTable($employee);
    }

    public function getBonusSalaryTableForYear(Employee $employee, int $year)
    {
        $bonusSalaryTable = $this->getBonusSalaryTable($employee);
        $bonusSalaryTableForYear =
            collect($bonusSalaryTable)
                ->filter(function ($item) use ($year) {
                    $validSince = Carbon::createFromTimestamp($item['since']);
                    if ($validSince->year <= $year && empty($item['until'])) {
                        return true;
                    }
                    $validUntil = Carbon::createFromTimestamp($item['until']);
                    return $validSince->year <= $year && $year <= $validUntil->year;
                });

        return $bonusSalaryTableForYear->all();
    }

    public function getLastAdditionalSalaries(Employee $employee)
    {
        return $this->getAdditionalSalaryTable($employee)
            ->filter(function (Collection $salaries) {
                return $salaries->isNotEmpty();
            })
            ->map(function (Collection $salaries) {
                return $salaries->first();
            });
    }

    public function getAdditionalSalaryTable(Employee $employee)
    {
        return $this->getPayrollDataService()
            ->getAdditionalSalaryTable($employee, 'custom_name')
            ->sortBy(function ($_, string $key) {
                return $key;
            });
    }

    /**
     * @return string[]
     *
     * @throws HttpRequestException if request to compensation types service fails.
     */
    public function getExtraPaymentTypes(): array
    {
        return $this->oneTimeCompensationRepository->getExtraPaymentTypes();
    }

    /**
     * @param Employee $employee
     * @return float
     */
    public function getEstimatedHourlyRate(Employee $employee): float
    {
        return $this->getEstimatedHourlyRateForDate($employee, Carbon::today());
    }

    public function getEstimatedHourlyRateForDate(Employee $employee, Carbon $date): float
    {
        $dateTS = $date->timestamp;
        $salary = collect($this->getMainSalaryTable($employee))
            ->first(function ($salary) use ($dateTS) {
                return $dateTS >= $salary['since'];
            });

        if (empty($salary)) {
            return 0.0;
        }

        if ($salary['type'] === EmployeeSalary::TYPE_SALARY_HOURLY) {
            return $salary['value'];
        }

        $hoursPerWeek = $employee->getFullTimeWeeklyWorkingHours();
        $hourlySalary = $salary['nominalSalary'] * 3 / 13.0 / $hoursPerWeek;

        if ($salary['interval'] == SalaryIntervalEnum::YEARLY) {
            $hourlySalary /= 12;
        }

        return $hourlySalary;
    }

    public function deleteRecurringCompensationByUlid($salaryUlid)
    {
        $this->employeeSalaryRepository->deleteRecurringCompensationValueByUlid($salaryUlid);
    }

    public function findSalary($salary_id)
    {
        return $this->employeeSalaryRepository->findOrFail($salary_id);
    }

    /**
     * @param positive-int $year
     * @param int<1,12> $month
     * @param int $salaryId
     *
     * @throws InvalidFormatException if `$year` is a negative integer or `$month` is not an integer 1-12.
     * @throws Throwable if request to compensations service fails.
     */
    public function updateSalaryValue(
        Employee $employee,
        $year,
        $month,
        $salaryId,
        ?float $value,
        bool $allowZeroValue = false
    ): ?HourlySalaryOverrideOrBonusPayoutInterface {
        if ($value === null) {
            $value = 0.0;
        }
        $salary = $this->getEmployeeSalaryRepository()->findOrFail($salaryId);
        return $this->internalUpdateSalaryValue($year, $month, $salary, $value, $allowZeroValue, $employee);
    }

    /**
     * @throws Throwable if request to compensations service fails.
     */
    public function updateSalaryValueByUlid(
        Employee $employee,
        $year,
        $month,
        $salaryUlid,
        ?float $value,
        bool $allowZeroValue = false
    ): ?HourlySalaryOverrideOrBonusPayoutInterface {
        if ($value === null) {
            $value = 0.0;
        }
        $salary = $this->getEmployeeSalaryRepository()->findByUlidOrFail($salaryUlid);
        return $this->internalUpdateSalaryValue($year, $month, $salary, $value, $allowZeroValue, $employee);
    }

    /**
     * @param positive-int $year
     * @param int<1,12> $month
     * @param CompensationValueInterface $salary
     *
     * @throws InvalidFormatException if `$year` is a negative integer or `$month` is not an integer 1-12.
     * @throws Throwable if request to compensations service fails.
     */
    private function internalUpdateSalaryValue($year, $month, $salary, ?float $value, bool $allowZeroValue, Employee $employee): ?HourlySalaryOverrideOrBonusPayoutInterface
    {
        $paymentDate = Carbon::parse("$year-$month-01")->getTimestamp();

        $employeeSalaryValue = $this->employeeSalaryValueRepository->getSalaryValueForMonth($salary->id, $paymentDate);
        $originalSalaryValue = $employeeSalaryValue;
        $previousHours = $originalSalaryValue?->value;

        if ($this->isSalaryValueValid($value, $allowZeroValue)) {
            $changeType = ChangeType::UPDATED;
            if (!$employeeSalaryValue) {
                $changeType = ChangeType::CREATED;
                $employeeSalaryValue = $this->createEmployeeSalaryValue($employee, $salary->id, $paymentDate, $value);
            } else {
                $employeeSalaryValue->setHoursOrValue($value);
            }

            $employeeSalaryValue = $this->employeeSalaryValueRepository->save($employeeSalaryValue, $salary->getUlid());

            if ($salary->type === MainSalaryEnum::HOURLY) {
                $this->publishWorkedHoursSetEvent($employeeSalaryValue->getId(), $employee->id);
            }
            if (in_array($salary->type, BonusSalaryEnum::all())) {
                $this->publishEmployeeSalaryValueBonusSavedEvent($employeeSalaryValue, $employee->id);
            }
            return $employeeSalaryValue;
        }

        if ($employeeSalaryValue) {
            $this->employeeSalaryValueRepository->delete($employeeSalaryValue);

            if ($salary->type === MainSalaryEnum::HOURLY) {
                $this->publishWorkedHoursUnsetEvent($employeeSalaryValue, $employee->id);
            }
        }
        return null;
    }

    private function createEmployeeSalaryValue(
        Employee $employee,
        int $salaryId,
        int $paymentDate,
        float $value
    ): EmployeeSalaryValue {
        $employeeSalaryValue = new EmployeeSalaryValue();
        $employeeSalaryValue->company_id = $employee->company_id;
        $employeeSalaryValue->employee_salary_id = $salaryId;
        $employeeSalaryValue->payment_date = date('Y-m-d', $paymentDate);
        $employeeSalaryValue->value = $value;

        return $employeeSalaryValue;
    }

    /**
     * This method is now accepting IDs instead of an instance because we need the actual refreshed model from the
     * database so the values of its attributes are already casted to what consuming services expect.
     * Calling refresh wasn't an option since it can have unexpected side effects so the safest approach here
     * is to just re-fetch it from the database using the repository.
     *
     * This method is only public to simplify CDC tests.
     */
    public function publishWorkedHoursSetEvent(int $employeeSalaryValueId, int $employeeId): void
    {
        $employeeSalaryValue = $this->employeeSalaryValueRepository->find($employeeSalaryValueId);

        $event = new Event(
            'employee.worked-hours.set',
            $employeeSalaryValue->company_id,
            [
                'salary_id' => $employeeSalaryValue->employee_salary_id,
                'employee_id' => $employeeId,
                'payment_date' => $employeeSalaryValue->payment_date,
                'value' => $employeeSalaryValue->value
            ]
        );
        $eventPublishService = app(EventPublishService::class);
        $eventPublishService->publish($event);
    }

    /** This method is only public to simplify CDC tests. */
    public function publishWorkedHoursUnsetEvent(
        HourlySalaryOverrideOrBonusPayoutInterface $employeeSalaryValue,
        int $employeeId
    ): void {
        $employeeSalaryValue = $this->employeeSalaryValueRepository->find($employeeSalaryValue->getId());

        $event = new Event(
            'employee.worked-hours.unset',
            $employeeSalaryValue->company_id,
            [
                'salary_id' => $employeeSalaryValue->employee_salary_id,
                'employee_id' => $employeeId,
                'payment_date' => $employeeSalaryValue->payment_date,
            ]
        );
        $eventPublishService = app(EventPublishService::class);
        $eventPublishService->publish($event);
    }


    /** This method is only public to simplify CDC tests. */
    public function publishEmployeeSalaryValueBonusSavedEvent(
        HourlySalaryOverrideOrBonusPayoutInterface $employeeSalaryValue,
        int $employeeId
    ): void {
        $employeeSalaryValue = $this->employeeSalaryValueRepository->find($employeeSalaryValue->getId());

        $event = new Event(
            'employee.bonus-value.saved',
            $employeeSalaryValue->company_id,
            [
                'id' => $employeeSalaryValue->getId(),
                'attributes' => [
                    'salary_id' => $employeeSalaryValue->employee_salary_id,
                    'employee_id' => $employeeId,
                    'payment_date' => $employeeSalaryValue->payment_date,
                    'value' => $employeeSalaryValue->value
                ]
            ]
        );
        $eventPublishService = app(EventPublishService::class);
        $eventPublishService->publish($event);
    }

    private function isSalaryValueValid(?float $value, bool $allowZeroValue): bool
    {
        return $allowZeroValue ? $value >= 0 : $value > 0;
    }

    /**
     * @throws HttpRequestException if request to compensations service fails.
     */
    public function addExtraPayment(
        Company $company,
        Employee $employee,
        $year,
        $month,
        $type,
        $customName,
        $value,
        $comment
    ): ?string {
        $oneTimeCompensation = $this->oneTimeCompensationRepository->addExtraPayment(
            $company,
            $employee,
            $year,
            $month,
            $type,
            $customName,
            $value,
            $comment
        );
        return $oneTimeCompensation;
    }

    /**
     * @param Employee $employee
     * @return array
     *
     * @throws HttpRequestException if request to compensations service fails.
     */
    public function getExtraPaymentsByType(Employee $employee)
    {
        $result = [];

        $payments = $this->oneTimeCompensationRepository->getByEmployee($employee);
        foreach ($payments as $payment) {
            $title = $payment->getTitle();

            if (!isset($result[$title])) {
                $result[$title] = [
                    'sum' => 0,
                    'payments' => [],
                ];
            }

            $result[$title]['sum'] += $payment->getAmount();
            $result[$title]['payments'][] = $payment;
        }

        return $result;
    }

    /**
     * @param string $paymentUuid
     * @param Employee $employee
     *
     * @throws HttpRequestException if request to compensations service fails.
     */
    public function deleteExtraPayment(string $paymentUuid, Employee $employee)
    {
        $this->oneTimeCompensationRepository->deleteExtraPayment($paymentUuid, $employee);
    }

    public function getRegularSalaryForEmployeeAndMonth(Employee $employee, $month, Collection $allSalaries = null): mixed
    {
        $mainSalaries = null;
        if ($allSalaries != null) {
            $mainSalaries = $allSalaries->filter(
            /**
             * @param CompensationValue $salary
             */
                function ($salary) use ($employee) {
                    return ($salary->getType() == MainSalaryEnum::FIX || $salary->getType() == MainSalaryEnum::HOURLY)
                        && $salary->getEmployeeId() == $employee->getEmployeeId();
                }
            );
        }

        $yearIndex = date('Y', $month);
        $monthIndex = date('n', $month);
        $salaryTable = $this->getSalaryTable($employee, $yearIndex, $monthIndex, null, $mainSalaries);

        $REGULAR_SALARIES = [self::INDEX_MAIN_SALARY, self::INDEX_CUSTOM_SALARY];

        $result = 0;
        foreach ($salaryTable as $table) {
            if (in_array($table['index'], $REGULAR_SALARIES)) {
                if (
                    isset($table['salaryByMonth'][$monthIndex])
                    && isset($table['salaryByMonth'][$monthIndex]['salary'])
                    && $table['salaryByMonth'][$monthIndex]['salary']
                ) {
                    $result += $table['salaryByMonth'][$monthIndex]['salary'];
                }
            }
        }

        return $result;
    }

    /**
     * @return Collection|EmployeeSalary[]
     */
    public function getAllEmployeeSalaryData(): Collection|array
    {
        $typeFilter = array_merge(MainSalaryEnum::all(), BonusSalaryEnum::all(), [SalaryEnum::CUSTOM]);
        return $this->employeeSalaryRepository->getSalariesForAllEmployeesDescSorted($typeFilter);
    }

    public function getSalaryTable(
        Employee $employee,
        $year,
        $monthIndex = null,
        Collection $customSalaries = null,
        Collection $mainSalaries = null,
        Collection $customCompensationTypes = null,
        Collection $employeeSalaryValues = null
    ) {
        if (!$monthIndex) {
            // filter by year
            $filterStartDate = Carbon::parse($year . '-01-01');
            $filterEndDate = Carbon::parse($year . '-12-31');
        } else {
            // filter by month
            $filterStartDate = Carbon::parse($year . '-' . $monthIndex . '-01');
            $filterEndDate = $filterStartDate->copy()->addMonth()->subDay();
        }

        $result = [];

        $currentMonth = $filterStartDate->copy();
        $mainSalaryByMonth = [];
        $bonusSalaryByMonth = [];
        $customSalaryByMonth = [];
        while ($currentMonth->lt($filterEndDate)) {
            $mainSalaryByMonth[$currentMonth->month] = $this->getMainSalaryForEmployee($employee, $currentMonth, $mainSalaries, $employeeSalaryValues);
            $bonusSalaryByMonth[$currentMonth->month] = $this->getBonusSalaryForEmployee($employee, $currentMonth);
            $additionalSalaryTypes = $customCompensationTypes ?? $this->getAdditionalSalaryTypes();
            foreach ($additionalSalaryTypes as $salaryType) {
                $id = $salaryType->getId();
                if (!array_key_exists($id, $customSalaryByMonth)) {
                    $customSalaryByMonth[$id] = ["salaries" => [], "name" => $salaryType->getName()];
                }
                $customSalaryByMonth[$id]["salaries"][$currentMonth->month] =
                    $this->getCustomSalaryForEmployee($employee, $salaryType->getId(), $currentMonth, $customSalaries);
            }
            $currentMonth->addMonth();
        }

        $result[] = [
            'name' => tt('views.payroll.employee.main-salary'),
            'index' => self::INDEX_MAIN_SALARY,
            'salaryByMonth' => $mainSalaryByMonth,
        ];

        $result[] = [
            'name' => tt('views.payroll.employee.bonus-salary'),
            'index' => self::INDEX_BONUS_SALARY,
            'salaryByMonth' => $bonusSalaryByMonth,
        ];

        foreach ($customSalaryByMonth as $compensationTypeId => $customByMonth) {
            // skip empty columns from extra salaries (will look like 1 => null, 2 => null, 3 => null, ...)
            $notEmpty = collect($customByMonth["salaries"])->contains(function (array $salary = null) {
                return $salary && $salary['salary'] != 0;
            });
            if ($notEmpty) {
                $result[] = [
                    'name' => $customByMonth["name"],
                    'compensationTypeId' => $compensationTypeId,
                    'index' => self::INDEX_CUSTOM_SALARY,
                    'salaryByMonth' => $customByMonth["salaries"]
                ];
            }
        }

        return $result;
    }

    public function getMainSalaryForEmployee(Employee $employee, Carbon $month, Collection $mainSalaries = null, Collection $employeeSalaryValues = null)
    {
        $mainSalaryTable = $this->getPayrollDataService()->getMainSalaryTable($employee, $mainSalaries);
        $hourlyInterval = $this->billingPeriodService->getBillingIntervalForMonthAndEmployee($employee, $month);
        return $this->mainSalaryProcessor()
            ->processAndReduce($employee, $mainSalaryTable, $month, $hourlyInterval, $employeeSalaryValues);
    }

    /**
     * @param Carbon $month a date whose month to get the bonus salaries for.
     * @return array
     */
    public function getBonusSalaryForEmployee(Employee $employee, Carbon $month)
    {
        $salaryTable = $this->getBonusSalaryTable($employee);
        return $this->bonusSalaryProcessor()->processAndReduce($employee, $salaryTable, $month);
    }

    public function findCustomSalaryTypeByAttribute(string $attributeName)
    {
        $id = (int)substr($attributeName, strlen(self::SALARY_ATTRIBUTE_PREFIX));
        return $this->additionalCompensationTypeRepository->findById($id);
    }

    /**
     * @param string $customSalaryTypeId the custom salary type to return data for.
     * @param Carbon $month a date whose month to get custom salary for.
     * @param ?Collection<CompensationValueInterface> $salaries Optional collection of salary values to use. If not
     *   given, salary data will be fetched from the Payroll data service.
     * @return array|null [salary: float]
     */
    public function getCustomSalaryForEmployee(Employee $employee, $customSalaryTypeId, Carbon $month, Collection $salaries = null)
    {
        $salaryTables = $this->getPayrollDataService()->getAdditionalSalaryTable($employee, 'custom_id', $salaries);
        $result = $this->salaryComponentProcessor()
            ->processAndReduce($employee, $salaryTables->toArray(), $month);

        if (!isset($result[$customSalaryTypeId])) {
            return null;
        }

        return $result[$customSalaryTypeId];
    }

    /**
     * @param Employee $employee
     * @param string $customSalaryTypeId the custom salary type to return data for.
     * @param Carbon $date the date for which to return the custom salary for.
     *
     * @return ?array a salary data row for a salary of type $customSalaryTypeId on $date - or null if none found.
     */
    public function getCustomSalaryForEmployeeOnDate(Employee $employee, $customSalaryTypeId, Carbon $date)
    {
        $salaryTables = $this->getPayrollDataService()->getAdditionalSalaryTable($employee, 'custom_id');
        if (!isset($salaryTables[$customSalaryTypeId])) {
            return null;
        }
        return $salaryTables[$customSalaryTypeId]->first(function ($salary) use ($date) {
            return $date->timestamp >= $salary['since'];
        });
    }

    /**
     * @throws HttpRequestException if request to compensations service fails.
     * @throws Throwable if attribute log DB transaction fails.
     */
    public function syncSalaryChanges(Employee $employee, ?string $operatingUserId = null): void
    {
        $attributeLogs = $this->preserveModifierUserIdAndTimestampsForExistingAttributeLogs(
            $employee,
            $this->prepareAttributeLogsFromCompensationServiceValues($employee, $operatingUserId)
        );
        DB::transaction(function () use ($employee, $attributeLogs) {
            $this->attributeLogRepository->deleteAttributesByEmployee(
                $employee->company_id,
                $employee->id,
                self::SALARY_ATTRIBUTE_LOGS_NAMES
            );
            // We tried to use AttributeLogRepository::bulkInsert but could not understand the proper format and
            // didn't want to extend the scope of the task. But using it should be considered as a possible improvement.
            $attributeLogs->each(function (AttributeLog $log) {
                $log->save();
            });
        });

        $this->cache->clearLogCache($employee);
    }

    /**
     * @param Employee $employee
     * @param Collection<AttributeLog> $valuesBasedOnCompService
     * @return Collection<AttributeLog>
     */
    private function preserveModifierUserIdAndTimestampsForExistingAttributeLogs(Employee $employee, Collection $valuesBasedOnCompService): Collection
    {
        $existingAttributeLogs = $this->attributeLogRepository->getChangesByEmployeeIdsAndAttributes(
            $employee->getCompany(),
            collect(array($employee->getId())),
            collect(self::SALARY_ATTRIBUTE_LOGS_NAMES),
        );

        $key = function (AttributeLog $log): string {
            return implode('|', [$log->getAttributeName(), $log->when, $log->getNewValue()]);
        };

        $existingAttributeLogsMap = $existingAttributeLogs->reduce(function ($acc, $cur) use ($key) {
            $acc[$key($cur)] = $cur;
            return $acc;
        }, array());

        return $valuesBasedOnCompService->map(function (AttributeLog $cur) use ($existingAttributeLogsMap, $key) {
            $log = $existingAttributeLogsMap[$key($cur)] ?? null;
            if ($log !== null) {
                $cur->modifier_user_id = $log->modifier_user_id;
                $cur->setCreatedAt($log->created_at);
                $cur->setUpdatedAt($log->updated_at);
            }

            return $cur;
        });
    }

    private function buildSalaryAttributeLog(
        Employee $employee,
        ?string $operatingUserId,
        string $salaryType,
        ?string $oldValue,
        ?string $newValue,
        string $when,
    ): AttributeLog {
        $log = new AttributeLog();
        $log->company_id = $employee->getCompanyId();
        $log->model_type = AttributeLog::MODEL_EMPLOYEE;
        $log->model_id = $employee->getId();
        $log->attribute_name = ($salaryType === EmployeeSalary::TYPE_SALARY_FIX ? self::FIX_SALARY : self::HOURLY_SALARY);
        $log->old_value = $oldValue;
        $log->new_value = $newValue;
        $log->when = $when;
        $log->modifier_user_id = $operatingUserId;

        return $log;
    }

    /**
     * @return Collection<AttributeLog>
     */
    private function prepareAttributeLogsFromCompensationServiceValues(Employee $employee, ?string $operatingUserId = null): Collection
    {
        $attributeLogs = collect();
        // then walk through all salary updates and re-create attribute log entries
        $salaries = $this->employeeSalaryRepository->getEmployeeSalariesByType($employee, EmployeeSalary::$MAIN_SALARY_TYPES);
        /** @var null|CompensationValueInterface $lastSalary */
        $lastSalary = null;
        /** @var CompensationValueInterface $salary */
        foreach ($salaries as $salary) {
            $attributeLogs->push(
                $this->buildSalaryAttributeLog(
                    $employee,
                    $operatingUserId,
                    $salary->getType(),
                    $lastSalary && $lastSalary->getType() === $salary->getType() ? $lastSalary->getValue() : null,
                    $salary->getValue(),
                    $salary->getSince(),
                )
            );

            if ($lastSalary && $lastSalary->getType() !== $salary->getType()) {
                // if we switch from hourly to fix (or vice versa), then we don't only create a new log entry,
                // but we also "close" the old one
                $attributeLogs->push(
                    $this->buildSalaryAttributeLog(
                        $employee,
                        $operatingUserId,
                        $lastSalary->getType(),
                        $lastSalary->getValue(),
                        null,
                        $salary->getSince(),
                    )
                );
            }

            $lastSalary = $salary;
        }
        return $attributeLogs;
    }

    /**
     * @param int $year Full four-digit representation of a Gregorian calendar year, eg: 2016.
     * @param ?int $monthIndex An optional integer value corresponding to a calendar month to return payments
     *   for, e.g. 1 -> January. If not specified, all months for the given year will be returned.
     * @param ?Collection<EmployeeSalaryPaymentInterface> $extraPayments Optional collection of extra payment data to
     *   use. If not given, the data will be fetched from the Payroll data service.
     *
     * @return array<int<1,12>, array{payments: Collection<EmployeeSalaryPaymentInterface>, sum: float> a set of extra
     *   payments and the sum of their total amounts that occurred in the given $year, indexed by the integer value for
     *   the calendar month in which they occurred (e.g. 1 -> January). Months with no payouts will reference an empty
     *   collection.
     */
    public function getExtraPaymentsByMonth(Employee $employee, $year, $monthIndex = null, $extraPayments = null)
    {
        if (!$monthIndex) {
            // filter by year
            $filterStartDate = Carbon::parse($year . '-01-01');
            $filterEndDate = Carbon::parse($year . '-12-31');
        } else {
            // filter by month
            $filterStartDate = Carbon::parse($year . '-' . $monthIndex . '-01');
            $filterEndDate = $filterStartDate->copy()->addMonth()->subDay();
        }

        $currentMonth = $filterStartDate->copy();
        $result = [];
        while ($currentMonth->lt($filterEndDate)) {
            if ($extraPayments) {
                $result[$currentMonth->month] = $this->sumPaymentsOfMonth($extraPayments[$currentMonth->month]);
            } else {
                $result[$currentMonth->month] = $this->getExtraPaymentsForMonth($employee, $currentMonth);
            }
            $currentMonth->addMonth();
        }
        return $result;
    }

    /**
     * @param int $year Full four-digit representation of a Gregorian calendar year, eg: 2016.
     * @return array<int<1,12>, Collection<EmployeeSalaryPaymentInterface>> a set of salary payment collections that
     *   occurred in the given $year, indexed by the integer value for the calendar month in which they occurred
     *   (e.g. 1 -> January). Months with no payouts will reference an empty collection.
     */
    private function getExtraPaymentsOfYear(Employee $employee, $year)
    {
        $filterStartDate = Carbon::parse($year . '-01-01');
        $filterEndDate = Carbon::parse($year . '-12-31');

        $currentMonth = $filterStartDate->copy();
        $result = [];
        while ($currentMonth->lt($filterEndDate)) {
            $result[$currentMonth->month] = $this->getPayrollDataService()->getExtraPaymentsForMonth($employee, $currentMonth);
            $currentMonth->addMonth();
        }

        return $result;
    }

    /**
     * @param int $year
     * @template Month int<1,12>
     * @return array{
     *     extraPaymentsByMonth: array<Month, array{
     *         payments: Collection<EmployeeSalaryPaymentInterface>,
     *         sum: float,
     *     }>,
     *     salaryTable: array
     * }
     */
    public function getGrossCompensationsTable(Employee $employee, $year): array
    {
        $extraPaymentsOfYear = $this->getExtraPaymentsOfYear($employee, $year);
        $additionalSalaryTypes = $this->getAdditionalSalaryTypes($employee->getCompany());
        $customSalaries = $this->employeeSalaryRepository->getSalariesForEmployee($employee, [EmployeeSalary::TYPE_CUSTOM], $additionalSalaryTypes);
        $mainSalaries = $this->employeeSalaryRepository->getSalariesForEmployee($employee, EmployeeSalary::$MAIN_SALARY_TYPES);

        $employeeSalaryValues = $this->findAllEmployeeHourlySalariesByYear($mainSalaries, $year);

        $monolithGrossCompensationResponse = [
            "salaryTable" => $this->getSalaryTable($employee, $year, null, $customSalaries, $mainSalaries, $additionalSalaryTypes, collect($employeeSalaryValues)),
            "extraPaymentsByMonth" => $this->getExtraPaymentsByMonth($employee, $year, null, $extraPaymentsOfYear)
        ];
        $personioPayrollEnabled = $employee->getLegalEntityId() !== null && ($this->payrollConfigurationClient->getLegalEntityPersonioPayrollMode($employee->getCompanyId(), $employee->getLegalEntityId()) != PersonioPayrollMode::DISABLED);
        if ($personioPayrollEnabled) {
            $personioPayrollSegmentsFFEnabled = $this->getFeatureFlagService()->isFeatureFlagEnabledForCompany(
                $employee->getICompanyId(),
                self::FF_USING_PERSONIOPAYROLL_SEGMENTS
            );
            if (!$personioPayrollSegmentsFFEnabled) {
                $legalEntity = $employee->getLegalEntityId();
                $company = $employee->getCompanyId();
                $ffName = self::FF_USING_PERSONIOPAYROLL_SEGMENTS;
                $this->logger->info(
                    "PersonioPayroll FF Segments need updating. Personio payroll $personioPayrollEnabled and $ffName FF status $personioPayrollSegmentsFFEnabled. LE $legalEntity Company $company."
                );
            }
            try {
                $extraPaymentsCollection = collect($extraPaymentsOfYear)->flatten(1);
                $validCustomSalaries = $customSalaries->filter(function ($customSalary) {
                    return $customSalary->getCompensationType() != null;
                });
                $grossCompensationCalculationService = $this->getGrossCompensationCalculationService();
                $grossCompensationsCalculationOutput = $grossCompensationCalculationService->calculateGrossCompensations(
                    $extraPaymentsCollection,
                    $validCustomSalaries,
                    $mainSalaries,
                    $employeeSalaryValues,
                    $employee,
                    $year
                );

                $this->logDiscrepanciesIfProrationExistsInMonolith(
                    $employee,
                    $grossCompensationCalculationService,
                    $monolithGrossCompensationResponse,
                    $grossCompensationsCalculationOutput,
                    $additionalSalaryTypes
                );

                return $grossCompensationCalculationService->mapToSalaryTableUI(
                    $monolithGrossCompensationResponse,
                    $extraPaymentsCollection,
                    $mainSalaries,
                    $employeeSalaryValues,
                    $grossCompensationsCalculationOutput,
                );
            } catch (GrpcException $e) {
                $this->logger->error("Error calling Proration GRPC service", [
                    "company_id" => $employee->getCompanyId(),
                    "employee_id" => $employee->getId(),
                    "exception_message" => $e->getMessage(),
                    "exception_trace" => $e->getTraceAsString(),
                    "exception_type" => get_class($e)
                ]);
            } catch (Exception $e) {
                $this->logger->error("Unknown exception on Proration Service", [
                    "company_id" => $employee->getCompanyId(),
                    "employee_id" => $employee->getId(),
                    "exception_message" => $e->getMessage(),
                    "exception_trace" => $e->getTraceAsString(),
                    "exception_type" => get_class($e)
                ]);
            } catch (Throwable $t) {
                $this->logger->error("Unknown throwable on Proration Service", [
                    "company_id" => $employee->getCompanyId(),
                    "employee_id" => $employee->getId(),
                    "exception_message" => $t->getMessage(),
                    "exception_trace" => $t->getTraceAsString(),
                    "exception_type" => get_class($t)
                ]);
            }
        }
        return $monolithGrossCompensationResponse;
    }

    /**
     * @param Carbon $month a date whose month to get extra payments for.
     * @return array{payments: Collection<EmployeeSalaryPaymentInterface>, sum: float} an array containing all extra payments
     *   made to the employee in the month of the given $month date, and the sum of all of their amounts.
     */
    private function getExtraPaymentsForMonth(Employee $employee, Carbon $month)
    {
        $payments = $this->getPayrollDataService()->getExtraPaymentsForMonth($employee, $month);

        return [
            'payments' => $payments,
            'sum' => $payments->sum('amount'),
        ];
    }

    /**
     * @param Collection<EmployeeSalaryPaymentInterface> $extraPayments
     * @return array{payments: Collection<EmployeeSalaryPaymentInterface>, sum: float} an array containing the original
     *   collection of $extraPayments, and the sum of all of their amounts.
     */
    private function sumPaymentsOfMonth($extraPayments)
    {
        return [
            'payments' => $extraPayments,
            'sum' => $extraPayments->sum('amount'),
        ];
    }

    /**
     * @param int $year Full four-digit representation of a Gregorian calendar year, eg: 2016.
     * @return array<int<1,12>, Collection<OvertimePayoutInterface>> a set of overtime payouts collections, indexed by
     *   the integer value for the calendar month in which they occurred (e.g. 1 -> January). Months with no payouts
     *   will reference an empty collection.
     *
     * @deprecated this is only used in {@see PayrollController::getEmployeeSalary()}, which is being migrated.
     *   Instead, use {@see OvertimePayoutService::findForYear()} and group these in your specific use-case only
     *   if necessary.
     */
    public function getOvertimeIndexedByMonth($employee, $year)
    {
        return $this->getPayrollDataService()->getOvertimePayoutIndexedByMonth($employee, $year);
    }

    public function getSalaryChangeInPeriodForEmployee(Employee $employee, $periodStart, $periodEnd, $salaryAttribute)
    {
        $salaries = $this->employeeSalaryRepository->getEmployeeSalariesInBetween($employee, $periodStart, $periodEnd);

        foreach ($salaries as $salary) {
            if (
                ($salary->type == EmployeeSalary::TYPE_CUSTOM
                    && self::SALARY_ATTRIBUTE_PREFIX . $salary->custom_name == $salaryAttribute)
                || (in_array($salary->type, [
                        EmployeeSalary::TYPE_SALARY_FIX,
                        EmployeeSalary::TYPE_SALARY_HOURLY
                    ]) && $salaryAttribute == self::INDEX_MAIN_SALARY)
                || (in_array($salary->type, [
                        EmployeeSalary::TYPE_BONUS_MAX,
                        EmployeeSalary::TYPE_BONUS_CUSTOM,
                        EmployeeSalary::TYPE_BONUS_NONE,
                    ]) && $salaryAttribute == self::INDEX_BONUS_SALARY)
            ) {
                return $salary;
            }
        }

        return null;
    }

    public function getSalaryChangesInPeriod($periodStart, $periodEnd, $salaryAttributes)
    {
        $salaryChanges = [];
        $salaries = $this->employeeSalaryRepository->getSalariesInBetween($periodStart, $periodEnd);

        foreach ($salaries as $salary) {
            if ($salary->type == EmployeeSalary::TYPE_CUSTOM) {
                if (in_array(self::SALARY_ATTRIBUTE_PREFIX . $salary->custom_name, $salaryAttributes)) {
                    $salaryChanges[] = $salary;
                }
            } else {
                if (in_array($salary->type, $salaryAttributes)) {
                    $salaryChanges[] = $salary;
                }
            }
        }

        return $salaryChanges;
    }

    /**
     * Get payroll settings for current authenticated company or default settings if none exist
     */
    private function getPayrollSettings(Company $company): PayrollSetting
    {
        return $this->getPayrollSettingService()->getForCompany($company);
    }

    /**
     * Called by cronjob every morning to check if for this company there is a new payroll reminder to be sent out.
     * A reminder will be sent if we are on the review reminder day for the current month.
     *
     * @throws AttributeNotFoundException if any payroll-responsible employees do not have an attribute corresponding
     *   to the default accounting group.
     * @throws HttpRequestException if request to payroll status service fails.
     */
    public function createPayrollReminders(Company $company)
    {
        if ($this->shouldSendPayrollReminder($company)) {
            // walk through all employees of the company to see who should receive the reminder
            $employees = $this->getPayrollResponsibleEmployees($company);
            $employeesToEmail = $employees[0];
            $employeesWithTodoTask = $employees[1];

            $redirectUrl = $this->getPayrollRedirectUrl();

            /** @var MailerService $mailerService */
            $mailerService = app(MailerService::class);
            $mailerService->send(new PayrollReviewMailerJob(
                $company,
                Carbon::today(),
                $redirectUrl,
                $employeesToEmail
            ));

            $this->createPayrollTodoReminder($employeesWithTodoTask, $this->getPayrollRedirectUrl());
        }
    }

    public function getPayrollRedirectUrl(): string
    {
        return route('payroll.base', [], false);
    }

    /**
     * Return true if today is Review payroll day. If current month have number of days less than the configuration also
     * return true if today is end of month
     * @return bool
     */
    public function shouldSendPayrollReminder(Company $company)
    {
        $settings = $this->getPayrollSettings($company);
        $today = Carbon::today();

        if ($settings->review_reminder_day == $today->day) {
            return true;
        }

        $endOfMonthDay = $today->copy()->endOfMonth()->day;
        if ($today->day === $endOfMonthDay && $settings->review_reminder_day >= $endOfMonthDay) {
            return true;
        }

        return false;
    }

    public function getPayrollResponsibleEmployees(Company $company)
    {
        $employeesToEmail = [];
        $employeesWithTodoTask = [];
        foreach ($company->employees()->active()->get() as $employee) {
            $payrollEditAccess = $this->getRightsService()->hasPayrollAccess($employee, Right::EDIT_RIGHT);
            $payrollViewAccess = $this->getRightsService()->hasPayrollAccess($employee, Right::VIEW_RIGHT);
            $taskEmailNotificationEnabled = EmployeePreference::isEmailNotificationEnabled(
                $employee,
                EmployeePreference::FEATURE_PAYROLL_REVIEW
            );
            $todoTaskEnabled = EmployeePreference::isTodoNotificationEnabled(
                $employee,
                EmployeePreference::FEATURE_PAYROLL_REVIEW
            );

            if ($taskEmailNotificationEnabled && $payrollEditAccess) {
                $employeesToEmail[] = $employee;
            }
            if ($todoTaskEnabled && $payrollViewAccess) {
                $employeesWithTodoTask[] = $employee;
            }
        }
        return [$employeesToEmail, $employeesWithTodoTask];
    }

    public function getExportsForMonth(
        Company $company,
        ?Subcompany $subcompany,
        ?LegalEntity $legalEntity,
        $accountingGroupValue,
        Carbon $month
    ) {
        $useLeForRead = $this->getFeatureFlagService()->isFeatureFlagEnabledForCompany(
            $company,
            FeatureFlags::PREPAY_USE_LE_TO_READ_PAYROLL_EXPORT
        );
        if ($useLeForRead) {
            return $this->payrollExport
                ->getAllByMonthAndPayrollGroup($company, $legalEntity, $accountingGroupValue, $month);
        }
        return $this->payrollExport
            ->filterByPeriodAndAccountingGroup($company, $subcompany, $accountingGroupValue, $month, $month);
    }

    /**
     * Returns `PayrollDetail` of the current period for tenant passed.
     *
     * @throws HttpRequestException if request to payroll status service fails.
     * @throws AbsenceBalanceException if data generation failed to preload payroll absence data.
     */
    public function getPayrollDataForMonth(
        PayrollContext $payrollContext,
        Carbon $currentMonth,
        string $payrollTab,
    ): PayrollDataInterface {
        if (
            $this->getPayrollStatusService()->isPayrollClosed(
                $payrollContext->company,
                $payrollContext->legalEntity,
                $payrollContext->accountingGroupValue,
                $currentMonth,
            )
        ) {
            // if we have a closed payroll, use it
            $payrollListForMonth = $this->getExportsForMonth(
                $payrollContext->company,
                $payrollContext->subcompany,
                $payrollContext->legalEntity,
                $payrollContext->accountingGroupValue,
                $currentMonth,
            );

            return $payrollListForMonth->sortBy('export_index')->first();
        }

        // otherwise, we generate fresh data
        return new PayrollDetail(
            $this->generatePayrollData(
                $payrollContext,
                $currentMonth,
                [$payrollTab],
            ),
        );
    }

    /**
     * @throws AbsenceBalanceException if the data processor failed to preload payroll absence data.
     */
    private function generatePayrollData(
        PayrollContext $payrollContext,
        Carbon $month,
        array $payrollTabFilter = null,
    ): array {
        $headers = $payrollContext->payrollSetting->payroll_attributes;
        return $this->excelDataProcessor()->process(
            $this->preliminaryPayrollDataService->getDataForPayrollReport($payrollContext, $month),
            $this->getPayrollDataService()->getPayrollTabs(
                $payrollContext->company,
                $headers,
                $payrollTabFilter,
                $payrollContext->legalEntity,
            ),
        );
    }

    public function deleteExport(int $payrollExportId)
    {
        $export = $this->findPayrollExportById($payrollExportId);
        $export->delete();
    }

    /**
     * @throws AttributeNotFoundException if `$employee` does not have attribute corresponding to the default
     *   accounting group.
     */
    private function getEmployeeAccountingGroupValue(Employee $employee)
    {
        $accountingGroup = $this->getDefaultAccountingGroup($employee->getCompany());
        if ($accountingGroup) {
            return $employee->getAttribute($accountingGroup);
        }

        return null;
    }

    /**
     * @circulardependency
     * PayrollExcelDataProcessor -> PayrollExcelCellFormatter -> MainSalaryProcessor -> PayrollDataService
     */
    private function excelDataProcessor()
    {
        if ($this->excelDataProcessor === null) {
            $this->excelDataProcessor = App::make(ExcelPayrollProcessor::class);
        }
        return $this->excelDataProcessor;
    }

    /**
     * @param int $payrollExportId
     *
     * @throws ModelNotFoundException<PayrollExport> If payroll export with given ID does not exist.
     */
    public function findPayrollExportById(int $payrollExportId): PayrollExport
    {
        return $this->payrollExport->findOrFail($payrollExportId);
    }

    /**
     * @throws AttributeNotFoundException if `$employee` does not have attribute corresponding to the default
     *   accounting group.
     * @throws HttpRequestException if request to payroll status service fails.
     */
    public function getExportsForReviewByEmployee(Employee $employee)
    {
        $accountingGroupValue = $this->getEmployeeAccountingGroupValue($employee);
        $company = $employee->getCompany();

        if ($company->hasLegalEntitiesFeature()) {
            $results = new Collection();
            foreach ($company->getSubcompanies() as $subcompany) {
                $legalEntity = LegalEntity::fromSubcompany($subcompany);
                $results = $results->merge(
                    $this->getExportsForReviewByEmployeeForSubcompany(
                        $employee,
                        $subcompany,
                        $legalEntity,
                        $accountingGroupValue
                    )
                );
            }
            return $results;
        }
        return $this->getExportsForReviewByEmployeeForSubcompany($employee, null, null, $accountingGroupValue);
    }

    /**
     * @throws HttpRequestException if request to payroll status service fails.
     */
    public function getExportsForReviewByEmployeeForSubcompany(
        Employee $employee,
        ?Subcompany $subcompany,
        ?LegalEntity $legalEntity,
        $accountingGroupValue
    ) {
        $settings = $this->getPayrollSettings($employee->getCompany());
        // get all exports in review status

        $exportsUnderReview = $this->payrollExport->getAllByMonthAndStatus(
            $employee->getCompany(),
            $subcompany,
            $legalEntity,
            Carbon::today()->firstOfMonth(),
            $settings->accounting_group,
            $accountingGroupValue,
            PayrollExport::STATUS_REVIEW
        );

        if (
            $this->getPayrollStatusService()->currentMonthIsInReview(
                App::make('clientCompany'),
                $legalEntity,
                $accountingGroupValue
            )
        ) {
            $today = Carbon::today();

            $export = new PayrollExport();
            $export->company_id = $employee->company_id;
            if ($subcompany) {
                $export->subcompany_id = $subcompany->id;
            }
            $export->accounting_group = $settings->accounting_group;
            $export->accounting_group_value = $accountingGroupValue;
            $export->status = PayrollExport::STATUS_REVIEW;
            $export->month = Carbon::create($today->year, $today->month, 1, 0, 0, 0);

            $exportsUnderReview[] = $export;
        }

        return $exportsUnderReview;
    }

    /**
     * @throws HttpRequestException if request to compensations service fails.
     * @throws Throwable if attribute log DB transaction fails.
     */
    public function clearSalaries(Company $company)
    {
        // delete all salaries
        $this->getEmployeeSalaryRepository()->deleteSalaries($company->id);

        // delete all salary payments
        $this->oneTimeCompensationRepository->deleteAllByCompany($company->id);

        DB::transaction(function () use ($company) {
            AttributeLog::where('model_type', 'Employee')
                ->where('company_id', $company->id)
                ->whereIn('attribute_name', ['fix_salary', 'hourly_salary', 'signing_bonus'])
                ->delete();
        }, 3);
    }

    /**
     * @throws LocalizedValidationException if there are no accounting group options available.
     * @throws Exception if accounting group attribute has an unexpected type.
     */
    public function getAccountingGroups(Company $company, Subcompany $subcompany = null, Carbon $month = null)
    {
        $accountingGroup = $this->getPayrollDataService()->getAccountingGroupForMonth($company, $month);

        return $accountingGroup ?
            $this->getAccountingGroupOptions($company, $accountingGroup) :
            [];
    }

    /**
     * @throws LocalizedValidationException if there are no options available.
     * @throws Exception if accounting group attribute has an unexpected type.
     */
    private function getAccountingGroupOptions(Company $company, $accountingGroup)
    {
        switch ($accountingGroup) {
            case 'department_id':
                return $company->departments->pluck('name', 'id')->all();

            case 'office_id':
                return $company->offices->pluck('name', 'id')->all();

            default:
                // dynamic attribute
                if (!EmployeeInfoSection::isDynamicAttribute($accountingGroup)) {
                    throw new Exception('Expected dynamic attribute as group attribute but received '
                        . $accountingGroup);
                }

                $attribute = $this->getAttributeDefinitionsService()->findWithTrashed($company, $accountingGroup);

                if ($attribute->data_type !== AttributeDefinition::TYPE_OPTIONS) {
                    throw new Exception('Expected dynamic attribute ' . $accountingGroup . ' to be of type '
                        . 'option, but instead received ' . $attribute->data_type);
                }

                // now we know that we have a dynamic options attribute, so return the options
                $options = $attribute->getOptions();

                if (empty($options)) {
                    $exception = new LocalizedValidationException();
                    $exception->localizedMessageTranslationKey = 'errors.payroll.accounting-group-no-options';
                    $exception->localizedMessageTranslationParameters = ['name' => $attribute->name];
                    throw $exception;
                }

                // we have to use the name also as keys
                return array_combine($options, $options);
        }
    }

    public function getAccountingGroupAttributes(Company $company)
    {
        $optionAttributes = $this->getAttributeDefinitionsService()->findAll($company)
            ->where('data_type', AttributeDefinition::TYPE_OPTIONS);

        return collect(['department_id', 'office_id'])->merge($optionAttributes->map(function ($attr) {
            return EmployeeInfoSection::buildAttributeNameFromId($attr->id);
        }));
    }

    public function createExcel(PayrollExport $payrollExport): GenericExport
    {
        if (isset($payrollExport->data[TabEnum::PERSONAL])) {
            // new style, we have one or two tabs in the data array (note: 'new' in 2016)
            $sheets = [];
            foreach ($payrollExport->data as $payrollTab => $data) {
                $sheets[] = [
                    'name' => tt('views.payroll.tabs.' . $payrollTab) . ' ' . $payrollExport->month->format('F'),
                    'data' => $data,
                ];
            }

            // PREPAY-71: Additional tabs with only rows that have any changed (highlighted) cells
            foreach ($payrollExport->data as $payrollTab => $rows) {
                if ($payrollTab === TabEnum::ABSENCE) {
                    // Month-over-month changes don't make sense for absences tab
                    continue;
                }

                $changedColsFn = fn($row) => array_filter($row, fn($cell) => $cell['highlight']);
                $changedRowsFn = fn($row, $rowNumber) => $rowNumber === 0 || count($changedColsFn($row));
                $filteredRows = array_filter($rows, $changedRowsFn, ARRAY_FILTER_USE_BOTH);
                $tabTitle = tt('views.payroll.tabs.' . $payrollTab);
                $sheets[] = [
                    'name' => 'Δ ' . $tabTitle . ' ' . $payrollExport->month->format('F'),
                    // `array_values` to reset array indexing, highlighting cells relies on that
                    'data' => array_values($filteredRows),
                ];
            }
        }

        return $this->getExcelExporter()->createExcel($sheets);
    }

    /******************************************************************
     * EmployeeCustomSalaryCompensationType's
     ******************************************************************/

    public function getAllEmployeeCustomSalaryCompensationTypes(Company $company): Collection
    {
        return $this->additionalCompensationTypeRepository->getEmployeeCustomSalaryCompensationTypeForCompany($company);
    }

    public function findEmployeeCustomSalaryCompensationTypeOrFail(int $id): EmployeeCustomSalaryCompensationTypeInterface
    {
        return $this->additionalCompensationTypeRepository->findOrFail($id);
    }

    public function getAllCompensationTypesNames(Company $company): Collection
    {
        $customs = $this->getAllEmployeeCustomSalaryCompensationTypes($company)
            ->reduce(function (array $acc, EmployeeCustomSalaryCompensationTypeInterface $salaryType) {
                $attribute = $this->getAttributeService()->buildSalaryComponentAttribute($salaryType);
                $acc[$attribute] = $salaryType->getName();
                return $acc;
            }, []);
        $system = collect([
            PayrollSetting::PAYROLL_ATTRIBUTE_MAIN_SALARY,
            PayrollSetting::PAYROLL_ATTRIBUTE_BONUS_SALARY,
            PayrollSetting::PAYROLL_ATTRIBUTE_EXTRA_PAYMENTS,
            PayrollSetting::PAYROLL_ATTRIBUTE_OVERTIME_PAYOUTS,
        ]);

        $langHelper = App::make(LanguageHelper::class);
        return $system->mapWithKeys(function (string $attribute) use ($langHelper) {
            return [
                $attribute => $langHelper->tt("models.payroll.attributes_desc.$attribute"),
            ];
        })->merge($customs);
    }

    /**
     *
     * @throws InvalidArgumentException if `$name` contains a false-equivalent value (e.g. '' or 0).
     * @throws CompensationServiceException|HttpRequestException|MaximumRetriesReachedException if request to
     *   compensations service fails.
     */
    public function createEmployeeCustomSalaryCompensationType(string $name): EmployeeCustomSalaryCompensationTypeInterface
    {
        if (empty($name)) {
            throw new InvalidArgumentException('Name must be valid.');
        }

        $company = App::make('clientCompany');
        return $this->additionalCompensationTypeRepository->addEmployeeCustomSalaryCompensationType($name, $company);
    }

    /**
     * Deletion event handler (see CustomSalaryTypeSubscriber)
     */
    public function customSalaryTypeDeletingEventHandler(
        EmployeeCustomSalaryCompensationTypeInterface $customSalaryCompensationType,
        Company $company
    ) {
        $name = PayrollService::SALARY_ATTRIBUTE_PREFIX . $customSalaryCompensationType->getId();
        // Delete form employees display attributes
        $this->getEmployeeService()->removeDisplayColumnForAllEmployees($company, $name);
        // Remove from payroll settings
        $this->deleteCustomSalaryTypeFromPayrollSettings($name);
        // Remove from exports configuration
        $this->getExportConfigurationService()->removeExportAttribute($name);
        // Clean the cache
        $this->cache->clearCacheForTags([CacheInterface::TAG_EMPLOYEE_DATA], $company);
    }

    /******************************************************************
     * PayrollSettings export columns deletion handlers:
     ******************************************************************/

    public function deleteCustomSalaryTypeFromPayrollSettings(string $name)
    {
        $settings = PayrollSetting::wherePayrollAttribute($name)->get();
        foreach ($settings as $setting) {
            $payrollAttributes = $setting->payroll_attributes;

            if (key_exists($name, $payrollAttributes)) {
                unset($payrollAttributes[$name]);
                $setting->payroll_attributes = array_keys($payrollAttributes);
                $setting->save();
            }
        }
    }

    public function removeCustomAttributeFromPayrollSettingIfNeeded(AttributeDefinition $attribute)
    {
        $company = App::make('clientCompany');
        $payrollSettings = $this->getPayrollSettings($company);
        $attributes = $payrollSettings->payroll_attributes;

        if (key_exists($attribute->dynamicId(), $attributes)) {
            unset($attributes[$attribute->dynamicId()]);
            $this->getPayrollSettingService()->updateSettings(
                $company,
                ['payroll_attributes' => array_keys($attributes)]
            );
        }

        return $attributes;
    }

    public function removeTimeOffTypeOutOfPayrollSettings(TimeOffType $timeOffType)
    {
        $settings = $this->getPayrollSettings($timeOffType->company);
        $settings->payroll_absences = $this->getPayrollAbsencesAfterRemovingTimeOffType($settings, $timeOffType);
        $settings->payroll_attributes = $this->getPayrollAttributesAfterRemovingTimeOffType($settings, $timeOffType);
        $settings->save();
    }

    /**
     * PER-2832 Only show billing period if within the period, employee
     * has an hourly salary entry
     */
    public function shouldShowBillingPeriod(array $salaryTable, int $monthIndex): bool
    {
        if (empty($salaryTable)) {
            return true;
        }

        $mainSalary = Arr::first($salaryTable, function ($salary) {
            $salaryIndex = $salary['index'] ?? null;
            return $salaryIndex === self::INDEX_MAIN_SALARY;
        });
        return !empty($mainSalary['salaryByMonth'][$monthIndex]['salary_id']);
    }

    /**
     * @param PayrollSetting $settings
     * @param $timeOffType
     * @return array
     */
    private function getPayrollAbsencesAfterRemovingTimeOffType(
        PayrollSetting $settings,
        $timeOffType
    ): array {
        $timeOffTypes = $settings->payroll_absences;
        unset($timeOffTypes[$timeOffType->id]);
        return array_keys($timeOffTypes);
    }

    /**
     * @param TimeOffType $timeOffType
     * @return array
     */
    private function getPayrollAttributesAfterRemovingTimeOffType(
        PayrollSetting $settings,
        $timeOffType
    ): array {
        $payrollAttributes = $settings->payroll_attributes;
        $updatedAttributes = collect($payrollAttributes)
            ->filter(function ($value, $key) use ($timeOffType) {
                return !$this->doesAttributeBelongToTimeOffType($key, $timeOffType);
            })->toArray();

        return array_keys($updatedAttributes);
    }

    /**
     * @param TimeOffType $timeOffType
     * @return false|int
     */
    private function doesAttributeBelongToTimeOffType(string $attributeKey, $timeOffType)
    {
        // Check if attribute ends with pattern "-[TimeOffTypeId]"
        $pattern = '/-' . $timeOffType->id . '$/';
        return preg_match($pattern, $attributeKey);
    }

    private function mainSalaryProcessor()
    {
        if (!isset($this->mainSalaryProcessor)) {
            $this->mainSalaryProcessor = App::make(MainSalaryProcessor::class);
        }
        return $this->mainSalaryProcessor;
    }

    private function bonusSalaryProcessor()
    {
        if (!isset($this->bonusSalaryProcessor)) {
            $this->bonusSalaryProcessor = App::make(BonusSalaryProcessor::class);
        }
        return $this->bonusSalaryProcessor;
    }

    private function salaryComponentProcessor()
    {
        if (!isset($this->salaryComponentProcessor)) {
            $this->salaryComponentProcessor = App::make(SalaryComponentProcessor::class);
        }
        return $this->salaryComponentProcessor;
    }

    public function getLatestCustomBonusForEmployee(Employee $employee): ?CompensationValueInterface
    {
        return $this->getEmployeeSalaryRepository()->getLatestCustomBonusForEmployee($employee);
    }

    public function getDefaultAccountingGroup(Company $company): ?string
    {
        return $this->getPayrollDataService()
            ->getAccountingGroupForMonth($company);
    }

    /**
     * @throws NoAccessException if given `$employee` does not have given `$right`.
     */
    public function assertPayrollAccess(Employee $employee, ?int $subcompanyId, string $right): void
    {
        if ($subcompanyId) {
            $this->getRightsService()->assertPayrollSubcompanyAccess($employee, $subcompanyId, $right);
            return;
        }

        $this->getRightsService()->assertAnyPayrollSubcompanyAccess($employee, $right);
    }

    /**
     * @throws InvalidSalaryOwnerException if any of the IDs of `$salaryIds` do not belong to `$employee`
     */
    public function assertSalariesBelongToEmployee(Employee $employee, array $salaryIds)
    {
        if (empty($salaryIds)) {
            return;
        }
        $employeeSalaries = $this->getEmployeeSalaryRepository()->getSalariesForEmployee($employee);
        $employeeSalaryIds = $employeeSalaries->map(function ($s) {
            return $s->id;
        });
        foreach ($salaryIds as $salaryId) {
            if (!$employeeSalaryIds->contains($salaryId)) {
                throw new InvalidSalaryOwnerException(salaryId: strval($salaryId), employee: $employee);
            }
        }
    }

    /**
     * @throws InvalidSalaryOwnerException if any of the IDs of `$salaryUlids` do not belong to `$employee`
     */
    public function assertSalariesBelongToEmployeeUsingUlid(Employee $employee, array $salaryUlids)
    {
        if (empty($salaryUlids)) {
            return;
        }
        $employeeSalaries = $this->getEmployeeSalaryRepository()->getSalariesForEmployee($employee);
        $employeeSalaryUlids = $employeeSalaries->map(function ($s) {
            return $s->getUlid();
        });
        foreach ($salaryUlids as $salaryUlid) {
            if (!$employeeSalaryUlids->contains($salaryUlid)) {
                throw new InvalidSalaryOwnerException(salaryId: strval($salaryUlid), employee: $employee);
            }
        }
    }

    public function getLastMainSalaryForEmployee(Employee $employee): ?array
    {
        return $this->getPayrollDataService()->getLastMainSalaryForEmployee($employee);
    }

    private function dispatchSalarySyncJob(Company $company, int $employeeId, ?string $_modifierUserId = null): void
    {
        $modifierUserId = $_modifierUserId ?? AuthenticationContext::user()?->getUserId();
        $job = (new SyncEmployeeSalariesJob(
            companyId: $company->getId(),
            employeeId: $employeeId,
            operatingUserId: $modifierUserId
        ))->delay(30);
        $job->onQueue(config('queue.salaries-sync'));

        dispatch($job);
    }

    /**
     * @param Collection<CompensationValueInterface> $mainSalaries
     * @param int $year Full four-digit representation of a Gregorian calendar year, eg: 2016.
     */
    private function findAllEmployeeHourlySalariesByYear($mainSalaries, $year)
    {
        $hourlySalaries = $mainSalaries->filter(function ($salary) {
            return $salary->getType() == EmployeeSalary::TYPE_SALARY_HOURLY;
        });
        $employeeSalaryValueRepository = $this->employeeSalaryValueRepository;
        return $hourlySalaries->flatmap(function ($salary) use ($employeeSalaryValueRepository, $year) {
            return $employeeSalaryValueRepository->getSalariesValueForYear($salary->getId(), $year);
        });
    }

    private function logDiscrepanciesIfProrationExistsInMonolith(
        Employee $employee,
        GrossCompensationCalculationService $grossCompensationCalculationService,
        array $monolithGrossCompensationResponse,
        GrossCompensationCalculationOutput $grossCompensationsCalculationOutput,
        Collection $compensationTypes
    ): void {
        $prorationMethodsThatValidateDiscrepancies = [ProrateMode::THIRTY_DAYS, ProrateMode::CALENDAR_DAYS];
        if (
            in_array(
                $this->getPayrollSettingService()->getProrationMethod($employee->getCompany()),
                $prorationMethodsThatValidateDiscrepancies
            )
        ) {
            $grossCompensationCalculationService->logDifferences(
                $monolithGrossCompensationResponse,
                $grossCompensationsCalculationOutput,
                $employee,
                $compensationTypes
            );
        }
    }

    /**
     * @param Employee[] $employees
     * @param string $redirectUrl
     *
     * @throws AttributeNotFoundException if any of `$employees` do not have attribute corresponding to the default
     *    accounting group.
     * @throws HttpRequestException if request to payroll status service fails.
     */
    private function createPayrollTodoReminder(array $employees, $redirectUrl): void
    {
        foreach ($employees as $employee) {
            $todoTasks = collect($this->getExportsForReviewByEmployee($employee))
                ->unique(function (PayrollExport $export) {
                    return $export->month->timestamp;
                })->map(function (PayrollExport $export) use ($employee, $redirectUrl) {
                    return new PayrollReview(
                        $export,
                        $redirectUrl,
                        $employee
                    );
                })
                ->values();
            foreach ($todoTasks as $task) {
                $this->payrollTodoTaskService->createTask($task);
            }
        }
    }
}
