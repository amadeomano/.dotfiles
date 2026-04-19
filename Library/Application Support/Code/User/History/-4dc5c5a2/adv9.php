<?php

namespace Personio\FrontendOrchestrator\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Personio\Core\Artifacts\FrontendReleaseManager;
use Personio\Core\FeatureFlags\Domain\Services\FeatureFlagServiceInterface;
use Workzag\Http\Controllers\Controller;

class MicroFrontendController extends Controller
{
    /** @var FrontendReleaseManager */
    private $frontendReleaseManager;

    private FeatureFlagServiceInterface $splitIOService;

    public function __construct(
        FrontendReleaseManager $frontendReleaseManager,
        FeatureFlagServiceInterface $splitIOService,
    ) {
        $this->frontendReleaseManager = $frontendReleaseManager;
        $this->splitIOService = $splitIOService;
    }

    public function __invoke(Request $request)
    {
        $frontend = $request->route('frontend');
        $mountId = $request->route('mountId');
        $pageTitle = $request->route('pageTitle');
        $featureFlag = $request->route('featureFlag');
        $company = app()->company();

        if ($featureFlag && !$this->splitIOService->isFeatureFlagEnabledForCompany($company, $featureFlag)) {
            return 'FF is off for '.$featureFlag;
            // App::abort(404);
        }

        $assets = $this->frontendReleaseManager->retrieve($frontend);
        return print_r($assets, true);

        $view = view('client/microfrontend');
        return $view
            ->with('pageTitle', $pageTitle)
            ->with('mountId', $mountId)
            ->with('jsAssets', $assets->getJs())
            ->with('cssAssets', $assets->getCss());
    }
}
