<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;

class ConfigController extends BaseApiController
{
    public function index(): JsonResponse
    {
        return response()->json([
            'app_name' => config('app.name', 'KHPosCommerce'),
            'locales' => ['km', 'en'],
            'default_currency' => 'USD',
            'supported_currencies' => ['USD', 'KHR'],
        ]);
    }
}
