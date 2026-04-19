<?php

namespace Personio\HRM\Payroll\Tests\Integration\Http\Controllers;

use App;
use CompanyRole;
use Employee;
use GenericRolePermission;
use Right;
use Subcompany;
use Tests\Util\TestCase;
use Workzag\Repositories\Rights\RightRepository;
use Workzag\Service\Rights\RolesService;

/**
 * @group integration
 */
class PreliminaryPayrollViewControllerTest extends TestCase
{
    /**
     * @var RightRepository
     */
    protected $rightRepository;

    public function setUp(): void
    {
        parent::setUp();
        $this->rightRepository = App::make(RightRepository::class);
    }

    public function testGetPayrollViewReturns200WhenTheUserIsAdmin(): void
    {
        $this->actingAs($this->adminEmployee);

        $response = $this->get("/payroll/verification");

        $response->assertStatus(200);
    }

    public function testGetPayrollViewReturns200WhenTheUserHasSubcompanyRights(): void
    {
        $subcompany = Subcompany::factory()->create();
        $employee = $this->newNonAdminEmployee(['subcompany_id' => $subcompany->id]);
        $role = CompanyRole::factory()->create();
        $this->getRolesService()->addEmployeesToStaticRole($role, Employee::whereIn('id', [$employee->id])->get());
        $payrollSubcompanyRight = $this->rightRepository->findByName(Right::RIGHT_PAYROLL_SUBCOMPANY);
        $this->getRolesService()->updateSinglePermissionForRole($role, $payrollSubcompanyRight, $subcompany->id, [
            Right::EDIT_RIGHT => [],
            Right::PROPOSE_RIGHT => [],
            Right::VIEW_RIGHT => [GenericRolePermission::PERMISSION_ALL],
        ]);
        $this->actingAs($employee);

        $response = $this->get("/payroll/verification");

        $response->assertStatus(200);
    }

    public function testGetPayrollViewReturns403WhenNoAccessRights(): void
    {
        $employee = $this->newNonAdminEmployee();
        $this->actingAs($employee);

        $response = $this->get("/payroll/verification");

        $response->assertStatus(403);
    }

    public function testGetPayrollFullWidthReturnsRedirect(): void
    {
        $employee = $this->newNonAdminEmployee();
        $this->actingAs($employee);

        $response = $this->get("/payroll-full-width");

        $response->assertRedirect(route('payroll.base'));
    }

    private function getRolesService(): RolesService
    {
        return app(RolesService::class);
    }
}
