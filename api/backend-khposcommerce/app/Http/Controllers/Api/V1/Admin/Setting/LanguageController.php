<?php

namespace App\Http\Controllers\Api\V1\Admin\Setting;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Setting\Language;
use Illuminate\Http\JsonResponse;

use Illuminate\Http\Request;

class LanguageController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $languages = Language::query()
            ->when($request->search, fn($q, $v) => $q->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%"))
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse($languages);
    }
}
