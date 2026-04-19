<?php

use Admin\CompaniesController;
use Admin\CompanyDeletionScheduleController;
use Admin\CompanyDuplicationController;
use Admin\CompanyExportController as AdminCompanyExportController;
use Admin\GlobalPayrollSettingsController;
use Admin\IdpTenantsController;
use Admin\LoginController;
use Admin\PasswordBasedAuthenticationController;
use Client\AccountController;
use Client\AnalyticsReportingController;
use Client\ConfigurationController;
use Client\OnboardingController;
use Client\PersonalAbsencesController;
use Client\RolesConfigurationController;
use Client\SearchController;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Route;
use Personio\Admin\AuditLogs\Http\Controllers\AuditLogsController;
use Personio\Admin\CompanyCreation\Http\Controllers\CompanyCreationController;
use Personio\Admin\CompanyDetails\AccountManagement\Http\CompanyDetailsController;
use Personio\Admin\FeatureFlag\Http\Controllers\FeatureFlagController;
use Personio\Admin\ImportConfiguration\Http\Controllers\ImportConfigurationController;
use Personio\Admin\Payroll\AllCompaniesCommunications\Http\Controllers\PayrollAllCompaniesCommunicationsController;
use Personio\Admin\Payroll\AutomaticCommunications\Http\Controllers\PayrollAutomaticCommunicationsController;
use Personio\Admin\Payroll\Configurations\Http\Controllers\PayrollConfigurationController;
use Personio\Admin\Payroll\DataImport\Http\Controllers\PayrollDataImportController;
use Personio\Admin\Payroll\ManualCommunication\Http\Controllers\PayrollManualCommunicationController;
use Personio\Admin\Payroll\ManualOverride\Http\Controllers\PayrollManualOverrideController;
use Personio\Admin\Payroll\PayrollSandboxAccount\Http\Controllers\PayrollSandboxAccountViewController;
use Personio\Admin\Payroll\PersonioPayroll\Http\Controllers\PayrollApprovalDashboardViewController;
use Personio\Admin\Payroll\PersonioPayroll\Http\Controllers\PayrollManagementController;
use Personio\Admin\Payroll\PersonioPayroll\Http\Controllers\PayrollOnboardingDocumentsController;
use Personio\Admin\Payroll\Troubleshooting\Http\Controllers\PayrollTroubleshootingController;
use Personio\Admin\Subscription\SubscriptionController;
use Personio\Auth\ClientCredentials\Middlewares\ApiConfigurationAccessMiddleware;
use Personio\Auth\Common\Enums\LoginRoutes;
use Personio\Auth\EmployeeManagement\CompanyAuthConfigurationAPIController;
use Personio\Auth\EmployeeManagement\EmployeeAccountController;
use Personio\Auth\PasswordAuth\Http\Controllers\GetIndex;
use Personio\Auth\PasswordAuth\Http\Controllers\GetReminder;
use Personio\Auth\PasswordAuth\Http\Controllers\PasswordAuthenticationAPIController;
use Personio\Auth\PasswordAuth\Http\Controllers\PostIndex;
use Personio\Auth\PasswordAuth\Http\Controllers\PostReminder;
use Personio\Compensation\Http\Controllers\CompensationMicroFrontendController;
use Personio\Core\Enums\TeamsEnum;
use Personio\DataPortability\CompanyExport\Domain\Http\CompanyExportController;
use Personio\DataPortability\EmployeeExport\Domain\Http\EmployeeExportController;
use Personio\FrontendOrchestrator\Http\Controllers\MicroFrontend404Controller;
use Personio\FrontendOrchestrator\Http\Controllers\MicroFrontend500Controller;
use Personio\FrontendOrchestrator\Http\Controllers\MicroFrontendController;
use Personio\HRM\Employee\AttributeChange\Http\EmployeeAttributeChangesController;
use Personio\HRM\Employee\Http\Controllers\Api\EmployeeChangeRequestsBFFController;
use Personio\HRM\Employee\Http\Controllers\Api\EmployeeHeaderController;
use Personio\HRM\Employee\Http\Controllers\Api\EmployeeHistoryBFFController;
use Personio\HRM\Employee\Http\Controllers\Api\EmployeeHistoryDetailsBFFController;
use Personio\HRM\Employee\Http\Controllers\Api\EmployeeNotesBFFController;
use Personio\HRM\Employee\Http\Controllers\Api\EmployeeTerminationTypesController;
use Personio\HRM\EmployeeList\AccessRightsBulkPreCheck\Http\EmployeeListAccessRightsBulkPreCheckController;
use Personio\HRM\EmployeeList\Http\EmployeeListBulkActionsBFFController;
use Personio\HRM\EmployeeList\Http\EmployeeListColumnsBFFController;
use Personio\HRM\EmployeeList\Http\EmployeeListDataBFFController;
use Personio\HRM\EmployeeList\Http\EmployeeListExportBFFController;
use Personio\HRM\EmployeeList\Http\EmployeeListFiltersBFFController;
use Personio\HRM\EmployeeList\Http\EmployeeListMetaDataBFFController;
use Personio\HRM\EmployeeList\Http\EmployeeListViewsBFFController;
use Personio\HRM\EmployeeList\Http\EmployeeTimelineDataBFFController;
use Personio\HRM\Exports\Http\Controllers\ExportsController;
use Personio\HRM\Import\Http\Controllers\ImportViewController;
use Personio\HRM\Staff\Http\ProfileImageController;
use Personio\Navigation\Http\Controllers\NavigationContextController;
use Personio\Subscription\Models\SubscriptionFeatureLimit;
use Personio\Surveys\Http\Controllers\SurveysMicroFrontendController;
use Personio\WorkForcePlanning\Middleware\JobArchitectureUIAccessRightsCheckMiddleware;
use Personio\WorkForcePlanning\Middleware\WorkforcePlanningUIAccessRightsCheckMiddleware;
use tools\ContentCleaner;
use Workzag\Http\Controllers\admin\ChargebeeCompaniesController;
use Workzag\Http\Controllers\client\configuration\RolesSecurityConfigurationController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|

*/

// Redirect id.PERSONIO_DOMAIN to generic login page
Route::group([], base_path('personio/Auth/Login/API/Routes/generic.php'));

// ------------------------------ WWW.PERSONIO.* ------------------------------
// www.personio.de and www-en.personio.de
$wwwRoutes = function () {
    // generic logins under www.personio.com (no company specified)
    Route::get(LoginRoutes::ROOT, fn() => redirect(LoginRoutes::INDEX));
    Route::get(LoginRoutes::INDEX, GetIndex::class);
    Route::post(LoginRoutes::INDEX, PostIndex::class);
    Route::get(LoginRoutes::REMINDER, GetReminder::class);
    Route::post(LoginRoutes::REMINDER, PostReminder::class);
};

foreach (Config::get('domains.www-domains') as $languageDomain) {
    Route::group(['middleware' => ['force-ssl'], 'domain' => $languageDomain], $wwwRoutes);
}

// ------------------------------ ADMIN SIDE admin.personio.com ------------------------------
Route::group([
    'domain' => 'admin.' . Config::get('domains.main-domain'),
    'middleware' => [
        'force-ssl',
        'secure-headers',
        'no-cache',
        'user-access-log',
        'prevent-xss',
    ],
], function () {
    Route::get(LoginRoutes::ROOT, fn() => redirect(LoginRoutes::INDEX));
    Route::get(LoginRoutes::INDEX, [LoginController::class, 'getIndex']);
    Route::post(LoginRoutes::INDEX, [LoginController::class, 'postIndex']);
    Route::get(LoginRoutes::LOGOUT, [LoginController::class, 'getLogout']);
    Route::get(LoginRoutes::ADD_AUTH_SECRET, [LoginController::class, 'getAddAuthenticatorSecret']);
    Route::get(LoginRoutes::PASSWORD_BASED_AUTH, [PasswordBasedAuthenticationController::class, 'getIndex']);
    Route::post(LoginRoutes::PASSWORD_BASED_AUTH, [PasswordBasedAuthenticationController::class, 'postIndex'])
        ->middleware('throttle:100,1');

    Route::prefix('admin-auth')->group(function () {
        Route::get(LoginRoutes::GOOGLE, [LoginController::class, 'getGoogleLoginPage'])
            ->name('admin-googleoauth.login');
    });
    Route::group(['domain' => 'admin-google-auth.' . Config::get('domains.main-domain')], function () {
        Route::get(LoginRoutes::GOOGLE, [LoginController::class, 'googleLoginCallback'])
            ->name('admin-googleoauth.login.google');
    });

    Route::group(['middleware' => ['auth:admin', 'csrf', 'datadog-span-tags', 'admin-s2s']], function () {
        Route::get('settings', [
            'team' => 'cet',
            'uses' => 'Admin\SettingsController@getIndex',
        ]);
        Route::group([
            'team' => 'cet',
        ], function () {
            Route::get('settings/limit-account-created', 'Admin\SettingsController@getLimitAccountCreated');
            Route::put('settings/limit-account-created', 'Admin\SettingsController@putUpdateLimitAccountCreated');
        });

        Route::group([
            'team' => 'cet',
        ], function () {
            Route::get('settings/dpa-contracts', 'Personio\DataPrivacyAgreement\Http\Controllers\TemplateController@getDpaContracts');

            Route::get('settings/dpa-templates', 'Personio\DataPrivacyAgreement\Http\Controllers\TemplatesController@getPageAssets');

            Route::get('settings/dpa-contracts/template/lang/{language}', 'Personio\DataPrivacyAgreement\Http\Controllers\TemplateController@downloadTemplate')
                ->name('admin.dpa.template.download');
            Route::post('settings/dpa-contracts/template/upload', 'Personio\DataPrivacyAgreement\Http\Controllers\TemplateController@uploadTemplate')
                ->name('admin.dpa.template.upload');
        });

        Route::get('', [
            'team' => 'cet',
            'uses' => 'Admin\CompaniesController@getIndex',
        ]);
        Route::get('companies', [
            'team' => 'cet',
            'uses' => 'Admin\CompaniesController@getIndex',
        ]);
        Route::get('companies/payroll', [
            'team' => 'oa',
            'uses' => 'Admin\CompaniesController@getPayrollCompanies',
        ]);
        Route::get('companies/{company_id}/chargebee-subscription', [
            'team' => 'sm',
            'uses' => ChargebeeCompaniesController::class . '@getSubscription',
        ])
            ->name('admin.company.chargebee-subscription');
        Route::post('companies/sync-chargebee-data', [
            'team' => 'sm',
            'uses' => ChargebeeCompaniesController::class . '@postSyncData',
        ]);

        Route::get('companies/details/{company_id}', [
            'team' => 'cet',
            'uses' => 'Admin\CompaniesController@getDetails'
        ])
            ->name('admin_company_details');

        Route::get('companies/details/access-rights/{company_id}', 'Admin\AccessRightsController@getIndex')->name('admin_company_details_access_rights');
        Route::post('companies/details/access-rights/{company_id}', 'Admin\AccessRightsController@postIndex')->name('admin_company_details_post_access_rights');
        Route::get('companies/details/idp-tenants/{company_id}', IdpTenantsController::class . '@getIndex')->name('admin_company_details_idp_tenants');
        Route::post('companies/details/idp-tenants/{company_id}', IdpTenantsController::class . '@postIndex')->name('admin_company_details_post_idp_tenants');
        Route::get('companies/invoicing/{company_id}', 'Admin\CompaniesController@getInvoicing')->name('admin_invoicing_details');

        Route::group(['team' => 'CON'], function () {
            Route::get('companies/{companyId}/subscription', [SubscriptionController::class, 'getIndex']);
            Route::get('companies/{companyId}/dashboard', [SubscriptionController::class, 'getDashboardDataFromSMS']);
            Route::post('companies/migrate', [SubscriptionController::class, 'postMigrateToV7InSMS']);
        });

        Route::get('companies/{companyId}/demo-data', [CompaniesController::class, 'getDemoData'])->name('admin_company_demo_data');
        Route::post('companies/{companyId}/demo-data', [CompaniesController::class, 'postDemoData'])->name('admin_company_post_demo_data');

        Route::get('companies/{companyId}/invoice/{invoiceId}/pdf', [CompaniesController::class, 'getInvoicePdf']);
        Route::get('companies/invoicing/{company_id}/refresh', [CompaniesController::class, 'getRefreshInvoicing']);
        Route::post('companies/{companyId}/upgrade', [CompaniesController::class, 'postUpgrade']);
        Route::post('companies/{companyId}/block', [CompaniesController::class, 'blockCompany']);
        Route::get('companies/admin-login/{company_id}', [CompaniesController::class, 'getAdminLogin']);
        Route::get('companies/login/{employee_id}', [CompaniesController::class, 'getLogin']);
        Route::post('companies/delete-account/{company_id}', [
            'team' => 'al',
            'uses' => CompanyDeletionScheduleController::class . '@deleteImmediately',
        ]);
        Route::post('companies/set-cs-tracking/{companyId}', [CompaniesController::class, 'postSetCustomerSuccessTracking']);
        Route::post('companies/unset-cs-tracking/{companyId}', [CompaniesController::class, 'postUnsetCustomerSuccessTracking']);
        Route::post('companies/enable-newsfeed/{companyId}', [CompaniesController::class, 'postEnableNewsFeed']);
        Route::post('companies/disable-newsfeed/{companyId}', [CompaniesController::class, 'postDisableNewsFeed']);
        Route::post('companies/enable-email-redirect/{companyId}', [CompaniesController::class, 'postEnableEmailRedirect']);
        Route::post('companies/disable-email-redirect/{companyId}', [CompaniesController::class, 'postDisableEmailRedirect']);
        Route::post('companies/enable-admin/{employeeId}', [CompaniesController::class, 'postEnableAdmin']);
        Route::post('companies/disable-admin/{employeeId}', [CompaniesController::class, 'postDisableAdmin']);
        Route::get('companies/unblock-employee/{employee_id}', [CompaniesController::class, 'getUnblockEmployee']);
        Route::get('companies/optimize-history/{companyId}/{mergeDays?}', [CompaniesController::class, 'getOptimizeHistory']);
        Route::get('companies/reset-history/{companyId}/{mergeDays?}', [CompaniesController::class, 'getResetHistory']);
        Route::get('companies/clear-cache/{companyId}', [CompaniesController::class, 'getClearCache']);
        Route::delete('companies/accrual-items/{companyId}', [CompaniesController::class, 'deleteAccrualItems']);
        Route::delete('companies/manual-accrual-adjustments/{companyId}', [CompaniesController::class, 'deleteManualAccrualAdjustments']);
        Route::delete('companies/imported-accrual-adjustments/{companyId}', [CompaniesController::class, 'deleteImportedAccrualAdjustments']);
        Route::delete('companies/salary-data/{companyId}', [CompaniesController::class, 'deleteSalaryData']);
        Route::post('companies/rename-account/{companyId}', [CompaniesController::class, 'postRenameAccount']);
        Route::post('companies/{company_id}/rename-hostname/{subcompany_id}', [CompaniesController::class, 'postRenameSubcompanyHostname']);
        Route::post('companies/set-test/{companyId}', [CompaniesController::class, 'postSetTestAccount']);
        Route::post('companies/unset-test/{companyId}', [CompaniesController::class, 'postUnsetTestAccount']);
        Route::post('companies/reports/headcount/{companyId}/reindex', ['uses' => 'Admin\CompaniesController@refreshIndexForCompany', 'team' => 'AR']);
        Route::post('companies/duplicate-account/{companyId}', [CompanyDuplicationController::class, 'postDuplicateAccount']);

        Route::group([
            'team' => 'cet',
        ], function () {
            Route::post('companies/export-company/{companyId}', [AdminCompanyExportController::class, 'postExportCompany']);
            Route::get('companies/{companyId}/export-company/{exportId}', [AdminCompanyExportController::class, 'downloadExport']);
            Route::delete('companies/{companyId}/company-exports', [AdminCompanyExportController::class, 'deleteCompanyExports']);
        });

        Route::group([
            'team' => 'FIND',
            'prefix' => 'api/v1/navigation',
        ], function () {
            Route::get('context', NavigationContextController::class . '@getContextData');
        });

        Route::group(['team' => 'al'], function () {
            Route::post('scheduled-deletions/companies/{companyId}', 'Admin\CompanyDeletionScheduleController@post')
                ->name('admin_company_deletion_schedule');
            Route::patch('scheduled-deletions/companies/{companyId}', 'Admin\CompanyDeletionScheduleController@patch')
                ->name('admin_company_deletion_schedule_update');
            Route::delete('scheduled-deletions/companies/{companyId}', 'Admin\CompanyDeletionScheduleController@delete')
                ->name('admin_company_deletion_schedule_removal');
            Route::get('deleted-companies', 'Personio\Admin\CompanyDeletion\Http\Controllers\DeletedCompaniesController@getIndex')
                ->name('admin_deleted_companies');
            Route::get('scheduled-companies', 'Personio\Admin\CompanyDeletion\Http\Controllers\ScheduledCompaniesController@getIndex')
                ->name('admin_scheduled_companies');
        });

        Route::get('companies/absence/{company_id}', 'Admin\CompaniesController@getAbsencePeriods');
        Route::delete('companies/absence/{company_id}', 'Admin\CompaniesController@deleteCompanyAbsencePeriods');
        Route::delete('companies/absence/{company_id}/subcompany', 'Admin\CompaniesController@deleteSubcompanyAbsencePeriods');

        Route::delete('companies/{companyId}/delete-old-hostname', 'Admin\CompaniesController@deleteCompanyOldHostname');

        Route::post('companies/enable-google-auth/{companyId}', 'Personio\Admin\CompanyDetails\AccountManagement\Http\CompanyDetailsGoogleAuthController@enableCompanyGoogleSSO')
            ->name('admin_company_enable_google_auth');

        Route::post('companies/disable-google-auth/{companyId}', 'Personio\Admin\CompanyDetails\AccountManagement\Http\CompanyDetailsGoogleAuthController@disableCompanyGoogleSSO')
            ->name('admin_company_disable_google_auth');

        Route::patch('companies/set-integration-usage/{companyId}', 'Personio\Admin\CompanyDetails\AccountManagement\Http\CompanyDetailsIntegrationsController@set')
            ->name('admin_company_set_integration_usage');

        Route::patch('companies/set-oauth-enforced/{companyId}', 'Personio\Admin\CompanyDetails\AccountManagement\Http\CompanyDetailsOAuthEnforcementController@setOAuthEnforcement')
            ->name('admin_company_set_oauth_enforced');

        Route::group(['team' => 'sm'], function () {
            Route::patch('companies/{companyId}/set-vat-required', CompanyDetailsController::class . '@setVATRequired')
                ->name('admin_company_set_vat_required');
            Route::patch('companies/{companyId}/set-vat-optional', CompanyDetailsController::class . '@setVATOptional')
                ->name('admin_company_set_vat_optional');
            Route::post('companies/create-company', CompanyCreationController::class . '@postCreateCompany');
        });

        Route::get('users', [
            'team' => 'cet',
            'uses' => 'Admin\UsersController@getIndex',
        ]);

        Route::get('invoices', 'Admin\InvoicesController@getIndex');
        Route::get('chargebee-invoices', [
            'team' => 'sm',
            'uses' => 'Admin\InvoicesController@getChargebeeInvoices',
        ]);
        Route::get('invoices/invoice-details/{invoiceId}', 'Admin\InvoicesController@getInvoiceDetails');
        Route::get('invoice/{invoiceId}/download', \Personio\Admin\Invoices\Api\Http\Controllers\InvoiceApiController::class . '@getChargebeeDownloadInvoiceURL');

        Route::group(['team' => 'tm'], function () {
            Route::get('public-holidays', 'Admin\PublicHolidaysController@getIndex');
            Route::post('public-holidays/add-calendar', 'Admin\PublicHolidaysController@postAddCalendar');
            Route::post('public-holidays/edit-calendar/{calendarId}', 'Admin\PublicHolidaysController@postEditCalendar');
            Route::post('public-holidays/add-holiday', 'Admin\PublicHolidaysController@postAddHoliday');
            Route::post('public-holidays/delete-holiday', 'Admin\PublicHolidaysController@postDeleteHoliday');
            Route::post('public-holidays/delete-calendar', 'Admin\PublicHolidaysController@postDeleteCalendar');
            Route::post('public-holidays/edit-holiday', 'Admin\PublicHolidaysController@postEditHoliday');
            Route::post('public-holidays/import-holiday/{type}', 'Admin\PublicHolidaysController@postImportHoliday');
        });

        Route::group([
            'middleware' => ['admin-access-right:viewGlobalPayrollSettings'],
            'team' => 'oa',
        ], function () {
            Route::get('global-payroll-settings', GlobalPayrollSettingsController::class . '@getIndex');
            Route::get('global-payroll-settings/compensations', GlobalPayrollSettingsController::class . '@getCompensationsIndex');
        });

        Route::group([
            'middleware' => ['admin-access-right:managePayrollSandboxAccounts'],
            'team' => 'oa',
        ], function () {
            Route::get('sandbox-accounts', PayrollSandboxAccountViewController::class . '@getIndex');
            Route::get('sandbox-accounts/{tail}', PayrollSandboxAccountViewController::class . '@getIndex')
                ->where(
                    'tail',
                    '.*'
                );
        });


        Route::group([
            'middleware' => ['admin-access-right:viewApprovalDashboard'],
            'team' => 'ob',
        ], function () {
            Route::get('/payroll/approval-dashboard', PayrollApprovalDashboardViewController::class . '@getIndex');
            Route::get('/payroll/approval-dashboard/{tail}', PayrollApprovalDashboardViewController::class . '@getIndex')
                ->where(
                    'tail',
                    '.*'
                );
        });

        Route::group(['team' => 'oa'], function () {
            Route::get('/payroll/configurations', PayrollConfigurationController::class . '@getIndex');
            Route::get('/payroll/configurations/{tail}', PayrollConfigurationController::class . '@getIndex')->where(
                'tail',
                '.*'
            );

            Route::get('/companies/{companyId}/payroll-data-import', PayrollDataImportController::class . '@getIndex')
                ->name('admin.companies.payroll-data-import.index');
            Route::get(
                '/companies/{companyId}/payroll-data-import/{tail}',
                PayrollDataImportController::class . '@getIndex'
            )->where('tail', '.*');

            Route::get('/companies/{companyId}/personio-payroll', PayrollManagementController::class . '@getIndex')
                ->name('admin.companies.payroll-management.index');
            Route::get(
                '/companies/{companyId}/personio-payroll/{tail}',
                PayrollManagementController::class . '@getIndex'
            )->where('tail', '.*');

            Route::get('/companies/{companyId}/payroll-onboarding-documents', PayrollOnboardingDocumentsController::class . '@getIndex')
                ->name('admin.companies.payroll-onboarding-documents.index');
            Route::get(
                '/companies/{companyId}/payroll-onboarding-documents/{tail}',
                PayrollOnboardingDocumentsController::class . '@getIndex'
            )->where('tail', '.*');

            Route::get('/companies/{companyId}/employees/{employeeId}/payroll-manual-override', PayrollManualOverrideController::class . '@getIndex')
                ->name('admin.companies.payroll-manual-override.index');
            Route::get('/companies/{companyId}/employees/{employeeId}/payroll-manual-override/{tail}', PayrollManualOverrideController::class . '@getIndex')->where('tail', '.*');

            Route::get('/companies/{companyId}/payroll-manual-communication', PayrollManualCommunicationController::class . '@getIndex')
                ->name('admin.companies.payroll-manual-communication.index');
            Route::get('/companies/{companyId}/payroll-manual-communication/{tail}', PayrollManualCommunicationController::class . '@getIndex')->where('tail', '.*');

            Route::get('/companies/{companyId}/payroll-automatic-communications', PayrollAutomaticCommunicationsController::class . '@getIndex')
                ->name('admin.companies.payroll-automatic-communications.index');
            Route::get('/companies/{companyId}/payroll-automatic-communications/{tail}', PayrollAutomaticCommunicationsController::class . '@getIndex')->where('tail', '.*');

            Route::get('/companies/{companyId}/payroll-troubleshooting', PayrollTroubleshootingController::class . '@getIndex')
                ->name('admin.companies.payroll-troubleshooting.index');
            Route::get('/companies/{companyId}/payroll-troubleshooting/{tail}', PayrollTroubleshootingController::class . '@getIndex')->where('tail', '.*');
        });

        Route::group(['team' => 'pex'], function () {
            Route::get('/payroll/all-companies-communications', PayrollAllCompaniesCommunicationsController::class . '@getIndex');
            Route::get('/payroll/all-companies-communications/{tail}', PayrollAllCompaniesCommunicationsController::class . '@getIndex')->where(
                'tail',
                '.*'
            );
        });

        Route::get('/audit-logs', AuditLogsController::class . '@getIndex');
        Route::get('/audit-logs/{tail}', AuditLogsController::class . '@getIndex')->where('tail', '.*');

        Route::group([
            'team' => 'cet',
        ], function () {
            Route::get('features', FeatureFlagController::class . '@getIndex');
            Route::get('features/{name}', FeatureFlagController::class . '@getDetails');
            Route::post('features/enable-for-all-companies', 'Admin\FeatureFlagsController@postEnableFeatureForAllCompanies');
            Route::post('features/disable-for-all-companies', 'Admin\FeatureFlagsController@postDisableFeatureForAllCompanies');
        });


        Route::group([
            'team' => 'cet',
        ], function () {
            Route::get('company/{companyId}/support-details/{subsection}', 'Admin\AdminSupportDetailsController@getIndex')
                ->where('subsection', '^((account)|(contract)|(payroll))-owners$')
                ->name('admin.support-details');

            // dpa contracts
            Route::get('companies/{companyId}/dpa/contracts', 'Personio\DataPrivacyAgreement\Http\Controllers\AdminContractListController@getList')
                ->name('admin.dpa-contracts.list');

            Route::get('companies/{companyId}/dpa/{contract}/download', 'Personio\DataPrivacyAgreement\Http\Controllers\AdminContractListController@downloadContract')
                ->name('admin.dpa.contract.download');

            Route::delete('companies/{companyId}/dpa/{contract}/delete', 'Personio\DataPrivacyAgreement\Http\Controllers\AdminContractListController@deleteContract')
                ->name('admin.dpa.contract.delete');

            // custom contracts
            Route::post('companies/{companyId}/dpa/set-custom', 'Personio\DataPrivacyAgreement\Http\Controllers\CustomContractController@setCustomStatus')
                ->name('admin.dpa.contract.set-custom');

            Route::post('companies/{companyId}/dpa/disable-custom', 'Personio\DataPrivacyAgreement\Http\Controllers\CustomContractController@disableCustomDPAContract')
                ->name('admin.dpa.contract.disable-custom');

            Route::post('companies/{companyId}/dpa/upload-custom', 'Personio\DataPrivacyAgreement\Http\Controllers\CustomContractController@upload')
                ->name('admin.dpa.contract.upload-custom');

            Route::get('companies/{companyId}/dpa/download-custom', 'Personio\DataPrivacyAgreement\Http\Controllers\CustomContractController@download')
                ->name('admin.dpa.contract.download-custom');

            // deleted companies dpa list
            Route::get('deleted-companies/{companyId}/dpa-contracts', 'Personio\DataPrivacyAgreement\Http\Controllers\AdminContractListController@getContractsForDeletedAccount');
        });

        // import configuration
        Route::put(
            'companies/{companyId}/import-configurations/employee-upload-valid-since/enable',
            ImportConfigurationController::class . '@enableEmployeeUploadValidSince'
        )->name('admin.import_configurations.employee_upload_valid_since.enable');
        Route::put(
            'companies/{companyId}/import-configurations/employee-upload-valid-since/disable',
            ImportConfigurationController::class . '@disableEmployeeUploadValidSince'
        )->name('admin.import_configurations.employee_upload_valid_since.disable');
    });
});

// ------------------------------ CLIENT SIDE hostname.personio.de --------------------------
if (!defined('FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE')) {
    define('FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE', 'frontend-orchestrator:skipFeatureFlags');
}

// Login:
Route::group(['middleware' => ['force-ssl', 'secure-headers', 'no-cache', 'datadog-span-tags']], function () {

    Route::post(LoginRoutes::INDEX, PostIndex::class)->name('login.index.post');
    Route::post(
        'api/v1/login',
        [PasswordAuthenticationAPIController::class, 'handleAPILogin']
    )->name('login.api.password');

    Route::group(['middleware' => ['prevent-xss']], function () {
        Route::get('data-privacy-statement', 'Client\SettingsController@getDPS');

        /**
         * Route organisation - Only routes Login / Auth related inside 'prevent-xss' middleware group
         * @productdev_id  #cir_authentication_authn
         */
        Route::group(['team' => 'id'], base_path('routes/Auth/web.php'));

        Route::group(['team' => 'tm'], function () {
            Route::get('calendar/ical/{employee_id}/{employee_token}/{time_off_type_id?}/{department_id?}')
                ->uses(['Client\CalendarController', 'getIcal'])
                ->name('calendar.ical-link.get-old');

            Route::get('calendar/ical/{employee_id}/{employee_token}/{time_off_type_id?}/{department_id?}/calendar.ics')
                ->uses(['Client\CalendarController', 'getIcal'])
                ->name('calendar.ical-link.get-old-with-filename');

            Route::get('calendar/ical-links/{employee_id}/{employee_token}/{ical_link_id}.ics')
                ->uses(['Personio\HRM\Calendar\IcalLinks\Http\Controllers\IcalLinksWebController', 'getIcalLinkFile'])
                ->name('calendar.ical-link.get');
        });

        // It's important that impersonation middleware preceeds the auth.employee to properly set up the View::share
        // clause for the Auth::user()
        Route::group([
            'middleware' => [
                'impersonation',
                'auth.employee',
                'csrf',
                'user-access-log',
                'employee.has-role.admin',
            ],
        ], function () {
            Route::get('setup', 'Client\SetupController@getIndex');
            Route::get('setup/step/{step}', 'Client\SetupController@getStep');
            Route::post('setup/step/{step}', 'Client\SetupController@postStep');
        });

        Route::group([
            'middleware' => [
                'impersonation',
                'auth.employee',
                'csrf',
                'force-finish-setup',
                'auth.needs-subscription',
                'user-access-log',
                'auth.password-rotation.employee',
            ],
        ], function () {

            // Max 50 requests per minute for endpoints which can trigger email sending. If the limit is reached, prevent access for 2 minutes
            Route::group(['middleware' => 'throttle:50,2', 'team' => 'wevo'], function () {
                Route::post(
                    'onboarding/send-email-now/{employee_id}/{template_id}/{step_id}',
                )->uses([OnboardingController::class, 'postSendEmailNow'])
                    ->whereNumber(['employee_id', 'template_id', 'step_id']);
            });

            Route::group(['middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE, 'team' => 'FIND'], function () {
                Route::get('', MicroFrontend500Controller::class);
                Route::get('my-desk', MicroFrontend500Controller::class)
                    ->name('my-desk');
                Route::get('my-desk/announcements/{id?}', MicroFrontend500Controller::class)
                    ->where('id', '.*')
                    ->name('announcements');
                Route::get('release-notes/{id?}', MicroFrontend500Controller::class)
                    ->where('id', '.*')
                    ->name('release-notes');
            });

            Route::group(['prefix' => 'surveys', 'middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE], function () {
                Route::get('{any?}', SurveysMicroFrontendController::class)
                    ->where('any', '.*')
                    ->name('surveys');
            });

            Route::group(['prefix' => 'compensation', 'middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE], function () {
                Route::get('{any?}', CompensationMicroFrontendController::class)->where('any', '.*')->name('compensation');
            });

            Route::group(
                [
                    'prefix' => 'configuration/job-architecture',
                    'middleware' => [
                        JobArchitectureUIAccessRightsCheckMiddleware::class,
                        'frontend-orchestrator',
                    ],
                ],
                function () {
                    $route = Route::get('{any?}', MicroFrontendController::class)
                        ->where('any', '.*')
                        ->name('configuration.job-architecture');
                    $route->defaults = [
                        'frontend' => 'jobArchitectureFrontend',
                        'mountId' => 'job-architecture-frontend',
                        'pageTitle' => 'navigation.main.configuration',
                    ];
                }
            );

            Route::group(
                [
                    'prefix' => 'personio-payroll',
                    'middleware' => [
                        \Personio\HRM\Payroll\PreliminaryPayroll\Http\Middleware\PersonioPayrollAccessCheckMiddleware::class,
                        FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE,
                    ],
                    'team' => 'PP_PEX',
                ],
                function () {
                    Route::get('{slug?}', MicroFrontend500Controller::class)
                        ->where('slug', '.*')
                        ->name('personio-payroll');
                }
            );

            Route::group(['middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE, 'team' => 'pi'], function () {
                Route::get('xero-payroll/{tab?}', MicroFrontend404Controller::class)
                    ->where('tab', '.+')
                    ->name('xero-payroll');
                Route::get('a3-payroll/{tab?}', MicroFrontend404Controller::class)
                    ->where('tab', '.+')
                    ->name('a3-payroll');
            });

            Route::get('configuration/documents/templates', [
                'team' => 'dm',
                'uses' => MicroFrontend500Controller::class,
            ])
                ->middleware([FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE, 'datadog-span-tags'])
                ->name('configuration.documents.templates');

            Route::get('configuration/documents/categories', [
                'team' => 'dm',
                'uses' => MicroFrontend500Controller::class,
            ])
                ->middleware([FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE, 'datadog-span-tags'])
                ->name('configuration.documents.categories');

            Route::group(['prefix' => 'secondary-navigation', 'middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE, 'team' => 'FIND'], function () {
                Route::get('{any}', MicroFrontend500Controller::class)->where('any', '.*')->name('secondary-navigation');
            });

            Route::group(
                [
                    'middleware' => [
                        \Personio\AuditLog\Middleware\CustomerFacingUIAccessRightsCheckMiddleware::class,
                        'frontend-orchestrator',
                    ],
                ],
                function () {
                    Route::get('configuration/audit-log', MicroFrontend404Controller::class)->name('audit-log');
                }
            );

            Route::group(['team' => 'FIND'], function () {
                Route::get('search', SearchController::class);
                Route::get('search/employees', SearchController::class . '@searchEmployees');
            });

            Route::get('my-desk/approval-status-count', 'Client\DashboardController@ajaxApprovalStatusCount');
            Route::post('dismiss-todo/{dismissibleTodoId}', 'Client\DashboardController@postDismissTodo');
            Route::post('dismiss-mobile-banner', 'Client\DashboardController@ajaxDismissMobileBanner');

            /* Data Portability */
            Route::group(['team' => 'cet'], function () {
                Route::get('data-portability/company-export', CompanyExportController::class . '@loadData');
                Route::post('data-portability/company-export', CompanyExportController::class . '@fireExport');
                Route::get('data-portability/company-export/{id}', CompanyExportController::class . '@download');
            });

            Route::get(
                'data-portability/employee-export/{employee_id}',
                EmployeeExportController::class . '@loadData'
            );
            Route::post(
                'data-portability/employee-export/{employee_id}',
                EmployeeExportController::class . '@fireExport'
            );
            Route::get(
                'data-portability/employee-export/{employee_id}/{id}',
                EmployeeExportController::class . '@download'
            );

            Route::post(
                'performance/pages/{pageId}/track-load-time',
                'Personio\Core\Performance\TrackingLogs\PerformanceLogsController@trackPageLoadTime'
            )->name('performance.page-load-time');

            // Whistleblowing
            Route::group(['middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE], function () {
                Route::get(
                    'whistleblowing',
                    [
                        'uses' => 'Personio\Whistleblowing\Http\WhistleblowingController@getShell',
                        'team' => 'dev_sur_fe ',
                    ]
                );
                Route::get(
                    'whistleblowing/{all}',
                    [
                        'uses' => 'Personio\Whistleblowing\Http\WhistleblowingController@getShell',
                        'team' => 'dev_sur_fe ',
                    ]
                )->where('all', '.*');
            });

            Route::group(['team' => TeamsEnum::PET->value], function () {
                Route::get('/staff/termination-types', [EmployeeTerminationTypesController::class, 'getTerminationTypes'])->name('employee-termination-types');
            });

            Route::group(['team' => TeamsEnum::EM->value], function () {
                Route::group([
                    'middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE,
                ], function () {
                    // EL v3
                    Route::get('staff', MicroFrontend500Controller::class)->name('employee-list-shell');
                    Route::get('staff/onboarding', MicroFrontend500Controller::class)->name('employee-list-shell-onboarding');
                    Route::get('staff/offboarding', MicroFrontend500Controller::class)->name('employee-list-shell-offboarding');
                });

                Route::group(['prefix' => 'staff/employee-list/bff'], function () {
                    Route::post('/metadata', [EmployeeListMetaDataBFFController::class, 'postEmployeeListMeta'])->name('employee-list-meta');
                    Route::post('/v2/access-rights-bulk', EmployeeListAccessRightsBulkPreCheckController::class)->name('employee-list-precheck-bulk-access-rights');
                    Route::post('/data', [EmployeeListDataBFFController::class, 'postEmployeeListData'])->name('employee-list-data');
                    Route::post('/v2/data', [EmployeeListDataBFFController::class, 'postEmployeeListDataV2'])->name('employee-list-data-v2');
                    Route::get('/employee-list-columns', [EmployeeListColumnsBFFController::class, 'getEmployeeListColumns'])->name('employee-list-get-columns');
                    Route::post('/employee-list-columns', [EmployeeListColumnsBFFController::class, 'postEmployeeListColumns'])->name('employee-list-update-columns');
                    Route::get('/employee-roles', [EmployeeListBulkActionsBFFController::class, 'getEmployeeRoles'])->name('employee-list-bulk-get-roles');
                    Route::post('/employee-roles', [EmployeeListBulkActionsBFFController::class, 'postEmployeeRoles'])->name('employee-list-bulk-update-roles');
                    Route::post('/v2/employee-roles', [EmployeeListBulkActionsBFFController::class, 'postEmployeeRolesV2'])->name('employee-list-bulk-update-roles-v2');
                    Route::post('/invite-employees', [EmployeeListBulkActionsBFFController::class, 'postInviteEmployees'])->name('employee-list-bulk-invite');
                    Route::post('/complete-onboarding', [EmployeeListBulkActionsBFFController::class, 'postCompleteOnboarding'])->name('employee-list-bulk-complete-onboarding');
                    Route::post('/delete-employee-bulk', [EmployeeListBulkActionsBFFController::class, 'postBulkDeleteEmployee'])->name('employee-list-bulk-delete');
                    Route::post('/employee-work-schedules', [EmployeeListBulkActionsBFFController::class, 'postEmployeeWorkSchedule'])->name('employee-list-bulk-update-working-schedules');
                    Route::get('/accrual-policies', [EmployeeListBulkActionsBFFController::class, 'getAccrualPolicies'])->name('employee-list-bulk-get-accrual-policy');
                    Route::post('/accrual-policies', [EmployeeListBulkActionsBFFController::class, 'setAccrualPolicy'])->name('employee-list-bulk-update-accrual-policy');
                    Route::post('/v2/accrual-policies', [EmployeeListBulkActionsBFFController::class, 'setAccrualPolicyV2'])->name('employee-list-bulk-update-accrual-policy-v2');
                    Route::get('/employee-attributes', [EmployeeListBulkActionsBFFController::class, 'getEmployeeAttributes'])->name('employee-list-bulk-get-attributes');
                    Route::post('/employee-attributes', [EmployeeListBulkActionsBFFController::class, 'postEmployeeAttributeBulkChanges'])->name('employee-list-bulk-update-attributes');
                    Route::post('/default-employee-list-view', [EmployeeListViewsBFFController::class, 'postSaveDefaultView'])->name('employee-list-views-update-default');
                    Route::post('/reset-to-default-view', [EmployeeListViewsBFFController::class, 'postResetCurrentView'])->name('employee-list-views-reset');
                    Route::post('/employee-list-view', [EmployeeListViewsBFFController::class, 'postSavedView'])->name('employee-list-views-save-view');
                    Route::delete('/employee-list-view', [EmployeeListViewsBFFController::class, 'deleteSavedView'])->name('employee-list-views-delete-view');
                    Route::get('/employee-header/{employeeId}', [EmployeeHeaderController::class, 'getEmployeeForEmployeeList'])->name('employee-list-profile-editor-header');
                    Route::get('/filter/{attributeName}', [EmployeeListFiltersBFFController::class, 'getFilterOptions'])->name('employee-list-filter-values');
                    Route::get('/approvers-and-substitutes/{employeeIds}', [EmployeeListDataBFFController::class, 'getApproversAndSubstitutes'])->name('employee-list-get-approvers');
                    Route::post('/export', [EmployeeListExportBFFController::class, 'postExport'])->name('employee-list-export');
                    Route::post('/export/async', [EmployeeListExportBFFController::class, 'postExportAsync'])->name('employee-list-export-async');
                    Route::post('/export/sync', [EmployeeListExportBFFController::class, 'postExportSync'])->name('employee-list-export-sync');
                });

                Route::group(['prefix' => 'staff/employee/bff'], function () {
                    Route::post('/attribute-changes', EmployeeAttributeChangesController::class);
                    Route::get('/attribute-changes', [
                        EmployeeAttributeChangesController::class,
                        'getChangeRequests',
                    ]);
                    Route::put('/attribute-changes/{changeId}', [
                        EmployeeAttributeChangesController::class,
                        'retryChangeRequest',
                    ]);
                });
                // End EL v3

                // Timeline v2
                Route::group(['prefix' => 'staff/employee-timeline/bff'], function () {
                    Route::get('/data', [EmployeeTimelineDataBFFController::class, 'getTimelineData'])->name('employee-timeline-data-get');
                    Route::post('/data', [EmployeeTimelineDataBFFController::class, 'getTimelineData'])->name('employee-timeline-data');
                    Route::get('/filters', [EmployeeTimelineDataBFFController::class, 'getTimelineFilters'])->name('employee-timeline-filters');
                    Route::get('/filters/{attributeId}', [EmployeeTimelineDataBFFController::class, 'getFilterOptions'])->name('timeline-filter-values');
                });
                // End Timeline v2

                // Change Requests v2
                Route::group([
                    'middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE,
                ], function () {
                    Route::get('staff/changes/{employee_id?}', MicroFrontend500Controller::class)->name('staff.changes');
                });
                Route::group(['prefix' => 'staff/change-requests/bff'], function () {
                    Route::get('/{employee_id?}', [EmployeeChangeRequestsBFFController::class, 'getChanges'])
                        ->name('employee-change-request.get-changes');
                    Route::post('/changes', [EmployeeChangeRequestsBFFController::class, 'postChanges'])
                        ->name('employee-change-requests.post-changes');
                    Route::post(
                        '/bulk-accept-changes/{employeeId}',
                        [EmployeeChangeRequestsBFFController::class, 'postBulkAcceptChanges']
                    )->name('employee-change-requests.bulk-accept-changes');
                });
                // End Change Requests v2

                // Workforce Planning
                Route::group(
                    [
                        'prefix' => 'workforce-planning',
                        'middleware' => [
                            WorkforcePlanningUIAccessRightsCheckMiddleware::class,
                            FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE,
                        ],
                    ],
                    function () {
                        Route::get('/', MicroFrontend500Controller::class)
                            ->name(WorkforcePlanningUIAccessRightsCheckMiddleware::ROOT_ROUTE_NAME);

                        Route::get('/positions', MicroFrontend500Controller::class)
                            ->name(WorkforcePlanningUIAccessRightsCheckMiddleware::POSITIONS_ROUTE_NAME);

                        Route::get('/cycles', MicroFrontend500Controller::class)->name(WorkforcePlanningUIAccessRightsCheckMiddleware::CYCLES_ROUTE_NAME);
                        Route::get('/cycles/{cycleId}', MicroFrontend500Controller::class)->name(WorkforcePlanningUIAccessRightsCheckMiddleware::CYCLE_ROUTE_NAME);
                        Route::get('/cycles/{cycleId}/plans', MicroFrontend500Controller::class)->name(WorkforcePlanningUIAccessRightsCheckMiddleware::CYCLE_PLANS_ROUTE_NAME);
                        Route::get('/cycles/{cycleId}/positions', MicroFrontend500Controller::class)->name(WorkforcePlanningUIAccessRightsCheckMiddleware::CYCLE_POSITIONS_ROUTE_NAME);
                        Route::get('/plans/{planId}', MicroFrontend500Controller::class)->name(WorkforcePlanningUIAccessRightsCheckMiddleware::PLAN_ROUTE_NAME);
                    }
                );
                // End Workforce Planning
            });

            Route::group(['team' => 'id'], function () {
                Route::get('staff/account/{employee_id}', [EmployeeAccountController::class, 'getAccount'])->name('staffAccount')
                    ->middleware('frontend-orchestrator');
                Route::get('api/v0/identity/configuration', [CompanyAuthConfigurationAPIController::class, 'configuration'])->name('auth.company.settings');
                Route::get('api/v1/staff/account/{employee_id}', [EmployeeAccountController::class, 'getAccountData'])->name('staff.bootstrap');
            });
            Route::get('staff/get-export-file', 'Client\StaffController@getExportFile');
            Route::get('staff/celebration/{employee_id}', 'Client\StaffController@getCelebrationPage')->name('celebrationPage');

            Route::group([
                'middleware' => [FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE],
                'team' => TeamsEnum::PET->value,
            ], function () {
                Route::get('staff/details/{employee_id}', MicroFrontend500Controller::class)->name('staffDetails');
                Route::get('staff/me', MicroFrontend500Controller::class)->name('staffMyDetails');
            });

            Route::group(['team' => TeamsEnum::PET->value], function () {
                Route::get('staff/search-attributes', 'Client\StaffController@getSearchAttributes');
                Route::get(
                    'staff/maternity-protection-duration',
                    'Client\StaffController@getMaternityProtectionDuration'
                );

                Route::post(
                    'staff/update-profile-picture/{employeeId}',
                    ProfileImageController::class . '@postUpdateProfilePicture'
                )->name('staff.profile-picture.update');
            });

            // Employee Notes
            Route::group([
                'prefix' => 'staff/notes',
                'team' => TeamsEnum::PET->value,
            ], function () {
                Route::get('/{employeeId}', MicroFrontend500Controller::class)
                    ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                    ->name('staff.notes');

                // BFF endpoints
                Route::delete('/bff/{employeeId}/all', [EmployeeNotesBFFController::class, 'deleteNotes']);
                Route::delete(
                    '/bff/{employeeId}/{noteId}',
                    [EmployeeNotesBFFController::class, 'deleteNote'],
                );
                Route::get('/bff/{employeeId}', [EmployeeNotesBFFController::class, 'getNotes']);
                Route::post('/bff/{employeeId}', [EmployeeNotesBFFController::class, 'postNote']);
            });
            // End Employee Notes

            Route::group([
                'middleware' => [FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE],
                'team' => TeamsEnum::PET->value,
            ], function () {
                Route::get('staff/contract/{employee_id}', MicroFrontend500Controller::class)->name('staffContract');
                Route::get('staff/rehire/{employee_id}', MicroFrontend500Controller::class)->name('staffRehire');
            });

            Route::group([
                'middleware' => [FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE],
                'team' => TeamsEnum::EM->value,
            ], function () {
                Route::get('staff/timeline/{year?}', MicroFrontend500Controller::class)->name('staff.timeline');
            });

            Route::group([
                'team' => TeamsEnum::PET->value,
            ], function () {
                // Employee History
                Route::get('staff/history/{employee_id}', MicroFrontend500Controller::class)
                    ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                    ->name('staff.history');
                Route::get(
                    'staff/history-details/{employeeId}',
                    MicroFrontend500Controller::class
                )
                    ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                    ->name('staff.history.detail');

                // Employee History BFF
                Route::get('staff/history-details/bff/{employee_id}', [EmployeeHistoryDetailsBFFController::class, 'getHistoryDetails']);
                Route::get('staff/history/bff/{employee_id}', [EmployeeHistoryBFFController::class, 'getHistory']);
                Route::get('staff/add-history/bff/{employee_id}', [EmployeeHistoryDetailsBFFController::class, 'getHistoryFillableAttributes']);
                Route::post('staff/add-history/bff/{employee_id}', [EmployeeHistoryDetailsBFFController::class, 'addHistory']);
                Route::put('staff/update-history/bff/{employee_id}', [EmployeeHistoryDetailsBFFController::class, 'updateHistory']);

                Route::get('staff/attribute-filter-values', 'Client\StaffController@getAttributeFilterValues');
                Route::post('staff/attribute-filter-values', 'Client\StaffController@postGetAttributeValues');
                Route::post('staff/add-attribute-filter', 'Client\StaffController@postAddAttributeFilter');
                Route::post(
                    'staff/remove-attribute-filter',
                    'Client\StaffController@postRemoveAttributeFilter'
                );

                Route::post(
                    'staff/{employeeId}/scheduled-changes',
                    'Client\StaffController@postScheduledChanges'
                );

                //Staff wizard
                Route::get('staff/{employeeId}/employee-availability', 'Client\StaffController@checkEmployeeAvailability');
                Route::get('staff/wizard/bff', 'Client\EmployeeWizardBFFController@getEmployeeWizardFormData');
                Route::post('staff/wizard/bff', 'Client\EmployeeWizardBFFController@postCreateEmployee');
                Route::get(
                    'staff/wizard/bff/department-weekly-hours',
                    'Client\EmployeeWizardBFFController@getDepartamentWeeklyHours'
                );
            });

            Route::group([
                'team' => TeamsEnum::ARM->value,
            ], function () {
                Route::get('staff/roles/{employeeId}', 'Client\StaffController@getRoles')->name('staff.roles')
                    ->middleware('frontend-orchestrator');
                Route::put('staff/update-roles/{employeeId}', 'Client\StaffController@putUpdateRoles');
            });

            Route::group([
                'prefix' => 'organization/org-units',
                'middleware' => ['frontend-orchestrator'],
                'team' => TeamsEnum::OS->value,
            ], function () {
                $routeOrgUnits = Route::get('{all?}', MicroFrontendController::class)->where('all', '.*');
                $routeOrgUnits->defaults = [
                    'frontend' => 'employeesOrganizations',
                    'mountId' => 'employees-organizations-view-org-units',
                    'pageTitle' => 'Org units',
                    'featureFlag' => 'OS-2-enable-org-units',
                ];
            });

            Route::group([
                'prefix' => 'organization/org-chart',
                'middleware' => ['frontend-orchestrator'],
                'team' => TeamsEnum::OS->value,
            ], function () {
                $routeOrgUnits = Route::get('{all?}', MicroFrontendController::class)
                    ->where('all', '.*')
                    ->name('organization.org-chart');
                $routeOrgUnits->defaults = [
                    'frontend' => 'employeesOrganizations',
                    'mountId' => 'employees-organizations-view-org-chart',
                    'pageTitle' => 'Org chart',
                    'featureFlag' => 'OS-529-enable-new-org-chart',
                ];
            });

            Route::group([
                'prefix'     => 'organization/workplaces',
                'middleware' => ['frontend-orchestrator'],
                'team'       => TeamsEnum::OM->value,
            ], function () {
                $routeWorkplaces = Route::get('{path?}', MicroFrontendController::class)
                    ->where('path', '.*')
                    ->name('Workplaces');
                $routeWorkplaces->defaults = [
                    'frontend'    => 'employeesOrganizations',
                    'mountId'     => 'employees-organizations-view-workplaces',
                    'pageTitle'   => 'Workplaces',
                    'featureFlag' => 'ORGM-1743-workplaces-O11',
                ];
            });

            Route::group([
                'prefix' => 'configuration/legal-entities',
                'middleware' => [FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE],
                'team' => TeamsEnum::OM->value,
            ], function () {
                Route::get('{path?}', MicroFrontend500Controller::class)
                    ->where('path', '.*')
                    ->name('configuration.legalEntities');
            });

            Route::group([
                'prefix' => 'configuration/permanent-establishments',
                'middleware' => [FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE],
                'team' => TeamsEnum::OM->value,
            ], function () {
                Route::get('{path?}', MicroFrontend500Controller::class)
                    ->where('path', '.*')
                    ->name('configuration.permanentEstablishments');
            });

            Route::group([
                'team' => 'dm',
            ], function () {
                Route::get('documents/employee-documents/{employee_id}/{category_id?}', MicroFrontend500Controller::class)
                    ->middleware('frontend-orchestrator:skipFeatureFlags')
                    ->name('employee.documents');
                Route::post('documents/upload/{employee_id}', 'Client\DocumentController@postUpload');
                Route::get('documents/download/{document_id}/{hashed_name}', 'Client\DocumentController@getDownload')
                    ->name('documents.download');
                Route::get(
                    'documents/preview-popup/{document_id}/{hashed_name}',
                    'Client\DocumentController@getPreviewPopup'
                )
                    ->middleware('allow-embed-headers')
                    ->name('documents.preview-popup');
                Route::delete('documents/{document_id}/{hashed_name?}', 'Client\DocumentController@deleteDocument');
                Route::post(
                    'documents/template-preview/{employee_id}',
                    'Client\DocumentController@postTemplatePreview'
                );
                Route::get(
                    'documents/template-preview/{employee_id}/{template_id}',
                    'Client\DocumentController@getTemplatePreview'
                )
                    ->middleware('allow-embed-headers')
                    ->name('documents.preview');
                Route::get(
                    'documents/template-variables/{employee_id}',
                    'Client\DocumentController@getTemplateVariables'
                );
            });

            Route::get('calendar', MicroFrontend500Controller::class)
                ->name('calendar')
                ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE);

            Route::get('calendar/team-view', MicroFrontend500Controller::class)
                ->name('calendar.team-view')
                ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE);

            Route::group([
                'middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE,
                'prefix' => 'calendar/employees/{employee_id}',
            ], function () {
                Route::get('', MicroFrontend500Controller::class)
                    ->name('calendar.employee-view');

                Route::get('monthly', MicroFrontend500Controller::class)
                    ->name('calendar.employee-view.monthly');

                Route::get('yearly', MicroFrontend500Controller::class)
                    ->name('calendar.employee-view.yearly');
            });

            Route::group([
                'middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE,
                'prefix' => 'calendar/me',
            ], function () {
                Route::get('', MicroFrontend500Controller::class)
                    ->name('calendar.me-view');

                Route::get('monthly', MicroFrontend500Controller::class)
                    ->name('calendar.me-view.monthly');

                Route::get('yearly', MicroFrontend500Controller::class)
                    ->name('calendar.me-view.yearly');
            });

            Route::get(
                'calendar/proposable-employee-list/{timeOffTypeId}',
                'Client\CalendarController@getProposableEmployeeList'
            );

            Route::group(['middleware' => 'frontend-orchestrator'], function () {
                $myRoute = Route::get('inbox', 'Client\InboxViewController@index')
                    ->name('workManagementInbox');
                $myRoute->defaults = [
                    'frontend' => 'workManagement',
                    'mountId' => 'work-management-inbox',
                    'pageTitle' => 'navigation.sidebar.items.inbox',
                    'featureFlag' => 'TAW-6302-work-management',
                ];
            });

            Route::controller(PersonalAbsencesController::class)->group(function () {
                Route::get('time-off/employee/{employee_id}', ['uses' => 'getPersonalAbsencesView', 'team' => 'tm'])
                    ->name('employeeAbsence')->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE);
                Route::get('time-off/employee/{employee_id}/monthly', ['uses' => 'getPersonalAbsencesView', 'team' => 'tm'])
                    ->name('employeeAbsenceMonthly')->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE);
                Route::get('time-off/employee/{employee_id}/yearly', ['uses' => 'getPersonalAbsencesView', 'team' => 'tm'])
                    ->name('employeeAbsenceYearly')->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE);
            });

            Route::post(
                'absence-policies/employees/{employee_id?}',
                'Personio\HRM\Absences\Http\Controllers\AbsencePolicyController@setOrDeleteToEmployees'
            )->name('absence-policies.set-or-delete-to-employees');

            Route::group([
                'team' => 'tm',
            ], function () {
                Route::get('new/absence', 'Client\TimeOffController@redirectToAbsenceRequest')->name('newAbsence');
                Route::post('time-off/accept/{period_id}', 'Client\TimeOffController@postAccept');
                Route::post('time-off/reject/{period_id}', 'Client\TimeOffController@postReject');
                Route::post('time-off/certificate/{period_id}/accept', 'Client\TimeOffController@postCertificateAccept');
                Route::post('time-off/certificate/{period_id}/reject', 'Client\TimeOffController@postCertificateReject');
                Route::post(
                    'time-off/deletion-request/{period_id}/accept',
                    'Client\TimeOffController@postTimeOffDeletionRequestAccept'
                );
                Route::post(
                    'time-off/deletion-request/{period_id}/reject',
                    'Client\TimeOffController@postTimeOffDeletionRequestReject'
                );
                Route::get('time-off/view-period-popup/{periodId}', 'Client\TimeOffController@getViewPeriodPopup');
                Route::get('time-off/substitutes/{employee_id}', [Client\TimeOffController::class, 'getSubstitutes'])
                    ->middleware(['html-decode-json-response']);
                Route::post('time-off/substitute-accept/{period_id}', 'Client\TimeOffController@postSubstituteAccept');
                Route::post('time-off/substitute-reject/{period_id}', 'Client\TimeOffController@postSubstituteReject');

                Route::post(
                    'substitute/reject-all',
                    [
                        'team' => 'wevo',
                        'uses' => 'Personio\HRM\Approvals\Http\Controllers\SubstitutePeriodController@rejectAllBySubstituteIds',
                    ],
                );

                Route::post(
                    'substitute/reject-for-employee/{employeeId}',
                    [
                        'team' => 'wevo',
                        'uses' => 'Personio\HRM\Approvals\Http\Controllers\SubstitutePeriodController@rejectAllBySubstituteId',
                    ],
                );
            });
            Route::get(
                'employees/{employee_id}/absence-types/{absence_type_id}/policy-application-descriptions',
                'Personio\HRM\Absences\Http\Controllers\AbsencePolicyController@getPolicyApplicationDescriptions'
            )->name('employee.get-application-descriptions');

            Route::get('time-off/holidays/{employee_id}', ['Client\TimeOffController', 'getHolidays']);
            Route::post('account/create/{employee_id}', [AccountController::class, 'getCreate']);
            Route::post('account/create-json/{employee_id}', [AccountController::class, 'getCreateJson']);
            Route::group(['team' => 'id'], function () {
                Route::get(
                    'account/send-password-reminder/{employee_id}',
                    [AccountController::class, 'getSendPasswordReminder']
                )->name('account.send-password-reminder');
                Route::post(
                    'account/resend-json/{employeeId}',
                    [AccountController::class, 'getResendJson']
                )->name('account.resent-invitation-json');
                Route::post(
                    'account/resend/{employeeId}',
                    [AccountController::class, 'getResend']
                )->name('account.resent-invitation');
                Route::post(
                    'account/change-password-json/{employee_id}',
                    [AccountController::class, 'postChangePasswordJson']
                )->name('account.change-password-json.post');
                Route::post(
                    'account/change-password/{employee_id}',
                    [AccountController::class, 'postChangePassword']
                )->name('account.change-password.post');
                Route::post(
                    'account/reset-password',
                    [AccountController::class, 'postResetPassword']
                )->name('account.reset-self-password');
                Route::post(
                    'account/reset-password-json',
                    [AccountController::class, 'postResetPasswordJson']
                )->name('account.reset-self-password-json');
                Route::post(
                    'account/reset-google-authenticator-json/{employeeId}',
                    [AccountController::class, 'postResetGoogleAuthenticatorJson']
                )->name('account.reset-google-authenticator-json');
                Route::post(
                    'account/reset-google-authenticator/{employeeId}',
                    [AccountController::class, 'postResetGoogleAuthenticator']
                )->name('account.reset-google-authenticator');
                Route::get(
                    'account/login-as-employee/{employeeId}',
                    [AccountController::class, 'getLoginAsEmployee']
                )->name('account.company-impersonation');
            });
            Route::group([
                'middleware' => ['org-chart-v3', FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE],
                'team' => TeamsEnum::OS->value,
            ], function () {
                Route::get('orgchart', MicroFrontend500Controller::class);
                Route::get('orgchart/show', MicroFrontend500Controller::class);
            });

            Route::get('reminders/confirm/{notification_id}', 'Client\RemindersController@getConfirm');

            Route::post('reminders/confirmAjax/{notification_id}', 'Client\RemindersController@getConfirmAjax')
                ->name('reminders.postConfirmAjaxEndpoint');

            Route::get(
                'reminders/employee/{employee_id}',
                'Client\RemindersController@getReminders'
            )->name('employeeReminders')->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE);
            Route::get(
                'api/v1/reminders/employee/{employee_id}',
                'Client\RemindersController@getRemindersData'
            )->name('employeeRemindersData');
            Route::post('reminders/add-static/{employee_id}', 'Client\RemindersController@postAddStatic');
            Route::post('reminders/delete-reminder/{employee_id}', 'Client\RemindersController@postDeleteReminder');
            Route::post('reminders/edit-reminder/{reminderId}', 'Client\RemindersController@postEditReminder');
            Route::get(
                'reminders/edit-reminder-popup/{reminderId}',
                'Client\RemindersController@getEditReminderPopup'
            );
            Route::get('reminders/attribute-filters', 'Client\RemindersController@renderAccessibleAttributeValues');

            Route::get('reporting', ['team' => 'AR', 'uses' => 'Client\AnalyticsReportingController@redirectToReportingOverview']);

            Route::group(['prefix' => 'reporting', 'middleware' => 'frontend-orchestrator', 'team' => 'AR'], function () {
                $overviewRoute = Route::get('overview', [AnalyticsReportingController::class, 'getShell'])->name('reporting.overview');
                $overviewRoute->defaults = [
                    'frontend' => 'analyticsReportingFrontend',
                    'mountId' => 'analytics-reporting-frontend',
                    'pageTitle' => 'navigation.main.reports',
                    'featureFlag' => 'APB-55-report-builder',
                ];

                $keyMetricRoute = Route::get('key-metrics', MicroFrontendController::class)->name('reporting.keyMetrics');
                $keyMetricRoute->defaults = [
                    'frontend' => 'analyticsReportingFrontend',
                    'mountId' => 'analytics-reporting-frontend',
                    'pageTitle' => 'navigation.main.reports',
                    'featureFlag' => 'APB-1731-proactive-insights-v1',
                ];

                $reportsListRoute = Route::get('reports', [AnalyticsReportingController::class, 'getShell'])
                    ->name('reporting.reports');
                $reportsListRoute->defaults = [
                    'frontend' => 'analyticsReportingFrontend',
                    'mountId' => 'analytics-reporting-frontend',
                    'pageTitle' => 'navigation.main.reports',
                    'featureFlag' => 'APB-55-report-builder',
                ];
                Route::get('manage', [AnalyticsReportingController::class, 'redirectToCreateReport']);
                Route::group(['prefix' => 'manage', 'middleware' => 'frontend-orchestrator'], function () {
                    $route = Route::get('{any?}', [AnalyticsReportingController::class, 'getShell'])
                        ->where('any', '.*')
                        ->name('manage');
                    $route->defaults = [
                        'frontend' => 'analyticsReportingFrontend',
                        'mountId' => 'analytics-reporting-frontend',
                        'pageTitle' => 'navigation.main.reports',
                        'featureFlag' => 'APB-55-report-builder',
                    ];
                });
            });

            Route::get('reports', ['uses' => 'Client\ReportsController@getIndex', 'team' => 'AR']);
            Route::group(['middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE, 'team' => 'AR'], function () {
                Route::get('reports/view/absence-days', 'Client\ReportsController@getAbsenceDaysView');
                Route::get('reports/view/employee-turnover', 'Client\ReportsController@getEmployeeTurnoverView');
                Route::get('reports/view/fte', 'Client\ReportsController@getFteView');
                Route::get('reports/view/headcount', 'Client\ReportsController@getHeadcountView');
                Route::get('reports/view/birthdays', 'Client\ReportsController@getBirthdaysView');
                Route::get('reports/view/ending-contracts', 'Client\ReportsController@getEndingContractsView');
                Route::get('reports/view/hires', 'Client\ReportsController@getHiresView');
                Route::get('reports/view/probation-periods', 'Client\ReportsController@getProbationPeriodsView');
                Route::get('reports/view/terminations', 'Client\ReportsController@getTerminationsView');
                Route::get('reports/view/time-off-rate', 'Client\ReportsController@getAbsenceRateView');
            });

            Route::get('reports/view/{reportId}', ['uses' => 'Client\ReportsController@getView', 'team' => 'AR']);
            Route::post('reports/export/{reportId}', ['uses' => 'Client\ReportsController@postExport', 'team' => 'AR']);

            Route::get('reports/defaults/{reportName}', ['uses' => 'Api\Reports\ReportsAPIController@getDefaults', 'team' => 'AR']);
            Route::post('reports/data/{reportName}', ['uses' => 'Client\ReportsController@postObtainReportData', 'team' => 'AR']);
            Route::post('reports/details/{reportName}', ['uses' => 'Client\ReportsController@postObtainReportCellDetails', 'team' => 'AR']);
            Route::post(
                'reports/refresh/{reportName}',
                ['uses' => 'Api\Reports\ReportsAPIController@postRefreshIndexForCompany', 'team' => 'AR']
            );
            Route::get(
                'reports/check/{reportName}',
                ['uses' => 'Api\Reports\ReportsAPIController@checkIndexForCompanyIsRunning', 'team' => 'AR']
            );
            Route::post('reports/data/export/{reportName}', ['uses' => 'Client\ReportsController@postExportReportData', 'team' => 'AR']);
            Route::post('list-reports/data/{reportName}', ['uses' => 'Client\ReportsController@getEmployeeListData', 'team' => 'AR']);
            Route::post('list-reports/data/export/{reportName}', ['uses' => 'Client\ReportsController@getEmployeeListExport', 'team' => 'AR']);

            Route::get('rights-export', [Client\RightsExportController::class, 'getRightsExport']);

            Route::get('exports', ExportsController::class . '@getIndex');
            Route::post('exports/add-export', ExportsController::class . '@postAddExport');
            Route::post('exports/update-export/{export_id}', ExportsController::class . '@postUpdateExport');
            Route::post('exports/delete-export', ExportsController::class . '@postDeleteExport');
            Route::post('exports/delete-export-file', ExportsController::class . '@postDeleteExportFile');
            Route::get('exports/download/{export_file_id}', ExportsController::class . '@getDownload');
            Route::post('exports/export-now', ExportsController::class . '@postExportNow');
            Route::get('exports/{export_id}', ExportsController::class . '@ajaxLoadExportContent');

            Route::get('settings', 'Client\SettingsController@getIndex');
            Route::get('settings/language', 'Client\SettingsController@getLanguage');
            Route::post('settings/language', 'Client\SettingsController@postLanguage');
            Route::get('settings/notifications', 'Client\SettingsController@getNotifications');
            Route::post('settings/update-notifications', 'Client\SettingsController@postUpdateNotifications');
            Route::get(
                'settings/reminders',
                [
                    'uses' => 'Client\SettingsController@getReminders',
                    'team' => 'taw',
                ]
            );
            Route::get('settings/email', 'Client\SettingsController@getEmail');
            Route::post('settings/email', 'Client\SettingsController@postEmail')
                ->middleware('prevent-xss:' . ContentCleaner::FILTER_SAFE_HTML);

            Route::get('settings/integrations/{id?}', 'Client\SettingsController@getIntegrations');

            Route::group([
                'team' => 'wevo',
            ], function () {
                Route::get('onboarding/employee/{employee_id}')
                    ->uses([OnboardingController::class, 'getEmployee'])
                    ->name('employeeOnboarding')
                    ->whereNumber('employee_id')
                    ->middleware('frontend-orchestrator');
                Route::get('api/v1/onboarding/employee/{employee_id}')
                    ->uses([OnboardingController::class, 'getEmployeeOnboardingData'])
                    ->whereNumber('employee_id');
                Route::post('api/v1/onboarding/update-step-status/{employee_id}')
                    ->uses([OnboardingController::class, 'postUpdateStepStatusApi'])
                    ->whereNumber('employee_id');
                Route::get('onboarding/assign-template/{employee_id}/{template_id}')
                    ->uses([OnboardingController::class, 'getAssignTemplate'])
                    ->whereNumber(['employee_id', 'template_id']);
                Route::post('onboarding/assign-template/{employee_id}')
                    ->uses([OnboardingController::class, 'postAssignTemplate'])
                    ->whereNumber('employee_id');
                Route::post('onboarding/remove-template/{onboarding}/{employeeId}')
                    ->uses([OnboardingController::class, 'postRemoveTemplate'])
                    ->whereNumber('employee_id');
                Route::post('onboarding/update-step-status/{employee_id}')
                    ->uses([OnboardingController::class, 'postUpdateStepStatus'])
                    ->whereNumber('employee_id');
                Route::get('onboarding/employee-step-details/{employee_id}/{template_id}/{step_id}')
                    ->uses([OnboardingController::class, 'getEmployeeStepDetails'])
                    ->middleware('frontend-orchestrator')
                    ->whereNumber(['employee_id', 'template_id', 'step_id']);
                Route::post('onboarding/employee-step-details/{employee_id}/{template_id}/{step_id}')
                    ->uses([OnboardingController::class, 'postEmployeeStepDetails'])
                    ->whereNumber(['employee_id', 'template_id', 'step_id'])
                    ->middleware('prevent-xss:' . ContentCleaner::FILTER_SAFE_HTML);
                Route::post('onboarding/api/employee-step-details/{employee_id}/{template_id}/{step_id}/form-fields')
                    ->name('onboarding.api.employee-step-details.save-general-step-form-fields')
                    ->uses([OnboardingController::class, 'updateGeneralStepFormFieldsValue'])
                    ->whereNumber(['employee_id', 'template_id', 'step_id'])
                    ->middleware('prevent-xss:' . ContentCleaner::FILTER_SAFE_HTML);
                Route::get('onboarding/employee-step-details/{employee_id}/{template_id}/{step_id}/form-fields')
                    ->uses([OnboardingController::class, 'getStepFormFields'])
                    ->whereNumber(['employee_id', 'template_id', 'step_id']);
                Route::get('onboarding/step-metadata/{employee_id}/{template_id}/{step_id}')
                    ->uses([OnboardingController::class, 'getStepMetadata'])
                    ->whereNumber(['employee_id', 'template_id', 'step_id']);
                Route::get('onboarding/email/{employee_id}/{template_id}/{step_id}/details')
                    ->uses([OnboardingController::class, 'getEmailStepDetails'])
                    ->whereNumber(['employee_id', 'template_id', 'step_id']);
                Route::get('onboarding/download/{employee_id}/{item_id}')
                    ->uses([OnboardingController::class, 'getDownloadDocument'])
                    ->whereNumber(['employee_id', 'item_id']);
                Route::delete('onboarding/delete-synthetic-test-templates')
                    ->uses([OnboardingController::class, 'deleteSyntheticTestOnboardingTemplates']);
            });

            Route::group(['middleware' => ['assert-feature:' . SubscriptionFeatureLimit::BASIC_DEVELOPMENT_PERFORMANCE]], function () {
                Route::get(
                    'performance/employee/{employee_id}/{year?}',
                    'Client\PerformanceController@getEmployee'
                )->name('employeePerformance');
                Route::get(
                    'performance/feedback/{performance_feedback_id}/after-creation',
                    'Client\PerformanceController@getFeedbackAfterCreation'
                )->name('feedback-after-creation');
                Route::post('performance/add-review/{employee_id}', 'Client\PerformanceController@postAddReview');
                Route::post(
                    'performance/update-comment/{comment_id}',
                    'Client\PerformanceController@postUpdateComment'
                )->middleware('prevent-xss:' . ContentCleaner::FILTER_SAFE_HTML);
                Route::post(
                    'performance/delete-comment/{comment_id}',
                    'Client\PerformanceController@postDeleteComment'
                );

                Route::post(
                    'performance/update-feedback/{feedback_id}',
                    'Client\PerformanceController@postUpdateFeedback'
                )->middleware('prevent-xss:' . ContentCleaner::FILTER_SAFE_HTML);

                Route::post(
                    'performance/feedback/{feedbackId}/documents',
                    'Client\PerformanceController@postUploadFeedbackDocuments'
                );
                Route::post(
                    'performance/delete-feedback/{feedback_id}',
                    'Client\PerformanceController@postDeleteFeedback'
                );

                Route::post('performance/update-target/{target_id}', 'Client\PerformanceController@postUpdateTarget')
                    ->middleware('prevent-xss:' . ContentCleaner::FILTER_SAFE_HTML);
                Route::post('performance/delete-target/{target_id}', 'Client\PerformanceController@postDeleteTarget');
                Route::delete('performance/kpis/{kpi_id}', 'Client\PerformanceController@deleteKpi')->name('deleteKpi');
            });

            Route::group(['team' => 'SAL'], function () {
                Route::get('salary/employee-salary/{employee_id}/{year?}')
                    ->uses([Client\PayrollController::class, 'getEmployeeSalary'])
                    ->middleware('frontend-orchestrator')
                    ->name('salary.employee-salary');
                Route::post('salary/update-salary-month/{employee_id}/{year}/{month}')
                    ->uses([Client\PayrollController::class, 'postUpdateSalaryMonth']);
                Route::get('salary/edit-employee-salary/{employee_id}')
                    ->name('salary.edit-employee-salary')
                    ->uses([Client\PayrollController::class, 'getEditEmployeeSalary']);
                Route::post('salary/delete-employee-salary/{employee_id}')
                    ->uses([Client\PayrollController::class, 'postDeleteEmployeeSalary']);
            });

            Route::group([
                'team' => 'prepay',
                'middleware' => 'prepay-datadog-span-tags',
            ], function () {
                /* TODO Start: Remove once PREPAY-113-preliminary-payroll-on-O11 is fully rolled out */
                Route::get('payroll-full-width', 'Personio\HRM\Payroll\PreliminaryPayroll\Http\Controllers\PreliminaryPayrollViewController@redirect')
                    ->name('payroll.full-width');
                Route::get('payroll/overview', 'Personio\HRM\Payroll\PreliminaryPayroll\Http\Controllers\PreliminaryPayrollViewController@index')
                    ->name('payroll.overview');
                Route::get('payroll/verification', 'Personio\HRM\Payroll\PreliminaryPayroll\Http\Controllers\PreliminaryPayrollViewController@index')
                    ->name('payroll.verification');
                /* TODO End */

                $baseRoute = Route::get('payroll/{subroute?}', 'Personio\HRM\Payroll\PreliminaryPayroll\Http\Controllers\PreliminaryPayrollViewController@index')
                    ->where('subroute', '^(?!overview|verification).*')
                    ->name('payroll.base')->middleware([
                        \Personio\HRM\Payroll\PreliminaryPayroll\Http\Middleware\PersonioPayrollAccessCheckMiddleware::class,
                        'frontend-orchestrator'
                    ]);

                $baseRoute->defaults = [
                    'frontend' => 'payroll',
                    'mountId' => 'payroll-view-preliminary-payroll',
                    'pageTitle' => 'Payroll',
                    'featureFlag' => 'PREPAY-113-preliminary-payroll-on-O11',
                ];
            });

            Route::get('approval/list/{employee_id?}')
                ->uses([Client\ApprovalController::class, 'getList']);

            Route::group([
                'prefix' => 'welcome',
                'team' => 'act',
            ], function () {
                // the routes here are effectively clones of routes mounted elsewhere. EmbeddedContext
                // will pass along an attribute that can be used to identify whether a route is embedded.
                // these routes can be retired when:
                //   1. the respective settings page has been overhauled, AND
                //   2. the overhauled component can be used directly in the setup wizard.
                // confused about why this is here? https://pzip.to/wtf-iframes
                Route::group([
                    'prefix' => 'embed',
                    'middleware' => ['allow-embed-headers', 'embedded-context:setup-wizard']
                ], function () {
                    Route::get('import/file-upload', [ImportViewController::class, 'getFileUpload']);
                    Route::get('import/progress', [ImportViewController::class, 'getProgress']);
                    Route::get('import/summary', [ImportViewController::class, 'getSummary']);

                    Route::post('offices', [ConfigurationController::class, 'postOffices']);
                    Route::get('offices', [ConfigurationController::class, 'getOffices']);

                    Route::get(
                        'calendar-synchronisation',
                        'Personio\Core\Calendar\Http\Controllers\Configuration\CalendarConfigurationController'
                    );

                    // orchestrator embeds
                    Route::group([
                        'middleware' => [FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE]
                    ], function () {
                        Route::get('absence', MicroFrontend500Controller::class);
                        Route::get('legal-entities/{any?}', MicroFrontend500Controller::class)->where('any', '.*');
                        Route::get('roles/{any?}', MicroFrontend500Controller::class)->where('any', '.*');
                        Route::get('working-hours', MicroFrontend500Controller::class);
                    });
                });

                Route::get('{any?}', MicroFrontend404Controller::class)
                    ->where('any', '.*')
                    ->middleware('frontend-orchestrator');
            });

            Route::group([
                'middleware' => 'frontend-orchestrator',
                'team' => 'FIND',
            ], function () {
                Route::get(
                    'configuration/dashboard',
                    'Client\DashboardConfigurationController@getIndex'
                )->name('configuration.dashboard');
            });

            Route::group([
                'team' => 'wevo',
            ], function () {
                Route::get(
                    'configuration/approvals',
                    'Client\ApprovalsConfigurationController@getIndex'
                )->name('configuration.approvals');
                Route::post(
                    'configuration/approvals/check-before-updating-all-rules',
                    'Client\ApprovalsConfigurationController@postCheckRequestsBeforeUpdatingAllRules'
                )->name('checkBeforeUpdatingAllRulesApprovalConfiguration');
                Route::post(
                    'configuration/approvals/update-all-approval-rules',
                    'Client\ApprovalsConfigurationController@postUpdateAllApprovalRules'
                )->name('updateAllApprovalRules');
                Route::post(
                    'configuration/approvals/update-approvals/{ruleSlug}',
                    'Client\ApprovalsConfigurationController@postUpdateApprovals'
                );
                Route::get('configuration/approvals/filters', 'Client\ApprovalsConfigurationController@getFilters');
                Route::post(
                    'configuration/approvals/add-filter',
                    'Client\ApprovalsConfigurationController@postAddFilter'
                );
                Route::post(
                    'configuration/approvals/update-filter/{filterId}',
                    'Client\ApprovalsConfigurationController@postUpdateFilter'
                );
                Route::post(
                    'configuration/approvals/delete-filter',
                    'Client\ApprovalsConfigurationController@postDeleteFilter'
                );
            });

            Route::get(
                'configuration/company-calendar',
                MicroFrontend500Controller::class
            )
                ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                ->name('configuration.company-calendar');

            Route::get(
                'configuration/absence',
                MicroFrontend500Controller::class
            )
                ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                ->name('configuration.absence');

            Route::get(
                'configuration/attendance',
                'Client\AttendanceConfigurationController@getIndex'
            )->name('configuration.attendance');
            Route::get(
                'configuration/attendance/working-hours',
                'Client\AttendanceConfigurationController@getWorkingHours'
            )
                ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                ->name('configuration.attendances.working-hours');
            Route::get(
                'configuration/attendance/entrance-app',
                MicroFrontend404Controller::class
            )
                ->middleware('frontend-orchestrator')
                ->name('configuration.attendance.kiosks');
            Route::get(
                'configuration/attendance/tracking-profiles',
                MicroFrontend404Controller::class
            )
                ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                ->name('configuration.attendance.tracking-profiles');

            Route::get(
                'configuration/custom-fields',
                MicroFrontend500Controller::class
            )
                ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                ->name('configuration.custom-fields');
            Route::get(
                'configuration/custom-fields/download-list-missing-translations',
                'Client\CustomFieldsConfigurationController@downloadListOfAttributesMissingTranslations'
            )->name('configuration.custom-fields.download-list-missing-translations');

            Route::get(
                'configuration/compensation-types/{compensationTypeId?}',
                MicroFrontendController::class
            )
                ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                ->name('configuration.compensation-types');

            Route::group(['middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE, 'team' => 'pi'], function () {
                Route::get('configuration/datev', MicroFrontend500Controller::class)
                    ->name('configuration.datev');
            });

            Route::group(['prefix' => 'configuration/payroll-integration', 'middleware' => FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE, 'team' => 'pi'], function () {
                Route::get('{any}', MicroFrontend500Controller::class)->where('any', '.*')->name('configuration.payroll-integration');
            });

            Route::get(
                'configuration/payroll',
                'Client\PayrollConfigurationController@getIndex'
            )->name('configuration.payroll');
            Route::post(
                'configuration/payroll/update-settings',
                'Client\PayrollConfigurationController@postUpdateSettings'
            );
            Route::get(
                'configuration/payroll/hourly-periods',
                'Client\PayrollConfigurationController@getHourlyPeriods'
            );
            Route::post(
                'configuration/payroll/delete-period',
                'Client\PayrollConfigurationController@postDeletePeriod'
            );
            Route::post(
                'configuration/payroll/add-hourly-period',
                'Client\PayrollConfigurationController@postAddHourlyPeriod'
            );
            Route::get(
                'configuration/payroll/accounting-groups',
                'Client\PayrollConfigurationController@getAccountingGroups'
            );
            Route::get(
                'configuration/payroll/employer-information',
                'Client\PayrollConfigurationController@getEmployerInformation'
            );

            Route::group(['middleware' => 'assert-feature:' . SubscriptionFeatureLimit::BASIC_DEVELOPMENT_PERFORMANCE], function () {
                Route::get(
                    'configuration/performance',
                    'Client\PerformanceConfigurationController@getIndex'
                )->name('configuration.performance');
                Route::get(
                    'configuration/performance/general',
                    'Client\PerformanceConfigurationController@getGeneral'
                )->name('configuration.performance.general');
                Route::post(
                    'configuration/performance/update-settings',
                    'Client\PerformanceConfigurationController@postUpdateSettings'
                );
                Route::post(
                    'configuration/performance/add-category',
                    'Client\PerformanceConfigurationController@postAddCategory'
                );
                Route::post(
                    'configuration/performance/add-attribute',
                    'Client\PerformanceConfigurationController@postAddAttribute'
                );
                Route::post(
                    'configuration/performance/update-category/{categoryId}',
                    'Client\PerformanceConfigurationController@postUpdateCategory'
                );
                Route::post(
                    'configuration/performance/delete-category',
                    'Client\PerformanceConfigurationController@postDeleteCategory'
                );
                Route::post(
                    'configuration/performance/delete-attribute',
                    'Client\PerformanceConfigurationController@postDeleteAttribute'
                );
                Route::post(
                    'configuration/performance/update-attributes/{categoryId}',
                    'Client\PerformanceConfigurationController@postUpdateAttributes'
                );
            });

            Route::group([
                'team' => 'wevo',
            ], function () {
                Route::get(
                    'configuration/onboarding',
                    'Client\OnboardingConfigurationController@getIndex'
                )->name('configuration.onboarding');
                Route::get(
                    'configuration/onboarding/templates',
                    'Client\OnboardingConfigurationController@getTemplates'
                );
                Route::post(
                    'configuration/onboarding/add-template',
                    'Client\OnboardingConfigurationController@postAddTemplate'
                );
                Route::post(
                    'configuration/onboarding/duplicate-template',
                    'Client\OnboardingConfigurationController@postDuplicateTemplate'
                );
                Route::post(
                    'configuration/onboarding/delete-template',
                    'Client\OnboardingConfigurationController@postDeleteTemplate'
                );
                Route::put('configuration/onboarding/template', 'Client\OnboardingConfigurationController@putTemplate');
                Route::post(
                    'configuration/onboarding/add-step-to-template',
                    'Client\OnboardingConfigurationController@postAddStepToTemplate'
                );
                Route::post(
                    'configuration/onboarding/remove-step',
                    'Client\OnboardingConfigurationController@postRemoveStep'
                );
                Route::post(
                    'configuration/onboarding/update-template',
                    'Client\OnboardingConfigurationController@postUpdateTemplate'
                );
                Route::get(
                    'configuration/onboarding/steps',
                    'Client\OnboardingConfigurationController@getSteps'
                )->name('configuration.onboarding.steps');
                Route::get(
                    'configuration/onboarding/steps/step/{stepId}',
                    'Client\OnboardingConfigurationController@getStep'
                );
                Route::get(
                    'configuration/onboarding/template-steps/{templateId}',
                    'Client\OnboardingConfigurationController@getTemplateSteps'
                );
                Route::get(
                    'configuration/onboarding/assignable-template-steps/{templateId?}',
                    'Client\OnboardingConfigurationController@getAssignableTemplateSteps'
                );
                Route::get(
                    'configuration/onboarding/email-recipient-information/{stepId}',
                    'Client\OnboardingConfigurationController@getEmailRecipientInformation'
                );
                Route::post(
                    'configuration/onboarding/upload-message-attachment/{stepId}',
                    'Client\OnboardingConfigurationController@postUploadMessageAttachment'
                );
                Route::post(
                    'configuration/onboarding/add-step',
                    'Client\OnboardingConfigurationController@postAddStep'
                );
                Route::post(
                    'configuration/onboarding/delete-step',
                    'Client\OnboardingConfigurationController@postDeleteStep'
                );
                Route::post(
                    'configuration/onboarding/add-item',
                    'Client\OnboardingConfigurationController@postAddItem'
                );
                Route::post(
                    'configuration/onboarding/remove-item',
                    'Client\OnboardingConfigurationController@postRemoveItem'
                );

                Route::post(
                    'configuration/onboarding/update-step',
                    'Client\OnboardingConfigurationController@postUpdateStep'
                )->middleware('prevent-xss:' . ContentCleaner::FILTER_SAFE_HTML);

                Route::post(
                    'configuration/onboarding/update-step-name',
                    'Client\OnboardingConfigurationController@postUpdateStepName'
                )->middleware('prevent-xss:' . ContentCleaner::FILTER_SAFE_HTML);

                Route::get('configuration/onboarding/teams', 'Client\OnboardingConfigurationController@getTeams');
                Route::post(
                    'configuration/onboarding/add-team',
                    'Client\OnboardingConfigurationController@postAddTeam'
                );
                Route::post(
                    'configuration/onboarding/update-team',
                    'Client\OnboardingConfigurationController@postUpdateTeam'
                );
                Route::post(
                    'configuration/onboarding/delete-team',
                    'Client\OnboardingConfigurationController@postDeleteTeam'
                );
                Route::put('configuration/onboarding/team', 'Client\OnboardingConfigurationController@putTeam');
                Route::delete(
                    'configuration/onboarding/attachment-document',
                    ['uses' => 'Client\OnboardingConfigurationController@deleteAttachmentDocument']
                );
            });

                Route::group(
                    [
                        'prefix' => 'configuration/documents/',
                        'team' => 'dm',
                        'middleware' => ['datadog-span-tags']
                    ],
                    function () {
                        Route::get('', 'Client\DocumentsConfigurationController@getIndex')
                            ->name('configuration.documents');
                        Route::get(
                            'template-preview',
                            'Client\DocumentsConfigurationController@getTemplatePreview'
                        );
                        Route::get(
                            'download/{templateId}',
                            'Client\DocumentsConfigurationController@getDownload'
                        );
                        Route::get(
                            'preview-pdf/{templateId}',
                            'Client\DocumentsConfigurationController@getPreviewPdf'
                        )->name('configuration.documents.preview');
                    }
                );

            Route::get('configuration/roles/rights', 'Client\RolesConfigurationController@getRights');

            Route::get('configuration/roles/reminders', [RolesConfigurationController::class, 'getReminders']);

            Route::get('configuration/roles/calendars', 'Client\RolesConfigurationController@getCalendars');
            Route::get('configuration/roles/security', [RolesSecurityConfigurationController::class, 'getSecurity']);
            Route::post('configuration/roles/update-security', [RolesSecurityConfigurationController::class, 'postUpdateSecurity']);
            Route::get('configuration', 'Client\ConfigurationController@getIndex')->middleware('frontend-orchestrator:skipFeatureFlags');
            Route::get(
                'configuration/company',
                'Client\ConfigurationController@getCompany'
            )->name('configuration.company');
            Route::post('configuration/company', 'Client\ConfigurationController@postCompany')
                ->name('configuration.company.update');

            Route::group(['team' => TeamsEnum::OS->value], function () {
                Route::get('configuration/departments', [
                    ConfigurationController::class,
                    'getDepartments',
                ])->name('configuration.departments');
                Route::post('configuration/departments', [
                    ConfigurationController::class,
                    'postDepartments',
                ])
                    ->name('configuration.departments.postDepartments');
            });

            Route::group(['team' => TeamsEnum::OM->value], function () {
                Route::post('configuration/offices', [
                    ConfigurationController::class,
                    'postOffices',
                ])->name('configuration.offices.postOffices');

                Route::get('configuration/offices', [
                    ConfigurationController::class,
                    'getOffices',
                ])->name('configuration.offices')->middleware('workplaces');
                Route::get('configuration/cost-centers', [
                    ConfigurationController::class,
                    'getCostCenters',
                ])->name('configuration.cost-centers');
                Route::post('configuration/cost-centers', [
                    ConfigurationController::class,
                    'postCostCenters',
                ])->name('configuration.cost-centers.postCostCenters');
            });

            Route::get(
                'configuration/time-off',
                'Client\ConfigurationController@getTimeOff'
            )->name('configuration.time-off');

            Route::get(
                'configuration/holidays',
                MicroFrontend500Controller::class
            )
                ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                ->name('configuration.holidays');

            Route::get(
                'configuration/holidays/duplicate-calendar/{holidayCalendarId}',
                'Client\ConfigurationController@getDuplicateHolidayCalendar'
            );

            Route::group(['prefix' => 'configuration/accident-insurance', 'middleware' => 'frontend-orchestrator'], function () {
                $route = Route::get('{any?}', MicroFrontendController::class)->where('any', '.*')->name('configuration.accident-insurance-settings');
                $route->defaults = [
                    'frontend' => 'accidentInsuranceSettingsFrontend',
                    'mountId' => 'accident-insurance-settings-frontend',
                    'pageTitle' => 'navigation.main.configuration',
                ];
            });

            Route::group([
                'team' => 'act',
            ], function () {
                Route::post('delete-demo-account', 'Client\SetupController@postDeleteDemoAccount');

                Route::post('import/upload', 'Personio\HRM\Import\Http\Controllers\ImportController@postUpload');
                Route::get('import/analyze', 'Personio\HRM\Import\Http\Controllers\ImportController@getAnalyze');
                Route::post('import/analyze', 'Personio\HRM\Import\Http\Controllers\ImportController@postAnalyze');
                Route::get('import/confirm', 'Personio\HRM\Import\Http\Controllers\ImportController@getConfirm');
                Route::post('import/confirm', 'Personio\HRM\Import\Http\Controllers\ImportController@postConfirm');

                Route::get('import/file-upload', ImportViewController::class . '@getFileUpload');
                Route::get('import/summary', ImportViewController::class . '@getSummary');
                Route::get('import/progress', ImportViewController::class . '@getProgress');
                Route::get('import/{importId}/validation', ImportViewController::class . '@getValidation');
                Route::get('import/reach-employee-limit', ImportViewController::class . '@getReachEmployeeLimit');
                Route::get('import/block', ImportViewController::class . '@getBlock');
                Route::get('import/timeout', ImportViewController::class . '@getTimeout');

                Route::get('import-histories/{importHistoryId}/download-correction-file', 'Personio\HRM\Import\Http\Controllers\ImportFileDownloadController@downloadCorrectionFileLegacy');
                Route::get('imports/{importId}/download-correction-file', 'Personio\HRM\Import\Http\Controllers\ImportFileDownloadController@downloadCorrectionFile');
                Route::get('imports/{importId}/errors/download', 'Personio\HRM\Import\Http\Controllers\ImportFileDownloadController@downloadErrorFile');

                // v2 import
                Route::get('import/upload', 'Personio\HRM\Import\Http\Controllers\ImportController@getUpload')
                    ->name('import.upload');

                Route::get('import/new', 'Personio\HRM\Import\Http\Controllers\ImportController@getNewImport');

                Route::post(
                    'file-import/upload',
                    'Personio\HRM\Import\Http\Controllers\FileImportController@postUploadFile'
                )->name('file_import.upload');

                Route::post(
                    'file-import/process',
                    'Personio\HRM\Import\Http\Controllers\FileImportController@postProcessUploadedFiles'
                )->name('file_import.process');

                Route::get('file-import/map', 'Personio\HRM\Import\Http\Controllers\FileImportController@getMap')
                    ->name('file_import.map');

                Route::post(
                    'file-import/map',
                    'Personio\HRM\Import\Http\Controllers\FileImportController@postProcessMapping'
                );

                Route::get(
                    'file-import/confirm',
                    'Personio\HRM\Import\Http\Controllers\FileImportController@getConfirm'
                )->name('file_import.confirm');

                Route::post(
                    'file-import/confirm',
                    'Personio\HRM\Import\Http\Controllers\FileImportController@postConfirm'
                );
            });

            Route::get('expenses', 'Personio\HRM\Expenses\Employee\Http\Controllers\ExpensesEmployeeViewController@index');
            Route::get('expenses/{all}', 'Personio\HRM\Expenses\Employee\Http\Controllers\ExpensesEmployeeViewController@index')->where('all', '.*');

            Route::get('expenses-management', 'Personio\HRM\Expenses\BackOffice\Http\Controllers\ExpensesBackOfficeViewController@index');
            Route::get('expenses-management/{all}', 'Personio\HRM\Expenses\BackOffice\Http\Controllers\ExpensesBackOfficeViewController@index')->where('all', '.*');

            Route::get('configuration/marketplace/connected', 'Personio\Integration\Http\Controllers\ConfigurationController')
                ->name('configuration.marketplace.connected');

            Route::group(
                [
                    'prefix' => 'configuration/api',
                    'namespace' => 'Client',
                    'team' => 'int',
                    'middleware' => [ApiConfigurationAccessMiddleware::class],
                ],
                function () {
                    Route::get('', 'ApiConfigurationControllerManagement@redirect')->name('configuration.api');
                    Route::get('credentials', 'ApiConfigurationControllerManagement@redirect');

                    Route::get('credentials/management', 'ApiConfigurationControllerManagement@index')
                        ->name('configuration.api.credentials.management');

                    Route::get('access', 'ApiConfigurationControllerManagement@redirect');
                }
            );

            Route::get(
                'configuration/support/account-owners',
                [
                    'team' => 'cet',
                    'uses' => 'Personio\HRM\Support\Http\Controllers\AccountOwnersController@getList'
                ]
            )->name('configuration.support.account-owners');

            Route::get(
                'configuration/support/contract-owners',
                [
                    'team' => 'cet',
                    'uses' => 'Personio\HRM\Support\Http\Controllers\ContractOwnerListController@getIndex',
                ],
            )->name('configuration.support.contract-owners');

            Route::get(
                'configuration/support/payroll-owners',
                [
                    'team' => 'cet',
                    'uses' => 'Personio\HRM\Support\Http\Controllers\PayrollOwnerListController@getIndex',
                ],
            )->name('configuration.support.payroll-owners');

            Route::get(
                'configuration/support/access',
                'Personio\HRM\Support\Http\Controllers\ImpersonationAccessController@getAccess'
            )->name('configuration.support.access');
            Route::post(
                'configuration/support/access',
                'Personio\HRM\Support\Http\Controllers\ImpersonationAccessController@updateAccess'
            )->name('configuration.support.access.update');

            Route::get('configuration/roles/{all}', 'Client\RolesConfigurationUIController@getIndex')
                ->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                ->where('all', '.*');

            Route::get('configuration/accounting-report/{all?}', MicroFrontend500Controller::class)
                ->name('configuration.accounting-report')
                ->middleware([
                    FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE,
                    'admin-access-right:viewPayrollConfigurations',
                ])
                ->where('all', '.*');

            Route::prefix('api/v1/configuration/roles')->group(function () {
                // General
                Route::get('/', 'Client\RolesConfigurationAPIController@getRoles');
                Route::post('/', 'Client\RolesConfigurationAPIController@addRole');
                Route::post('/{roleId}/duplicate', 'Client\RolesConfigurationAPIController@duplicateRole');
                Route::patch('/{roleId}', 'Client\RolesConfigurationAPIController@renameRole');
                Route::delete('/{roleId}', 'Client\RolesConfigurationAPIController@deleteRole');

                // Members
                Route::get('/employees', 'Client\RolesConfigurationAPIController@getEmployees');
                Route::get('/{roleId}/members', 'Client\RolesConfigurationAPIController@getRoleMembers');
                Route::put('/{roleId}/members', 'Client\RolesConfigurationAPIController@updateRoleMembers');

                // Rights
                Route::get('/{roleId}/rights', 'Client\RolesConfigurationRightsAPIController@getRights');
                Route::patch('/{roleId}/rights', 'Client\RolesConfigurationRightsAPIController@patchRights');

                // Attributes
                Route::get('/attributes', 'Client\RolesConfigurationAttributesAPIController@getAttributes');
            });

            Route::prefix('api/v1/staff/roles/{employeeId}')->group(function () {
                Route::get('', 'Client\StaffRolesAPIController@getRolesData');
                Route::patch('', 'Client\StaffRolesAPIController@patchRolesData');
            });

            Route::prefix('privacy')->group(function () {
                Route::get('imprint', 'Client\SettingsController@getPrivacy')
                    ->name('privacy.imprint');
            });

            Route::prefix('configuration/auth')->group(function () {
                Route::get('/', [Personio\Auth\OAuth\Http\SettingsController::class, 'getSettings']);

                Route::get('/oauth', [Personio\Auth\OAuth\Http\SettingsController::class, 'getSettings'])
                    ->name('configuration.oauth.settings');

                Route::get('/oauth/debug', [Personio\Auth\OAuth\Http\SettingsController::class, 'debugSettings'])
                    ->name('configuration.oauth.debug-settings');

                Route::post('/oauth', [Personio\Auth\OAuth\Http\SettingsController::class, 'setSettings'])
                    ->name('configuration.oauth.update');

                Route::delete('/oauth', [Personio\Auth\OAuth\Http\SettingsController::class, 'deleteSettings'])
                    ->name('configuration.oauth.delete');

                Route::get(
                    '/googleoauth',
                    [Personio\Auth\GoogleOAuth\Http\GoogleAuthenticationSettingsController::class, 'getSettings']
                )->name('configuration.googleoauth.settings');

                Route::post(
                    '/googleoauth',
                    [Personio\Auth\GoogleOAuth\Http\GoogleAuthenticationSettingsController::class, 'setSettings']
                )->name('configuration.googleoauth.settings.update');

                Route::get(
                    '/regularauth',
                    [Personio\Auth\PasswordAuth\Http\Controllers\PasswordAuthenticationSettingsController::class, 'getIndex']
                )->name('configuration.regularauth.settings');

                Route::post(
                    '/regularauth',
                    [Personio\Auth\PasswordAuth\Http\Controllers\PasswordAuthenticationSettingsController::class, 'postUpdate']
                )->name('configuration.regularauth.settings.update');

                Route::post('/oauth/enforce', [Personio\Auth\OAuth\Http\SettingsController::class, 'setEnforced'])
                    ->name('configuration.oauth.enforce');

                Route::post('/oauth/set-optional', [Personio\Auth\OAuth\Http\SettingsController::class, 'setOptional'])
                    ->name('configuration.oauth.optional');

                Route::get(
                    '/login-without-email',
                    MicroFrontend404Controller::class
                )->middleware(FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE)
                    ->name('configuration.mass-activation-code.settings');
            });

            Route::group([
                'team' => 'con',
                'prefix' => 'set-up-personio',
            ], function () {
                Route::get(
                    '/',
                    'Personio\SetupHub\Http\Controllers\SetupHubController@getIndex',
                )->name('setup');
            });
        });

        // billing does not require an active subscription, so we put it into a separate group
        Route::group(['middleware' => ['auth.employee', 'csrf', 'employee.has-role.admin']], function () {
            Route::get('billing', 'Client\BillingController@getIndex')->name('billing');
            Route::get('billing/plan', 'Client\BillingController@getPlan')
                ->name('billing.plan-switch');

            Route::get('billing/plan-switch/{plan_id}', 'Client\BillingController@getPlanSwitch')
                ->name('billing.plan-switch.details');

            Route::post('billing/plan-switch/{plan_id}', 'Client\BillingController@postPlanSwitch');
            Route::get('billing/billing', 'Client\BillingController@getBilling')
                ->name('billing.billing');
            Route::post('billing/billing', 'Client\BillingController@postBilling');
            Route::post('billing/update-payment-method', 'Client\BillingController@postUpdatePaymentMethod');
            Route::get('billing/invoices', 'Client\BillingController@getInvoices')
                ->name('billing.invoices');
            Route::get('billing/invoice-details/{invoiceId}', 'Client\BillingController@getInvoiceDetails');
            Route::get(
                'billing/invoice-details-html/{invoiceId}',
                'Client\BillingController@getInvoiceDetailsHtml'
            );
            Route::post('delete-demo-account', ['uses' => 'Client\SetupController@postDeleteDemoAccount']);

            Route::group([
                'middleware' => [FRONTEND_ORCHESTRATOR_SKIP_FF_MIDDLEWARE],
                'team' => 'con',
            ], function () {
                Route::get('checkout', MicroFrontend500Controller::class);
                Route::get('subscription/dashboard', MicroFrontend500Controller::class);
                Route::get('subscription/dashboard/{subPage}', MicroFrontend500Controller::class)
                    ->where(
                        'subPage',
                        '.*'
                    );
                Route::get('subscription/add-seats', MicroFrontend500Controller::class);
                Route::get('subscription/add-apps', MicroFrontend500Controller::class);
                Route::get('subscription/upgrade', MicroFrontend500Controller::class);
                Route::get('subscription/data-protection-information', MicroFrontend500Controller::class);
            });
        });

        Route::group([
            'prefix' => 'dpa',
            'team' => 'cet',
            'middleware' => ['auth.employee', 'csrf', 'impersonation']
        ], function () {
            Route::get('/', 'Personio\DataPrivacyAgreement\Http\Controllers\ContractController@getList')
                ->name('dpa.contract.list');
            Route::get('/subcontractors', 'Personio\DataPrivacyAgreement\Http\Controllers\ContractController@getSubcontractors')
                ->name('dpa.subcontractors');
            Route::get(
                '/contract/{contract}/download',
                'Personio\DataPrivacyAgreement\Http\Controllers\ContractController@downloadContract'
            )->name('dpa.contract.download');
        });

        /* Customer Messaging Platform Service */
        Route::get('api/msg')
            ->uses(Personio\CustomerMessagingPlatformService\HttpController::class)
            ->middleware([
                'api',
                'impersonation',
                'auth.employee',
                'user-access-log',
                'csrf',
            ]);
    });
});
