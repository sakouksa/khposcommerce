<?php

namespace App\Http\Controllers\Api\V1\Admin\Customer;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Customer\Customer;
use App\Models\Customer\CustomerContact;
use App\Models\Customer\CustomerKycDocument;
use App\Models\Customer\CustomerPointsLedger;
use App\Models\Customer\CustomerPricingContract;
use App\Models\Customer\CustomerSupportTicket;
use App\Models\Customer\CustomerWalletTransaction;
use App\Services\Customer\CustomerService;
use App\Services\Support\CsvService;
use App\Services\Support\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerController extends BaseApiController
{
    public function __construct(
        protected CustomerService $customerService,
        protected FileService $fileService,
        protected CsvService $csvService
    ) {}

    /**
     * GET /api/v1/customers
     */
    public function index(Request $request): JsonResponse
    {
        $customers = $this->customerService->getPaginated(
            filters: $request->all(),
            perPage: $request->integer('per_page', 10),
            sortBy: $request->get('sort_by', 'created_at'),
            sortOrder: $request->get('sort_order', 'desc')
        );

        return $this->paginatedResponse($customers);
    }

    /**
     * GET /api/v1/customers/stats
     */
    public function stats(Request $request): JsonResponse
    {
        $stats = $this->customerService->getStats($request->all());

        return $this->successResponse($stats);
    }

    /**
     * GET /api/v1/customers/{id}
     */
    public function show(int $id): JsonResponse
    {
        $customer = $this->customerService->getById($id);

        return $this->successResponse($customer);
    }

    /**
     * POST /api/v1/customers
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id'          => 'required|exists:companies,id',
            'customer_group_id'   => 'nullable|exists:customer_groups,id',
            'user_id'             => 'nullable|exists:users,id',
            'name'                => 'required|string|max:100',
            'email'               => 'nullable|email|max:100',
            'phone'               => 'nullable|string|max:50',
            'gender'              => 'nullable|string|in:male,female,other',
            'birth_date'          => 'nullable|date',
            'photo'               => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'payment_terms'       => 'nullable|string|max:50',
            'credit_limit'        => 'nullable|numeric|min:0',
            'outstanding_balance' => 'nullable|numeric|min:0',
            'is_credit_hold'      => 'nullable|boolean',
            'wallet_balance'      => 'nullable|numeric|min:0',
            'tax_number'          => 'nullable|string|max:100',
            'tax_branch_code'     => 'nullable|string|max:50',
            'rfm_segment'         => 'nullable|string|max:50',
            'churn_risk_score'    => 'nullable|numeric|min:0|max:100',
            'tags'                => 'nullable',
            'notes'               => 'nullable|string',
            'is_active'           => 'sometimes|boolean',
        ]);

        if ($request->hasFile('photo')) {
            $path = $this->fileService->upload($request->file('photo'), 'customers');
            $data['photo'] = $this->fileService->getUrl($path);
        }

        $customer = $this->customerService->create($data);

        return $this->successResponse($customer, 'Customer created successfully', 201);
    }

    /**
     * PUT /api/v1/customers/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $data = $request->validate([
            'customer_group_id'   => 'nullable|exists:customer_groups,id',
            'user_id'             => 'nullable|exists:users,id',
            'name'                => 'sometimes|required|string|max:100',
            'email'               => 'nullable|email|max:100',
            'phone'               => 'nullable|string|max:50',
            'gender'              => 'nullable|string|in:male,female,other',
            'birth_date'          => 'nullable|date',
            'photo'               => 'nullable',
            'payment_terms'       => 'nullable|string|max:50',
            'credit_limit'        => 'nullable|numeric|min:0',
            'outstanding_balance' => 'nullable|numeric|min:0',
            'is_credit_hold'      => 'nullable|boolean',
            'wallet_balance'      => 'nullable|numeric|min:0',
            'tax_number'          => 'nullable|string|max:100',
            'tax_branch_code'     => 'nullable|string|max:50',
            'rfm_segment'         => 'nullable|string|max:50',
            'churn_risk_score'    => 'nullable|numeric|min:0|max:100',
            'tags'                => 'nullable',
            'notes'               => 'nullable|string',
            'is_active'           => 'sometimes|boolean',
        ]);

        if ($request->hasFile('photo')) {
            $request->validate([
                'photo' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            $path = $this->fileService->replace($request->file('photo'), $customer->photo, 'customers');
            $data['photo'] = $path;
        } elseif ($request->boolean('remove_photo') || ($request->exists('photo') && ($request->photo === null || $request->photo === '' || $request->photo === 'null'))) {
            if (!empty($customer->photo)) {
                $this->fileService->delete($customer->photo);
            }
            $data['photo'] = null;
        } else {
            unset($data['photo']);
        }

        $updated = $this->customerService->update($id, $data);

        return $this->successResponse($updated, 'Customer updated successfully');
    }

    /**
     * DELETE /api/v1/customers/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->customerService->delete($id);
            return $this->successResponse(null, 'Customer deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * POST /api/v1/customers/{id}/restore
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $customer = Customer::onlyTrashed()->findOrFail($id);
            $customer->restore();
            return $this->successResponse(null, 'Customer restored successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * DELETE /api/v1/customers/{id}/force
     */
    public function forceDelete(int $id): JsonResponse
    {
        try {
            $customer = Customer::withTrashed()->findOrFail($id);
            if ($customer->photo) {
                $this->fileService->delete($customer->photo);
            }
            $customer->forceDelete();
            return $this->successResponse(null, 'Customer permanently deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * POST /api/v1/customers/{id}/wallet-transactions
     */
    public function addWalletTransaction(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'amount'         => 'required|numeric|min:0.01',
            'type'           => 'required|in:top_up,pos_payment,refund_credit,manual_adjustment',
            'payment_method' => 'nullable|string|max:50',
            'reference_no'   => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
        ]);

        $tx = $this->customerService->addWalletTransaction($id, $data);
        return $this->successResponse($tx, 'Wallet transaction processed successfully', 201);
    }

    /**
     * POST /api/v1/customers/{id}/loyalty-points
     */
    public function adjustLoyaltyPoints(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'points'       => 'required|numeric|min:0.01',
            'type'         => 'required|in:earned,redeemed,expired,adjustment',
            'expiry_date'  => 'nullable|date',
            'reference_no' => 'nullable|string|max:100',
            'notes'        => 'nullable|string',
        ]);

        $ledger = $this->customerService->adjustLoyaltyPoints($id, $data);
        return $this->successResponse($ledger, 'Loyalty points updated successfully', 201);
    }

    /**
     * POST /api/v1/customers/{id}/interactions
     */
    public function recordInteraction(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'type'               => 'required|string|max:40',
            'subject'            => 'required|string|max:200',
            'description'        => 'nullable|string',
            'outcome'            => 'nullable|string|max:50',
            'interacted_at'      => 'nullable|date',
            'next_follow_up_at' => 'nullable|date',
        ]);

        $interaction = $this->customerService->recordInteraction($id, $data);
        return $this->successResponse($interaction, 'Interaction logged successfully', 201);
    }

    /**
     * POST /api/v1/customers/{id}/toggle-credit-hold
     */
    public function toggleCreditHold(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'is_credit_hold' => 'required|boolean',
        ]);

        $customer = $this->customerService->toggleCreditHold($id, $data['is_credit_hold']);
        return $this->successResponse($customer, 'Credit hold status updated');
    }

    /**
     * POST /api/v1/customers/{id}/contacts
     */
    public function addContact(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'email'      => 'nullable|email|max:100',
            'phone'      => 'nullable|string|max:50',
            'job_title'  => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'is_primary' => 'nullable|boolean',
            'notes'      => 'nullable|string',
        ]);

        $contact = $this->customerService->addContact($id, $data);
        return $this->successResponse($contact, 'B2B Contact added successfully', 201);
    }

    /**
     * DELETE /api/v1/customers/{id}/contacts/{contactId}
     */
    public function deleteContact(int $id, int $contactId): JsonResponse
    {
        CustomerContact::where('customer_id', $id)->where('id', $contactId)->delete();
        return $this->successResponse(null, 'Contact deleted successfully');
    }

    /**
     * POST /api/v1/customers/{id}/kyc-documents
     */
    public function addKycDocument(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'document_type'   => 'required|string|max:50',
            'title'           => 'required|string|max:200',
            'document_number' => 'nullable|string|max:100',
            'file_url'        => 'nullable|string',
            'file'            => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
            'issue_date'      => 'nullable|date',
            'expiry_date'     => 'nullable|date',
            'status'          => 'nullable|string|in:pending,verified,rejected,expired',
            'notes'           => 'nullable|string',
        ]);

        if ($request->hasFile('file')) {
            $path = $this->fileService->upload($request->file('file'), 'customer_kyc');
            $data['file_url'] = $this->fileService->getUrl($path);
            $data['file_size'] = round($request->file('file')->getSize() / 1024, 1) . ' KB';
        } else if (empty($data['file_url'])) {
            $data['file_url'] = '/assets/docs/sample_kyc_document.pdf';
            $data['file_size'] = '1.2 MB';
        }

        $data['verified_by'] = auth()->user()?->name ?? 'Admin Compliance';
        $data['verified_at'] = now();

        $doc = $this->customerService->addKycDocument($id, $data);
        return $this->successResponse($doc, 'KYC Document uploaded and linked successfully', 201);
    }

    /**
     * POST /api/v1/customers/{id}/support-tickets
     */
    public function addSupportTicket(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'subject'     => 'required|string|max:200',
            'type'        => 'required|string|in:inquiry,complaint,rma_return,warranty_claim,billing_issue',
            'priority'    => 'required|string|in:low,medium,high,urgent',
            'status'      => 'nullable|string|in:open,in_progress,resolved,closed',
            'description' => 'nullable|string',
            'resolution'  => 'nullable|string',
            'assigned_to' => 'nullable|string|max:100',
        ]);

        $ticket = $this->customerService->addSupportTicket($id, $data);
        return $this->successResponse($ticket, 'Support Ticket / RMA registered successfully', 201);
    }

    /**
     * POST /api/v1/customers/{id}/pricing-contracts
     */
    public function addPricingContract(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'title'                => 'required|string|max:200',
            'start_date'           => 'required|date',
            'end_date'             => 'nullable|date',
            'discount_type'        => 'required|string|in:percentage,fixed_price,tier_volume',
            'discount_value'       => 'required|numeric|min:0',
            'status'               => 'nullable|string|in:draft,active,expired,terminated',
            'items'                => 'nullable|array',
            'terms_and_conditions' => 'nullable|string',
        ]);

        $contract = $this->customerService->addPricingContract($id, $data);
        return $this->successResponse($contract, 'Pricing contract created successfully', 201);
    }

    /**
     * GET /api/v1/customers/{id}/orders
     */
    public function orders(int $id): JsonResponse
    {
        $orders = \App\Models\Order\Order::where('customer_id', $id)->latest()->paginate(10);
        return $this->paginatedResponse($orders);
    }

    /**
     * GET /api/v1/customers/export
     */
    public function export(Request $request): StreamedResponse
    {
        $headers = [
            'ID', 'Name', 'Email', 'Phone', 'Payment Terms', 'Credit Limit', 'Outstanding Balance',
            'Wallet Balance', 'RFM Segment', 'Churn Risk', 'Loyalty Points', 'Tax Number', 'Is Active',
        ];

        $customers = Customer::withTrashed()->get();

        return $this->csvService->streamExport(
            filename: 'customers_enterprise_export_' . now()->format('Y-m-d') . '.csv',
            headers: $headers,
            rows: $customers,
            rowMapper: fn(Customer $c) => [
                $c->id,
                $c->name,
                $c->email ?? '',
                $c->phone ?? '',
                $c->payment_terms ?? 'prepaid',
                $c->credit_limit,
                $c->outstanding_balance,
                $c->wallet_balance,
                $c->rfm_segment ?? 'new',
                $c->churn_risk_score ? ($c->churn_risk_score . '%') : '0%',
                $c->loyalty_points,
                $c->tax_number ?? '',
                $c->is_active ? '1' : '0',
            ]
        );
    }

    /**
     * POST /api/v1/admin/customers/import
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
                $errors[] = "Line {$line}: Customer Name is required.";
                continue;
            }

            try {
                Customer::create([
                    'company_id'          => 1,
                    'name'                => $name,
                    'email'               => !empty($data['email']) ? trim($data['email']) : null,
                    'phone'               => !empty($data['phone']) ? trim($data['phone']) : null,
                    'payment_terms'       => !empty($data['payment_terms']) ? trim($data['payment_terms']) : 'prepaid',
                    'credit_limit'        => !empty($data['credit_limit']) ? floatval($data['credit_limit']) : 1000,
                    'outstanding_balance' => !empty($data['outstanding_balance']) ? floatval($data['outstanding_balance']) : 0,
                    'wallet_balance'      => !empty($data['wallet_balance']) ? floatval($data['wallet_balance']) : 0,
                    'rfm_segment'         => !empty($data['rfm_segment']) ? trim($data['rfm_segment']) : 'new',
                    'tax_number'          => !empty($data['tax_number']) ? trim($data['tax_number']) : null,
                    'tax_branch_code'     => !empty($data['tax_branch_code']) ? trim($data['tax_branch_code']) : '00001',
                    'is_credit_hold'      => isset($data['is_credit_hold']) && in_array(strtolower(trim($data['is_credit_hold'])), ['1', 'true', 'yes']),
                    'notes'               => !empty($data['notes']) ? trim($data['notes']) : null,
                    'is_active'           => !isset($data['is_active']) || in_array(strtolower(trim($data['is_active'])), ['1', 'true', 'yes']),
                ]);
                $successCount++;
            } catch (\Exception $e) {
                $errors[] = "Line {$line}: " . $e->getMessage();
            }
        }

        return $this->successResponse([
            'success_count' => $successCount,
            'error_count'   => count($errors),
            'errors'        => $errors,
        ], "Successfully imported {$successCount} customers.");
    }

    /**
     * POST /api/v1/customers/bulk-delete
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        $count = $this->customerService->bulkDelete($request->ids);
        return $this->successResponse(['count' => $count], "{$count} customers deleted successfully");
    }

    /**
     * POST /api/v1/customers/bulk-restore
     */
    public function bulkRestore(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        $count = $this->customerService->bulkRestore($request->ids);
        return $this->successResponse(['count' => $count], "{$count} customers restored successfully");
    }

    /**
     * POST /api/v1/customers/bulk-activate
     */
    public function bulkActivate(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        Customer::whereIn('id', $request->ids)->update(['is_active' => true]);
        return $this->successResponse(null, 'Customers activated successfully');
    }

    /**
     * POST /api/v1/customers/bulk-deactivate
     */
    public function bulkDeactivate(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);
        Customer::whereIn('id', $request->ids)->update(['is_active' => false]);
        return $this->successResponse(null, 'Customers deactivated successfully');
    }

    /**
     * POST /api/v1/customers/bulk-assign-group
     */
    public function bulkAssignGroup(Request $request): JsonResponse
    {
        $request->validate([
            'ids'               => 'required|array',
            'customer_group_id' => 'required|exists:customer_groups,id',
        ]);
        Customer::whereIn('id', $request->ids)->update(['customer_group_id' => $request->customer_group_id]);
        return $this->successResponse(null, 'Customer groups updated successfully');
    }

    /**
     * POST /api/v1/customers/bulk-toggle-credit-hold
     */
    public function bulkToggleCreditHold(Request $request): JsonResponse
    {
        $request->validate([
            'ids'            => 'required|array',
            'is_credit_hold' => 'required|boolean',
        ]);
        Customer::whereIn('id', $request->ids)->update(['is_credit_hold' => $request->is_credit_hold]);
        return $this->successResponse(null, 'Customer credit hold statuses updated successfully');
    }

    /**
     * POST /api/v1/customers/{id}/settle-debt
     */
    public function settleDebt(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|max:50',
            'reference_no'   => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
        ]);

        $res = $this->customerService->settleDebt($id, $data);
        return $this->successResponse($res, 'Customer debt settled successfully');
    }

    /**
     * POST /api/v1/customers/merge
     */
    public function mergeCustomers(Request $request): JsonResponse
    {
        $data = $request->validate([
            'primary_id'   => 'required|exists:customers,id',
            'duplicate_id' => 'required|exists:customers,id|different:primary_id',
        ]);

        $customer = $this->customerService->mergeCustomers((int)$data['primary_id'], (int)$data['duplicate_id']);
        return $this->successResponse($customer, 'Customers merged successfully');
    }
}
