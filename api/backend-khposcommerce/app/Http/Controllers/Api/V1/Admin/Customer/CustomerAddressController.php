<?php

namespace App\Http\Controllers\Api\V1\Admin\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Customer\CreateCustomerAddressRequest;
use App\Http\Requests\Customer\UpdateCustomerAddressRequest;
use App\Http\Resources\Customer\CustomerAddressResource;
use App\Services\Customer\CustomerAddressService;
use App\Models\Customer\CustomerAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerAddressController extends BaseApiController
{
    public function __construct(private readonly CustomerAddressService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = CustomerAddress::with(['customer'])
            ->when($request->customer_id, function ($q, $customerId) {
                $q->where('customer_id', $customerId);
            })
            ->when($request->search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('label', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhere('province', 'like', "%{$search}%")
                        ->orWhere('country', 'like', "%{$search}%")
                        ->orWhere('postal_code', 'like', "%{$search}%");
                });
            })
            ->orderBy($request->get('sort_by', 'created_at'), $request->get('sort_order', 'desc'))
            ->paginate($request->integer('per_page', 15));

        return $this->paginatedResponse($records);
    }

    public function store(CreateCustomerAddressRequest $request): JsonResponse
    {
        $record = $this->service->create($request->validated());
        return $this->successResponse(
            new CustomerAddressResource($record),
            'CustomerAddress created successfully',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->service->getById($id, ['customer']);
        return $this->successResponse(
            new CustomerAddressResource($record),
            'CustomerAddress details retrieved successfully'
        );
    }

    public function update(UpdateCustomerAddressRequest $request, int $id): JsonResponse
    {
        $record = $this->service->update($id, $request->validated());
        return $this->successResponse(
            new CustomerAddressResource($record),
            'CustomerAddress updated successfully'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);
        return $this->successResponse(
            null,
            'CustomerAddress deleted successfully'
        );
    }

    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $headers = [
            'Content-type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename=customer_addresses_export_' . now()->format('Y-m-d') . '.csv',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0'
        ];

        $callback = function () use ($request) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, [
                'ID', 'Customer ID', 'Label', 'Receiver Name', 'Receiver Phone', 'Address', 'City', 'Province', 'Country', 'Postal Code', 'Latitude', 'Longitude', 'Default'
            ]);

            $addresses = CustomerAddress::all();

            foreach ($addresses as $a) {
                fputcsv($file, [
                    $a->id,
                    $a->customer_id,
                    $a->label,
                    $a->name,
                    $a->phone,
                    $a->address,
                    $a->city,
                    $a->province,
                    $a->country,
                    $a->postal_code,
                    $a->latitude ?? '',
                    $a->longitude ?? '',
                    $a->is_default ? '1' : '0'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        if ($handle === false) {
            return response()->json(['success' => false, 'message' => 'Cannot open file'], 400);
        }

        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        $headers = fgetcsv($handle);
        if (!$headers) {
            fclose($handle);
            return response()->json(['success' => false, 'message' => 'Empty CSV'], 400);
        }
        $headers = array_map(fn($h) => strtolower(trim($h)), $headers);

        $successCount = 0;
        $errors = [];
        $line = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $line++;
            if (count($row) < count($headers)) {
                $row = array_pad($row, count($headers), '');
            } else {
                $row = array_slice($row, 0, count($headers));
            }
            $data = array_combine($headers, $row);

            $customerId = intval($data['customer id'] ?? $data['customer_id'] ?? 0);
            $label = trim($data['label'] ?? '');
            $name = trim($data['receiver name'] ?? $data['receiver_name'] ?? $data['name'] ?? '');
            $phone = trim($data['receiver phone'] ?? $data['receiver_phone'] ?? $data['phone'] ?? '');
            $addressText = trim($data['address'] ?? '');

            if (!$customerId || !$label || !$name || !$phone || !$addressText) {
                $errors[] = "Line {$line}: Customer ID, Label, Name, Phone, and Address are required.";
                continue;
            }

            CustomerAddress::create([
                'customer_id' => $customerId,
                'label' => $label,
                'name' => $name,
                'phone' => $phone,
                'address' => $addressText,
                'city' => trim($data['city'] ?? '') ?: 'Phnom Penh',
                'province' => trim($data['province'] ?? '') ?: 'Phnom Penh',
                'country' => trim($data['country'] ?? '') ?: 'Cambodia',
                'postal_code' => trim($data['postal code'] ?? $data['postal_code'] ?? '') ?: '12000',
                'latitude' => trim($data['latitude'] ?? '') ?: null,
                'longitude' => trim($data['longitude'] ?? '') ?: null,
                'is_default' => ($data['default'] ?? $data['is_default'] ?? '0') === '1',
            ]);

            $successCount++;
        }

        fclose($handle);

        return response()->json([
            'success' => true,
            'message' => "Imported {$successCount} customer addresses successfully. " . count($errors) . " errors.",
            'errors' => $errors
        ]);
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        CustomerAddress::whereIn('id', $ids)->delete();
        return $this->successResponse(null, 'Selected customer addresses deleted successfully');
    }
}
