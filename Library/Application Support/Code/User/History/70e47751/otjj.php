<?php

namespace Personio\HRM\Payroll\Attributes\Infrastructure;

use Company;
use Employee;
use Exception;
use Illuminate\Support\Collection;
use Personio\Core\FeatureFlags\Domain\Services\FeatureFlagServiceInterface;
use Personio\Core\Mailers\MailerService;
use Personio\Core\Mailers\MissingMandatoryAttributeMailerJob;
use Personio\HRM\Payroll\Errors\Domain\ExternalIntegration\PayrollErrorsService;
use Right;
use Subcompany;
use UrlHelper;
use Workzag\Repositories\Staff\EmployeeRepository;
use Workzag\Service\Rights\RightsService;

class MandatoryReminderMailManager
{
    public function __construct(
        private AttributeRepository $attributeRepository,
        private PayrollErrorsService $payrollErrorsService,
        private RightsService $rightsService,
        private MailerService $mailerService,
        private EmployeeRepository $employeeRepository,
        private FeatureFlagServiceInterface $splitIOService
    ) {
    }

    /**
     * @param Company $company
     * @throws Exception
     */
    public function sendReminderByLanguagePreference(Company $company): void
    {
        if ($this->shouldSkipEmail($company)) {
            return;
        }

        if ($this->splitIOService->isFeatureFlagEnabledForCompany($company, "PAYINT-5301-disable-employee-reminder")) {
            return;
        }


        $route = UrlHelper::getHostnameUrlTo($company->hostname, route('payroll.base', [], false));

        $employees = $this->employeeRepository->findNonInactive()->toBase();

        $employees->filter(function (Employee $employee) use ($company) {
            if ($company->hasSubcompanies()) {
                $returnValue = $this->hasPayrollSubCompaniesAccess($company, $employee);
            } else {
                $returnValue = $this->rightsService->hasPayrollAccess($employee, Right::VIEW_RIGHT);
            }

            return $returnValue;
        })
            ->groupBy(function (Employee $employee) {
                return $employee->getLanguageCode();
            })
            ->each(function (Collection $recipients, string $lang) use ($company, $route) {
                $this->mailerService->send(new MissingMandatoryAttributeMailerJob($company->getId(), $recipients, $route, $lang));
            });
    }

    /**
     * @param Company $company
     * @return bool
     * @throws Exception
     */
    private function shouldSkipEmail(Company $company): bool
    {
        return (!$this->attributeRepository->companyHasMissingMandatoryAttributes($company)
            && $this->payrollErrorsService->getAllEmployeeErrors($company)->isEmpty());
    }

    /**
     * @param Company $company
     * @param Employee $employee
     * @return bool
     * @throws Exception
     */
    private function hasPayrollSubCompaniesAccess(Company $company, Employee $employee): bool
    {
        $subcompany = $company->getSubcompanies()->first(function (Subcompany $subcompany) use ($employee) {
            return $this->rightsService->hasPayrollSubcompanyAccess($employee, $subcompany->getId(), Right::VIEW_RIGHT);
        });

        return $subcompany !== null;
    }
}
