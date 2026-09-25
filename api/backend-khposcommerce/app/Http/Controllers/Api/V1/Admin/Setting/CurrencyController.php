<?php

namespace App\Http\Controllers\Api\V1\Admin\Setting;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Setting\Currency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $currencies = Currency::query()
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->when($request->search, fn($q, $v) => $q->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%"))
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse($currencies);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:currencies,code',
            'symbol' => 'required|string|max:10',
            'exchange_rate' => 'required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
            'is_default' => 'sometimes|boolean',
        ]);

        $record = Currency::create($validated);
        return $this->successResponse($record, 'Currency created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $record = Currency::findOrFail($id);
        return $this->successResponse($record, 'Currency retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $record = Currency::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:10|unique:currencies,code,' . $id,
            'symbol' => 'sometimes|required|string|max:10',
            'exchange_rate' => 'sometimes|required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
            'is_default' => 'sometimes|boolean',
        ]);

        $record->update($validated);
        return $this->successResponse($record, 'Currency updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $record = Currency::findOrFail($id);
        $record->delete();
        return $this->successResponse(null, 'Currency deleted successfully');
    }
}
