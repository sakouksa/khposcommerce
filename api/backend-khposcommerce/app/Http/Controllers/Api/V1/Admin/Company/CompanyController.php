<?php

namespace App\Http\Controllers\Api\V1\Admin\Company;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Company\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CompanyController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $companies = Company::query()
            ->when($request->filled('search'), fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse($companies);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'slug'          => 'nullable|string|max:255|unique:companies,slug',
            'email'         => 'nullable|email|max:255',
            'phone'         => 'nullable|string|max:50',
            'website'       => 'nullable|string|max:255',
            'address'       => 'nullable|string',
            'city'          => 'nullable|string|max:100',
            'province'      => 'nullable|string|max:100',
            'country'       => 'nullable|string|max:10',
            'postal_code'   => 'nullable|string|max:20',
            'tax_number'    => 'nullable|string|max:100',
            'logo'          => 'nullable|string',
            'currency_code' => 'nullable|string|max:10',
            'timezone'      => 'nullable|string|max:100',
            'language'      => 'nullable|string|max:10',
            'is_active'     => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $validated['country'] = $validated['country'] ?? 'KH';
        $validated['currency_code'] = $validated['currency_code'] ?? 'USD';
        $validated['timezone'] = $validated['timezone'] ?? 'Asia/Phnom_Penh';
        $validated['language'] = $validated['language'] ?? 'km';

        $company = Company::create($validated);

        return $this->successResponse($company, 'Company created successfully.', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(Company::findOrFail($id));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $company = Company::findOrFail($id);

        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'slug'          => "sometimes|required|string|max:255|unique:companies,slug,{$id}",
            'email'         => 'nullable|email|max:255',
            'phone'         => 'nullable|string|max:50',
            'website'       => 'nullable|string|max:255',
            'address'       => 'nullable|string',
            'city'          => 'nullable|string|max:100',
            'province'      => 'nullable|string|max:100',
            'country'       => 'nullable|string|max:10',
            'postal_code'   => 'nullable|string|max:20',
            'tax_number'    => 'nullable|string|max:100',
            'logo'          => 'nullable|string',
            'currency_code' => 'nullable|string|max:10',
            'timezone'      => 'nullable|string|max:100',
            'language'      => 'nullable|string|max:10',
            'is_active'     => 'boolean',
        ]);

        if ($request->has('remove_logo') || ($request->has('logo') && empty($validated['logo']))) {
            $validated['logo'] = null;
        }

        $company->update($validated);

        return $this->successResponse($company, 'Company updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $company = Company::findOrFail($id);
        if ($company->logo) {
            app(\App\Services\Support\FileService::class)->delete($company->logo);
        }
        $company->delete();

        return $this->successResponse(null, 'Company deleted successfully.');
    }
}
