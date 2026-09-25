<?php

namespace App\Http\Controllers\Api\V1\Admin\Purchase;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Supplier\SupplierResource;
use App\Services\Supplier\SupplierService;
use App\Models\Supplier\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Services\Support\FileService;

class SupplierController extends BaseApiController
{
    public function __construct(
        protected SupplierService $supplierService,
        protected FileService $fileService
    ) {}

    /**
     * GET /api/v1/suppliers
     */
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::with('contacts')
            ->withCount('purchases')
            ->withSum('purchases as total_purchases_sum', 'grand_total')
            ->withSum('purchases as total_paid_sum', 'paid_amount')
            ->withSum('purchases as total_due_sum', 'due_amount');

        // Status / is_active filter
        $status = $request->get('status', $request->get('is_active'));
        if ($status !== null && $status !== '' && $status !== 'all') {
            if ($status === 'deleted' || $status === 'trashed') {
                $query->onlyTrashed();
            } elseif ($status === '1' || $status === 1 || $status === 'active' || $status === true || $status === 'true') {
                $query->where('is_active', true);
            } elseif ($status === '0' || $status === 0 || $status === 'inactive' || $status === false || $status === 'false') {
                $query->where('is_active', false);
            }
        }

        if ($request->filled('supplier_type') && $request->supplier_type !== 'all') {
            $query->where('supplier_type', $request->supplier_type);
        }

        if ($request->filled('tier') && $request->tier !== 'all') {
            $query->where('tier', $request->tier);
        }

        if ($request->filled('country')) {
            $country = $request->country;
            $query->where(function ($q) use ($country) {
                $q->where('country', 'like', "%{$country}%")
                  ->orWhere('address', 'like', "%{$country}%");
            });
        }

        if ($request->filled('city')) {
            $city = $request->city;
            $query->where(function ($q) use ($city) {
                $q->where('city', 'like', "%{$city}%")
                  ->orWhere('province', 'like', "%{$city}%")
                  ->orWhere('address', 'like', "%{$city}%");
            });
        }

        if ($request->filled('province')) {
            $query->where('province', 'like', "%{$request->province}%");
        }

        if ($request->filled('created_date_start')) {
            $query->whereDate('created_at', '>=', $request->created_date_start);
        }
        if ($request->filled('created_date_end')) {
            $query->whereDate('created_at', '<=', $request->created_date_end);
        }

        if ($request->filled('updated_date_start')) {
            $query->whereDate('updated_at', '>=', $request->updated_date_start);
        }
        if ($request->filled('updated_date_end')) {
            $query->whereDate('updated_at', '<=', $request->updated_date_end);
        }

        if ($request->filled('min_orders')) {
            $query->has('purchases', '>=', (int) $request->min_orders);
        }
        if ($request->filled('max_orders')) {
            $query->has('purchases', '<=', (int) $request->max_orders);
        }

        if ($request->filled('payment_status')) {
            $statusVal = $request->payment_status;
            $query->whereHas('purchases', function ($q) use ($statusVal) {
                if ($statusVal === 'paid') {
                    $q->where('payment_status', 'paid');
                } elseif ($statusVal === 'partial') {
                    $q->where('payment_status', 'partial');
                } else {
                    $q->whereIn('payment_status', ['unpaid', 'due', 'pending']);
                }
            });
        }

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedFields = ['id', 'name', 'code', 'email', 'city', 'tax_number', 'credit_limit', 'is_active', 'created_at'];
        if (in_array($sortBy, $allowedFields, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $suppliers = $query->paginate($request->integer('per_page', 10));

        // Wrap paginator collection in SupplierResource
        $suppliers->setCollection(SupplierResource::collection($suppliers->getCollection())->collection);

        return $this->paginatedResponse($suppliers);
    }

    /**
     * GET /api/v1/suppliers/{id}
     */
    public function show(int $id): JsonResponse
    {
        $supplier = Supplier::with([
            'contacts',
            'purchases' => function ($q) {
                $q->latest()->take(15)->with(['branch', 'warehouse', 'items.product.category']);
            },
            'purchaseReturns'
        ])
        ->withCount('purchases')
        ->withSum('purchases as total_purchases_sum', 'grand_total')
        ->withSum('purchases as total_paid_sum', 'paid_amount')
        ->withSum('purchases as total_due_sum', 'due_amount')
        ->findOrFail($id);

        return $this->successResponse(new SupplierResource($supplier));
    }

    /**
     * POST /api/v1/suppliers
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id'          => 'nullable|exists:companies,id',
            'name'                => 'required|string|max:100',
            'code'                => 'required|string|unique:suppliers,code',
            'logo'                => 'nullable|string',
            'email'               => 'nullable|email|max:100',
            'phone'               => 'nullable|string|max:50',
            'fax'                 => 'nullable|string|max:50',
            'website'             => 'nullable|string|max:200',
            'hotline'             => 'nullable|string|max:50',
            'support_email'       => 'nullable|email|max:100',
            'supplier_type'       => 'nullable|string|max:50',
            'tier'                => 'nullable|string|max:50',
            'address'             => 'nullable|string',
            'city'                => 'nullable|string|max:100',
            'province'            => 'nullable|string|max:100',
            'country'             => 'nullable|string|max:100',
            'postal_code'         => 'nullable|string|max:20',
            'tax_number'          => 'nullable|string|max:100',
            'credit_limit'        => 'nullable|numeric|min:0',
            'payment_terms'       => 'nullable|string|max:50',
            'payment_term_days'   => 'nullable|integer|min:0',
            'lead_time_days'      => 'nullable|integer|min:0',
            'currency_code'       => 'nullable|string|max:10',
            'bank_name'           => 'nullable|string|max:100',
            'bank_account_number' => 'nullable|string|max:100',
            'bank_account_name'   => 'nullable|string|max:150',
            'swift_code'          => 'nullable|string|max:50',
            'notes'               => 'nullable|string',
            'is_active'           => 'sometimes|boolean',
            'contacts'            => 'sometimes|array',
            'contacts.*.name'       => 'required|string|max:100',
            'contacts.*.title'      => 'nullable|string|max:100',
            'contacts.*.email'      => 'nullable|email|max:100',
            'contacts.*.phone'      => 'nullable|string|max:50',
            'contacts.*.is_primary' => 'sometimes|boolean',
        ]);

        if (empty($data['company_id'])) {
            $data['company_id'] = $request->user()?->company_id ?? 1;
        }

        if (array_key_exists('logo', $data)) {
            $data['logo'] = $this->handleLogoPersistence($data['logo'], $data['code'] ?? 'SPL-NEW');
        }

        $supplier = $this->supplierService->create($data);

        return $this->successResponse(new SupplierResource($supplier), 'Supplier created successfully', 201);
    }

    /**
     * PUT /api/v1/suppliers/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'name'                => 'sometimes|required|string|max:100',
            'code'                => "sometimes|required|string|unique:suppliers,code,{$id}",
            'logo'                => 'nullable|string',
            'email'               => 'nullable|email|max:100',
            'phone'               => 'nullable|string|max:50',
            'fax'                 => 'nullable|string|max:50',
            'website'             => 'nullable|string|max:200',
            'hotline'             => 'nullable|string|max:50',
            'support_email'       => 'nullable|email|max:100',
            'supplier_type'       => 'nullable|string|max:50',
            'tier'                => 'nullable|string|max:50',
            'address'             => 'nullable|string',
            'city'                => 'nullable|string|max:100',
            'province'            => 'nullable|string|max:100',
            'country'             => 'nullable|string|max:100',
            'postal_code'         => 'nullable|string|max:20',
            'tax_number'          => 'nullable|string|max:100',
            'credit_limit'        => 'nullable|numeric|min:0',
            'payment_terms'       => 'nullable|string|max:50',
            'payment_term_days'   => 'nullable|integer|min:0',
            'lead_time_days'      => 'nullable|integer|min:0',
            'currency_code'       => 'nullable|string|max:10',
            'bank_name'           => 'nullable|string|max:100',
            'bank_account_number' => 'nullable|string|max:100',
            'bank_account_name'   => 'nullable|string|max:150',
            'swift_code'          => 'nullable|string|max:50',
            'notes'               => 'nullable|string',
            'is_active'           => 'sometimes|boolean',
            'contacts'            => 'sometimes|array',
            'contacts.*.name'       => 'required|string|max:100',
            'contacts.*.title'      => 'nullable|string|max:100',
            'contacts.*.email'      => 'nullable|email|max:100',
            'contacts.*.phone'      => 'nullable|string|max:50',
            'contacts.*.is_primary' => 'sometimes|boolean',
        ]);

        $currentSupplier = Supplier::findOrFail($id);
        if (array_key_exists('logo', $data)) {
            $data['logo'] = $this->handleLogoPersistence($data['logo'], $data['code'] ?? $currentSupplier->code, $currentSupplier->logo);
        }

        $supplier = $this->supplierService->update($id, $data);

        return $this->successResponse(new SupplierResource($supplier), 'Supplier updated successfully');
    }

    /**
     * DELETE /api/v1/suppliers/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->supplierService->delete($id);
            return $this->successResponse(null, 'Supplier deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * POST /api/v1/suppliers/{id}/restore
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $supplier = Supplier::onlyTrashed()->findOrFail($id);
            $supplier->restore();
            return $this->successResponse(null, 'Supplier restored successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * DELETE /api/v1/suppliers/{id}/force
     */
    public function forceDelete(int $id): JsonResponse
    {
        try {
            $supplier = Supplier::withTrashed()->findOrFail($id);
            if (!empty($supplier->logo)) {
                $this->fileService->delete($supplier->logo);
            }
            $supplier->forceDelete();
            return $this->successResponse(null, 'Supplier permanently deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * POST /api/v1/suppliers/bulk-delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        try {
            $suppliers = Supplier::whereIn('id', $request->ids)->get();
            foreach ($suppliers as $supplier) {
                if (!empty($supplier->logo)) {
                    $this->fileService->delete($supplier->logo);
                }
            }
            $count = $this->supplierService->bulkDelete($request->ids);
            return $this->successResponse(['count' => $count], "{$count} suppliers deleted successfully");
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * Helper to process, decode and persist logo data URIs to local storage.
     */
    protected function handleLogoPersistence(?string $rawLogo, string $supplierCode, ?string $currentLogo = null): ?string
    {
        if (empty($rawLogo) || $rawLogo === 'null' || $rawLogo === 'default' || $rawLogo === '/images/default-supplier.svg' || $rawLogo === 'suppliers/default-supplier.svg') {
            if (!empty($currentLogo)) {
                $this->fileService->delete($currentLogo);
            }
            return null;
        }

        $trimmed = trim($rawLogo);

        // Data URI
        if (str_starts_with($trimmed, 'data:')) {
            $code = strtolower(preg_replace('/[^a-z0-9\-]/i', '', $supplierCode ?: ('spl_' . time())));
            $ext = 'svg';
            if (str_contains($trimmed, 'image/png')) $ext = 'png';
            elseif (str_contains($trimmed, 'image/jpeg') || str_contains($trimmed, 'image/jpg')) $ext = 'jpg';
            elseif (str_contains($trimmed, 'image/webp')) $ext = 'webp';

            if (str_contains($trimmed, ';base64,')) {
                $parts = explode(';base64,', $trimmed);
                $content = base64_decode($parts[1] ?? '');
            } elseif (str_contains($trimmed, ';utf8,')) {
                $parts = explode(';utf8,', $trimmed);
                $content = urldecode($parts[1] ?? '');
            } else {
                $commaPos = strpos($trimmed, ',');
                $content = $commaPos !== false ? urldecode(substr($trimmed, $commaPos + 1)) : $trimmed;
            }

            if (!empty($content)) {
                $suppliersDir = Storage::disk('public')->path('suppliers');
                if (!is_dir($suppliersDir)) {
                    mkdir($suppliersDir, 0755, true);
                }
                $filename = "suppliers/{$code}_" . time() . ".{$ext}";
                Storage::disk('public')->put($filename, $content);

                // Clean old physical logo
                if (!empty($currentLogo) && $currentLogo !== $filename) {
                    $this->fileService->delete($currentLogo);
                }

                return $filename;
            }
        }

        if (str_starts_with($trimmed, 'suppliers/')) {
            return $trimmed;
        }

        if (str_contains($trimmed, 'storage/suppliers/')) {
            return 'suppliers/' . basename($trimmed);
        }

        return $trimmed;
    }
}
