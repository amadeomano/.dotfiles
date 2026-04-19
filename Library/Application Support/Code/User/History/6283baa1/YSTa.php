<?php

namespace Personio\HRM\Payroll\PreliminaryPayroll\Http\Controllers;

use Illuminate\Contracts\View\View as ViewContract;
use Illuminate\Http\RedirectResponse;
use NoAccessException;
use Personio\Auth\Common\Guards\AuthenticationContext;
use Personio\Auth\Entities\IdpUser;
use Personio\Core\Artifacts\ArtifactCollection;
use Personio\Core\Artifacts\FrontendReleaseManager;
use Personio\Core\Exceptions\HttpRequestException;
use Personio\HRM\Payroll\Api\Http\V2\Controllers\PayrollTableAuditLogTrait;
use Personio\HRM\Payroll\Api\Http\V2\Controllers\PayrollTableUseCase;
use Personio\HRM\Payroll\Infrastructure\AccessCheckers\PayrollAccessChecker;
use Personio\FrontendOrchestrator\Http\Controllers\MicroFrontendController;
use Right;
use View;

/**
 * Shows the Base product Payroll Page.
 */
class PreliminaryPayrollViewController
{
    use PayrollTableAuditLogTrait;

    public function __construct(
        private readonly PayrollAccessChecker $payrollAccessChecker,
        private readonly FrontendReleaseManager $frontendReleaseManager
    ) {
    }

    /**
     * @return ViewContract
     *
     * @throws HttpRequestException
     * @throws NoAccessException
     */
    public function legacy(): ViewContract
    {
        $this->checkAccess();
        $this->addAuditLog(PayrollTableUseCase::HOME);

        $assets = $this->frontendReleaseManager->retrieve('personioPayrollTable', true);
        return View::make('client/payroll-full-width/index')
            ->with('jsAssets', $assets->getJs())
            ->with('cssAssets', $assets->getCss());
    }

    /**
     * @return RedirectResponse
     */
    public function redirect(): RedirectResponse
    {
        return redirect()->route('payroll.base');
    }

    /**
     * @return void
     *
     * @throws HttpRequestException
     * @throws NoAccessException
     */
    private function checkAccess(): void
    {
        /** @var IdpUser $idpUser */
        $idpUser = AuthenticationContext::user();
        $this->payrollAccessChecker->assertAnyPayrollAccess($idpUser, Right::VIEW_RIGHT);
    }
}
