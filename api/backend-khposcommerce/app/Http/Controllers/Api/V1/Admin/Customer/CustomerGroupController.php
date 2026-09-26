<?php

namespace App\Http\Controllers\Api\V1\Admin\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Customer\CustomerGroup;
use App\Services\Support\CsvService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerGroupController extends BaseApiController
{
    public function __construct(
        protected CsvService $csvService
    ) {}

    /**
     * GET /api/v1/customer-groups
     */
    public function index(Request $request): JsonResponse
    {
        $groups = CustomerGroup::withCount('customers')
            ->when($request->status === 'deleted', function ($q) {
                $q->onlyTrashed();
            })
            ->when($request->status && $request->status !== 'deleted' && $request->status !== 'all', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active' || $request->status === '1');
            })
            ->when($request->search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy($request->get('sort_by', 'created_at'), $request->get('sort_order', 'desc'))
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse($groups);
    }

    /**
     * GET /api/v1/customer-groups/{id}
     */
    public function show(int $id): JsonResponse
    {
        $group = CustomerGroup::findOrFail($id);
        return $this->successResponse($group);
    }

    /**
     * POST /api/v1/customer-groups
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id'       => 'required|exists:companies,id',
            'name'             => 'required|string|max:100',
            'description'      => 'nullable|string',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'is_active'        => 'sometimes|boolean',
        ]);

        $group = CustomerGroup::create($data);

        return $this->successResponse($group, 'Customer group created successfully', 201);
    }

    /**
     * PUT /api/v1/customer-groups/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $group = CustomerGroup::findOrFail($id);

        $data = $request->validate([
            'name'             => 'sometimes|required|string|max:100',
            'description'      => 'nullable|string',
            'discount_percent' => 'sometimes|required|numeric|min:0|max:100',
            'is_active'        => 'sometimes|boolean',
        ]);

        $group->update($data);

        return $this->successResponse($group, 'Customer group updated successfully');
    }

    /**
     * DELETE /api/v1/customer-groups/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $group = CustomerGroup::findOrFail($id);
            $group->delete();
            return $this->successResponse(null, 'Customer group deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * POST /api/v1/customer-groups/{id}/restore
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $group = CustomerGroup::onlyTrashed()->findOrFail($id);
            $group->restore();
            return $this->successResponse(null, 'Customer group restored successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * DELETE /api/v1/customer-groups/{id}/force
     */
    public function forceDelete(int $id): JsonResponse
    {
        try {
            $group = CustomerGroup::withTrashed()->findOrFail($id);
            $group->forceDelete();
            return $this->successResponse(null, 'Customer group permanently deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * GET /api/v1/customer-groups/export
     */
    public function export(Request $request): StreamedResponse
    {
        $headers = ['ID', 'Name', 'Description', 'Discount Percent', 'Is Active'];
        $groups = CustomerGroup::withTrashed()->get();

        return $this->csvService->streamExport(
            filename: 'customer_groups_export_' . now()->format('Y-m-d') . '.csv',
            headers: $headers,
            rows: $groups,
            rowMapper: fn(CustomerGroup $g) => [
                $g->id,
                $g->name,
                $g->description ?? '',
                $g->discount_percent,
                $g->is_active ? '1' : '0',
            ]
        );
    }

    /**
     * POST /api/v1/customer-groups/import
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $result = $this->csvService->parseCsv($request->file('file'), ['name']);
        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['errors'], 400);
        }

        $successCount = 0;
        $errors = [];

        foreach ($result['rows'] as $rowItem) {
            $line = $rowItem['_line'];
            $data = $rowItem['data'];

            $name = trim($data['name'] ?? '');
            if (!$name) {
                $errors[] = "Line {$line}: Name is required.";
                continue;
            }

            CustomerGroup::create([
                'company_id'       => 1,
                'name'             => $name,
                'description'      => trim($data['description'] ?? '') ?: null,
                'discount_percent' => (float) ($data['discount_percent'] ?? $data['discount percent'] ?? 0),
                'is_active'        => ($data['is_active'] ?? $data['is active'] ?? '1') === '1',
            ]);

            $successCount++;
        }

        return $this->successResponse([
            'imported_count' => $successCount,
            'errors'         => $errors,
        ], "Imported {$successCount} customer groups successfully. " . count($errors) . " errors.");
    }

    /**
     * POST /api/v1/customer-groups/bulk-delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        CustomerGroup::whereIn('id', $ids)->delete();
        return $this->successResponse(null, 'Selected customer groups deleted successfully');
    }

    /**
     * POST /api/v1/customer-groups/bulk-restore
     */
    public function bulkRestore(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        CustomerGroup::onlyTrashed()->whereIn('id', $ids)->restore();
        return $this->successResponse(null, 'Selected customer groups restored successfully');
    }
}
