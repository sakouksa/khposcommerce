<?php

namespace App\Http\Controllers\Api\V1\Admin\Marketing;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Sales\PricingEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PricingEngineController extends BaseApiController
{
    public function __construct(
        protected PricingEngineService $pricingEngine
    ) {
    }

    /**
     * Calculate promotion discount and price breakdown for a cart in real-time.
     * Accessible by POS, Admin Simulator, Customer Web & Mobile.
     */
    public function calculate(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) ($user?->company_id ?? $request->input('company_id', 1));

        // Resolve branch: respect user active branch or requested branch with authorization check
        $requestedBranchId = $request->input('branch_id');
        $branchId = $requestedBranchId ? (int) $requestedBranchId : ($user?->getActiveBranchId() ?? 1);

        if ($user && $requestedBranchId && !$user->canAccessBranch($branchId)) {
            return $this->errorResponse("You are not authorized to calculate pricing for branch ID: {$branchId}", null, 403);
        }

        $payload = [
            'company_id'  => $companyId,
            'branch_id'   => $branchId,
            'channel'     => $request->input('channel', 'pos'),
            'customer_id' => $request->input('customer_id'),
            'items'       => $request->input('items', []),
            'coupon_code' => $request->input('coupon_code'),
            'tax_rate'    => (float) $request->input('tax_rate', 0.0),
        ];

        $result = $this->pricingEngine->calculate($payload);

        return $this->successResponse($result, 'Pricing and promotions calculated successfully');
    }

    /**
     * Validate coupon code for checkout.
     */
    public function validateCoupon(Request $request): JsonResponse
    {
        $code       = (string) $request->input('code', '');
        $subtotal   = (float) $request->input('subtotal', 0.0);
        $customerId = $request->input('customer_id');
        $branchId   = $request->input('branch_id');

        $res = $this->pricingEngine->validateAndApplyCoupon($code, $subtotal, $customerId, $branchId);

        if (!$res['valid']) {
            return $this->errorResponse($res['message'], [
                'valid'           => false,
                'discount_amount' => 0.0,
            ], 422);
        }

        return $this->successResponse([
            'valid'           => true,
            'message'         => $res['message'],
            'discount_amount' => $res['discount_amount'],
            'coupon'          => [
                'id'                 => $res['coupon']->id,
                'code'               => $res['coupon']->code,
                'usage_limit'        => $res['coupon']->usage_limit,
                'usage_per_customer' => $res['coupon']->usage_per_customer,
            ],
            'campaign_id'     => $res['campaign_id'],
        ], 'Coupon is valid');
    }
}
