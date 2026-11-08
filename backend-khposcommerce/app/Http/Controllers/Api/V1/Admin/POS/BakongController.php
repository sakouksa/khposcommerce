<?php

namespace App\Http\Controllers\Api\V1\Admin\POS;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\POS\BakongKHQRService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BakongController extends BaseApiController
{
    public function __construct(
        protected BakongKHQRService $bakongService
    ) {}

    /**
     * POST /api/v1/pos/khqr/generate
     * Generate real dynamic Bakong KHQR for POS or Online Checkout
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount'        => 'required|numeric|min:0.01',
            'currency'      => 'nullable|string|in:USD,KHR,usd,khr',
            'bill_number'   => 'nullable|string|max:50',
            'account_id'          => 'nullable|string|max:100',
            'merchant_name'       => 'nullable|string|max:100',
            'merchant_city'       => 'nullable|string|max:100',
            'account_information' => 'nullable|string|max:100',
            'acquiring_bank'      => 'nullable|string|max:100',
            'mobile_number'       => 'nullable|string|max:50',
        ]);

        $data = $this->bakongService->generate(
            amount: (float) $validated['amount'],
            currency: strtoupper($validated['currency'] ?? 'USD'),
            billNumber: $validated['bill_number'] ?? null,
            accountId: $validated['account_id'] ?? null,
            merchantName: $validated['merchant_name'] ?? null,
            merchantCity: $validated['merchant_city'] ?? null,
            accountInformation: $validated['account_information'] ?? null,
            acquiringBank: $validated['acquiring_bank'] ?? null,
            mobileNumber: $validated['mobile_number'] ?? null
        );

        return $this->successResponse($data, 'KHQR generated successfully.');
    }

    /**
     * POST /api/v1/pos/khqr/check
     * Verify payment status using MD5 via NBC Bakong Open API
     */
    public function check(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'md5' => 'required|string|size:32',
        ]);

        $result = $this->bakongService->checkTransactionByMd5($validated['md5']);

        return $this->successResponse($result, 'Bakong transaction status checked.');
    }

    /**
     * GET /api/v1/pos/khqr/config
     * Return public Bakong merchant configuration
     */
    public function config(): JsonResponse
    {
        $dbSettings = \App\Models\Setting\Setting::getByKey('bakong_payment_settings');
        if (is_string($dbSettings)) {
            $dbSettings = json_decode($dbSettings, true);
        }
        if (!is_array($dbSettings)) {
            $dbSettings = [];
        }

        return $this->successResponse([
            'account_id'          => $dbSettings['account_id'] ?? config('services.bakong.account_id', 'khqr@aclb'),
            'account_information' => $dbSettings['account_information'] ?? config('services.bakong.account_information', '85520019493'),
            'acquiring_bank'      => $dbSettings['acquiring_bank'] ?? config('services.bakong.acquiring_bank', 'ACLEDA'),
            'mobile_number'       => $dbSettings['mobile_number'] ?? config('services.bakong.mobile_number', '0762825595'),
            'merchant_name'       => $dbSettings['merchant_name'] ?? config('services.bakong.merchant_name', 'SAK OUSA'),
            'merchant_city'       => $dbSettings['merchant_city'] ?? config('services.bakong.merchant_city', 'Phnom Penh'),
            'bank_name'           => $dbSettings['bank_name'] ?? config('services.bakong.bank_name', 'ACLEDA Bank'),
            'has_token'           => !empty($dbSettings['token'] ?? config('services.bakong.token')),
        ]);
    }
}
