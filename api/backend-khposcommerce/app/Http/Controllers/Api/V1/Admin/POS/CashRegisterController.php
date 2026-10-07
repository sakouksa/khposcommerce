<?php

namespace App\Http\Controllers\Api\V1\Admin\POS;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\POS\CashRegisterService;
use App\Http\Resources\POS\CashRegisterResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashRegisterController extends BaseApiController
{
    public function __construct(private readonly CashRegisterService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = \App\Models\POS\CashRegister::query()
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate($request->integer('per_page', 15));
        
        $resourceCollection = CashRegisterResource::collection($records);
        
        return response()->json([
            'success'    => true,
            'message'    => 'Success',
            'data'       => $resourceCollection->resolve(),
            'pagination' => [
                'total'        => $records->total(),
                'per_page'     => $records->perPage(),
                'current_page' => $records->currentPage(),
                'last_page'    => $records->lastPage(),
                'from'         => $records->firstItem(),
                'to'           => $records->lastItem(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->filled('name') && !$request->filled('title')) {
            $request->merge(['title' => $request->name]);
        }
        if ($request->filled('title') && !$request->filled('name')) {
            $request->merge(['name' => $request->title]);
        }

        $validated = $request->validate([
            'company_id' => 'sometimes|integer',
            'branch_id' => 'sometimes|integer',
            'store_id' => 'sometimes|integer',
            'user_id' => 'sometimes|integer',
            'title' => 'required|string|max:255',
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|nullable|string|max:100',
            'status' => 'sometimes|string',
            'opening_balance' => 'required|numeric',
            'notes' => 'nullable|string',
        ]);
        
        if (!isset($validated['company_id'])) {
            $validated['company_id'] = 1;
        }
        if (!isset($validated['branch_id'])) {
            $validated['branch_id'] = 1;
        }
        if (!isset($validated['store_id'])) {
            $validated['store_id'] = 1;
        }
        if (!isset($validated['user_id'])) {
            $validated['user_id'] = $request->user()?->id ?? 1;
        }
        if (!isset($validated['status'])) {
            $validated['status'] = 'open';
        }
        if (isset($validated['title']) && empty($validated['name'])) {
            $validated['name'] = $validated['title'];
        }
        if (empty($validated['code'])) {
            $validated['code'] = 'REG-' . strtoupper(substr(md5(uniqid()), 0, 6));
        }
        $validated['opened_at'] = now();

        $record = $this->service->create($validated);
        return $this->successResponse(new CashRegisterResource($record), 'Cash register created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id);
        return $this->successResponse(new CashRegisterResource($record), 'Cash register details retrieved');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'title' => 'sometimes|string|max:255',
            'status' => 'sometimes|string',
            'opening_balance' => 'sometimes|numeric',
            'closing_balance' => 'sometimes|numeric',
            'branch_id' => 'sometimes|integer',
            'store_id' => 'sometimes|integer',
            'notes' => 'nullable|string',
            'closing_note' => 'nullable|string',
        ]);

        if (isset($validated['closing_note']) && !isset($validated['notes'])) {
            $validated['notes'] = $validated['closing_note'];
        }
        unset($validated['closing_note']);

        if (isset($validated['title']) && empty($validated['name'])) {
            $validated['name'] = $validated['title'];
        }
        if (isset($validated['name']) && empty($validated['title'])) {
            $validated['title'] = $validated['name'];
        }

        if (isset($validated['status']) && $validated['status'] === 'closed') {
            $validated['closed_at'] = now();
        }

        $record = $this->service->update($id, $validated);
        return $this->successResponse(new CashRegisterResource($record), 'Cash register updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(null, 'Cash register deleted successfully');
    }

    public function open(Request $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, [
            'status' => 'open',
            'opened_at' => now(),
            'closed_at' => null
        ]);
        return $this->successResponse(new CashRegisterResource($record), 'Cash register opened successfully');
    }

    public function close(Request $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, [
            'status' => 'closed',
            'closed_at' => now()
        ]);
        return $this->successResponse(new CashRegisterResource($record), 'Cash register closed successfully');
    }
}
