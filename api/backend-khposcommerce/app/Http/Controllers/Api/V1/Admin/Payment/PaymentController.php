<?php

namespace App\Http\Controllers\Api\V1\Admin\Payment;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;

class PaymentController extends BaseApiController
{
    public function index(): JsonResponse
    {
        return $this->successResponse([]);
    }
}
