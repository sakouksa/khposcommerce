<?php

namespace App\Services\Customer;

use App\Models\Customer\Customer;
use App\Models\Customer\CustomerGroup;
use App\Models\Customer\CustomerContact;
use App\Models\Customer\CustomerKycDocument;
use App\Models\Customer\CustomerWalletTransaction;
use App\Models\Customer\CustomerPointsLedger;
use App\Models\Customer\CustomerInteraction;
use App\Models\Customer\CustomerPricingContract;
use App\Models\Customer\CustomerSupportTicket;
use App\Models\Order\Order;
use App\Models\Sales\Sale;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CustomerService
{
    /**
     * Build customer filtered query.
     */
    public function getFilteredQuery(array $filters = [])
    {
        $status = $filters['status'] ?? null;
        $groupId = $filters['customer_group_id'] ?? null;
        $gender = $filters['gender'] ?? null;
        $search = $filters['search'] ?? null;
        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;
        $hasAddress = $filters['has_address'] ?? null;
        $hasUser = $filters['has_user'] ?? null;
        $birthdayMonth = $filters['birthday_month'] ?? null;
        $paymentTerms = $filters['payment_terms'] ?? null;
        $rfmSegment = $filters['rfm_segment'] ?? null;
        $isCreditHold = $filters['is_credit_hold'] ?? null;
        $tag = $filters['tag'] ?? null;

        return Customer::with(['group', 'user'])
            ->when($status === 'deleted' || $status === 'trashed', function ($q) {
                $q->onlyTrashed();
            })
            ->when($status && !in_array($status, ['deleted', 'trashed', 'all'], true), function ($q) use ($status) {
                $q->where('is_active', $status === 'active' || $status === '1' || $status === true);
            })
            ->when($groupId, fn($q, $id) => $q->where('customer_group_id', $id))
            ->when($gender, fn($q, $g) => $q->where('gender', $g))
            ->when($paymentTerms, fn($q, $pt) => $q->where('payment_terms', $pt))
            ->when($rfmSegment && $rfmSegment !== 'all', fn($q) => $q->where('rfm_segment', $rfmSegment))
            ->when($isCreditHold !== null && $isCreditHold !== '', function ($q) use ($isCreditHold) {
                $q->where('is_credit_hold', filter_var($isCreditHold, FILTER_VALIDATE_BOOLEAN));
            })
            ->when($tag, function ($q, $t) {
                $q->whereJsonContains('tags', $t);
            })
            ->when($search, function ($q, $term) {
                $q->where(function ($sub) use ($term) {
                    $sub->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%")
                        ->orWhere('tax_number', 'like', "%{$term}%")
                        ->orWhere('tax_branch_code', 'like', "%{$term}%")
                        ->orWhere('rfm_segment', 'like', "%{$term}%")
                        ->orWhere('notes', 'like', "%{$term}%");
                });
            })
            ->when($startDate, fn($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($endDate, fn($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->when($hasAddress, function ($q, $val) {
                if ($val === 'yes' || $val === '1' || $val === true) {
                    $q->has('addresses');
                } elseif ($val === 'no' || $val === '0' || $val === false) {
                    $q->doesntHave('addresses');
                }
            })
            ->when($hasUser, function ($q, $val) {
                if ($val === 'yes' || $val === '1' || $val === true) {
                    $q->whereNotNull('user_id');
                } elseif ($val === 'no' || $val === '0' || $val === false) {
                    $q->whereNull('user_id');
                }
            })
            ->when($birthdayMonth, fn($q, $m) => $q->whereMonth('birth_date', $m));
    }

    /**
     * Get paginated customers.
     */
    public function getPaginated(array $filters = [], int $perPage = 10, string $sortBy = 'created_at', string $sortOrder = 'desc'): LengthAwarePaginator
    {
        $allowedSorts = [
            'id', 'name', 'phone', 'email', 'gender', 'birth_date', 
            'total_spent', 'loyalty_points', 'order_count', 'credit_limit', 
            'outstanding_balance', 'wallet_balance', 'churn_risk_score', 
            'payment_terms', 'rfm_segment', 'is_active', 'created_at'
        ];
        $sort = in_array($sortBy, $allowedSorts, true) ? $sortBy : 'created_at';
        $order = in_array(strtolower($sortOrder), ['asc', 'desc'], true) ? strtolower($sortOrder) : 'desc';

        return $this->getFilteredQuery($filters)
            ->orderBy($sort, $order)
            ->paginate($perPage);
    }

    /**
     * Compute customer statistics.
     */
    public function getStats(array $filters = []): array
    {
        $query = $this->getFilteredQuery($filters);

        $totalCustomers = (clone $query)->count();
        $activeCustomers = (clone $query)->where('is_active', true)->count();
        $inactiveCustomers = (clone $query)->where('is_active', false)->count();

        $vipCustomers = (clone $query)->where(function ($q) {
            $q->where('total_spent', '>=', 1000)
              ->orWhere('rfm_segment', 'champions')
              ->orWhereHas('group', fn($sub) => $sub->where('name', 'like', '%VIP%'));
        })->count();

        $newCustomersThisMonth = (clone $query)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $totalSpent = (float) (clone $query)->sum('total_spent');
        $totalPoints = (float) (clone $query)->sum('loyalty_points');
        $totalOrders = (int) (clone $query)->sum('order_count');
        $avgSpent = $totalCustomers > 0 ? ($totalSpent / $totalCustomers) : 0;

        $totalGroups = CustomerGroup::count();
        $totalAddresses = DB::table('customer_addresses')->count();

        // Enterprise Financials & Credit stats
        $totalCreditLimit = (float) (clone $query)->sum('credit_limit');
        $totalOutstandingBalance = (float) (clone $query)->sum('outstanding_balance');
        $creditHoldCount = (clone $query)->where('is_credit_hold', true)->count();
        $totalWalletBalance = (float) (clone $query)->sum('wallet_balance');
        $avgChurnRisk = (float) ((clone $query)->avg('churn_risk_score') ?? 10);

        // RFM Segment Breakdown
        $rfmChampions = (clone $query)->where('rfm_segment', 'champions')->count();
        $rfmLoyal = (clone $query)->where('rfm_segment', 'loyal')->count();
        $rfmPotential = (clone $query)->where('rfm_segment', 'potential')->count();
        $rfmAtRisk = (clone $query)->where('rfm_segment', 'at_risk')->count();
        $rfmHibernating = (clone $query)->where('rfm_segment', 'hibernating')->count();
        $rfmNew = (clone $query)->where('rfm_segment', 'new')->count();

        // Mini KPI Stats
        $todayCustomers = (clone $query)->whereDate('created_at', now()->toDateString())->count();
        $todayOrders = Sale::whereDate('date', now()->toDateString())->whereNotNull('customer_id')->count()
            + Order::whereDate('created_at', now()->toDateString())->whereNotNull('customer_id')->count();

        $todayRevenue = (float) Sale::whereDate('date', now()->toDateString())
            ->whereNotNull('customer_id')
            ->where('status', 'completed')
            ->sum('grand_total')
            + (float) Order::whereDate('created_at', now()->toDateString())
            ->whereNotNull('customer_id')
            ->where('status', 'completed')
            ->sum('grand_total');

        $pendingPayments = Sale::where('status', 'pending')->whereNotNull('customer_id')->count()
            + Order::where('payment_status', 'pending')->whereNotNull('customer_id')->count();

        $creditCustomerIds = array_unique(array_merge(
            Sale::whereNotNull('customer_id')->whereColumn('paid_amount', '<', 'grand_total')->pluck('customer_id')->toArray(),
            Order::whereNotNull('customer_id')->whereColumn('paid_amount', '<', 'grand_total')->pluck('customer_id')->toArray()
        ));

        return [
            'total_customers'          => $totalCustomers,
            'active_customers'         => $activeCustomers,
            'inactive_customers'       => $inactiveCustomers,
            'vip_customers'            => $vipCustomers,
            'new_customers_this_month' => $newCustomersThisMonth,
            'total_spent'              => $totalSpent,
            'total_points'             => $totalPoints,
            'total_orders'             => $totalOrders,
            'avg_spent'                => round($avgSpent, 2),
            'total_groups'             => $totalGroups,
            'total_addresses'          => $totalAddresses,

            // Enterprise Stats
            'total_credit_limit'       => $totalCreditLimit,
            'total_outstanding_balance'=> $totalOutstandingBalance,
            'credit_hold_count'        => $creditHoldCount,
            'total_wallet_balance'     => $totalWalletBalance,
            'avg_churn_risk'           => round($avgChurnRisk, 1),
            'rfm_breakdown'            => [
                'champions'   => $rfmChampions,
                'loyal'       => $rfmLoyal,
                'potential'   => $rfmPotential,
                'at_risk'     => $rfmAtRisk,
                'hibernating' => $rfmHibernating,
                'new'         => $rfmNew,
            ],

            'today_customers'          => $todayCustomers,
            'today_orders'             => $todayOrders,
            'today_revenue'            => $todayRevenue,
            'pending_payments'         => $pendingPayments,
            'credit_customers'         => count($creditCustomerIds),
        ];
    }

    /**
     * Get customer by ID with full enterprise relations.
     */
    public function getById(int|string $id): Customer
    {
        return Customer::with([
            'group', 
            'user', 
            'addresses',
            'contacts',
            'kycDocuments',
            'walletTransactions',
            'pointsLedger',
            'interactions',
            'pricingContracts',
            'supportTickets',
            'sales' => fn($q) => $q->latest()->limit(25)->with(['items']),
            'orders' => fn($q) => $q->latest()->limit(25)->with(['items', 'store', 'shippingMethod']),
        ])->findOrFail($id);
    }

    /**
     * Create a customer.
     */
    public function create(array $data): Customer
    {
        if (isset($data['tags']) && is_string($data['tags'])) {
            $data['tags'] = array_filter(array_map('trim', explode(',', $data['tags'])));
        }

        return Customer::create($data);
    }

    /**
     * Update a customer.
     */
    public function update(int|string $id, array $data): Customer
    {
        $customer = Customer::findOrFail($id);

        if (isset($data['tags']) && is_string($data['tags'])) {
            $data['tags'] = array_filter(array_map('trim', explode(',', $data['tags'])));
        }

        $customer->update($data);
        return $this->getById($id);
    }

    /**
     * Delete a customer.
     */
    public function delete(int|string $id): bool
    {
        return Customer::findOrFail($id)->delete();
    }

    /**
     * Top-up or adjust customer store wallet.
     */
    public function addWalletTransaction(int $customerId, array $data): CustomerWalletTransaction
    {
        return DB::transaction(function () use ($customerId, $data) {
            $customer = Customer::lockForUpdate()->findOrFail($customerId);
            $amount = (float) $data['amount'];
            $type = $data['type'] ?? 'top_up';

            if (in_array($type, ['pos_payment', 'refund_debit'], true)) {
                $newBalance = max(0, (float) $customer->wallet_balance - $amount);
            } else {
                $newBalance = (float) $customer->wallet_balance + $amount;
            }

            $customer->wallet_balance = $newBalance;
            $customer->save();

            return CustomerWalletTransaction::create([
                'customer_id'    => $customerId,
                'type'           => $type,
                'amount'         => $amount,
                'balance_after'  => $newBalance,
                'reference_no'   => $data['reference_no'] ?? ('WLT-' . strtoupper(uniqid())),
                'payment_method' => $data['payment_method'] ?? 'cash',
                'notes'          => $data['notes'] ?? null,
                'created_by'     => auth()->user()?->name ?? 'Admin',
            ]);
        });
    }

    /**
     * Adjust or reward loyalty points.
     */
    public function adjustLoyaltyPoints(int $customerId, array $data): CustomerPointsLedger
    {
        return DB::transaction(function () use ($customerId, $data) {
            $customer = Customer::lockForUpdate()->findOrFail($customerId);
            $points = (float) $data['points'];
            $type = $data['type'] ?? 'earned';

            if (in_array($type, ['redeemed', 'expired', 'deduction'], true)) {
                $newPoints = max(0, (float) $customer->loyalty_points - $points);
            } else {
                $newPoints = (float) $customer->loyalty_points + $points;
            }

            $customer->loyalty_points = $newPoints;
            $customer->save();

            return CustomerPointsLedger::create([
                'customer_id'   => $customerId,
                'type'          => $type,
                'points'        => $points,
                'balance_after' => $newPoints,
                'reference_no'  => $data['reference_no'] ?? ('PTS-' . strtoupper(uniqid())),
                'expiry_date'   => $data['expiry_date'] ?? now()->addYear()->toDateString(),
                'notes'         => $data['notes'] ?? null,
                'created_by'    => auth()->user()?->name ?? 'Admin',
            ]);
        });
    }

    /**
     * Record interaction timeline.
     */
    public function recordInteraction(int $customerId, array $data): CustomerInteraction
    {
        return CustomerInteraction::create([
            'customer_id'        => $customerId,
            'type'               => $data['type'] ?? 'phone_call',
            'subject'            => $data['subject'],
            'description'        => $data['description'] ?? null,
            'outcome'            => $data['outcome'] ?? 'completed',
            'interacted_at'      => $data['interacted_at'] ?? now(),
            'next_follow_up_at' => $data['next_follow_up_at'] ?? null,
            'created_by'         => auth()->user()?->name ?? 'Admin',
        ]);
    }

    /**
     * Toggle Credit Hold status.
     */
    public function toggleCreditHold(int $customerId, bool $isHold): Customer
    {
        $customer = Customer::findOrFail($customerId);
        $customer->is_credit_hold = $isHold;
        $customer->save();
        return $customer;
    }

    /**
     * Add B2B contact.
     */
    public function addContact(int $customerId, array $data): CustomerContact
    {
        if (!empty($data['is_primary'])) {
            CustomerContact::where('customer_id', $customerId)->update(['is_primary' => false]);
        }
        $data['customer_id'] = $customerId;
        return CustomerContact::create($data);
    }

    /**
     * Add Support Ticket / RMA.
     */
    public function addSupportTicket(int $customerId, array $data): CustomerSupportTicket
    {
        $data['customer_id'] = $customerId;
        $data['ticket_number'] = $data['ticket_number'] ?? \App\Services\Support\ReferenceNumberService::ticket();
        return CustomerSupportTicket::create($data);
    }

    /**
     * Add Pricing Contract.
     */
    public function addPricingContract(int $customerId, array $data): CustomerPricingContract
    {
        $data['customer_id'] = $customerId;
        $data['contract_number'] = $data['contract_number'] ?? ('CTR-' . date('Y') . '-' . rand(1000, 9999));
        return CustomerPricingContract::create($data);
    }

    /**
     * Add KYC Document.
     */
    public function addKycDocument(int $customerId, array $data): CustomerKycDocument
    {
        $data['customer_id'] = $customerId;
        return CustomerKycDocument::create($data);
    }

    /**
     * Bulk delete customers.
     */
    public function bulkDelete(array $ids): int
    {
        return Customer::whereIn('id', $ids)->delete();
    }

    /**
     * Bulk restore customers.
     */
    public function bulkRestore(array $ids): int
    {
        return Customer::onlyTrashed()->whereIn('id', $ids)->restore();
    }

    /**
     * Bulk force delete customers.
     */
    public function bulkForceDelete(array $ids): int
    {
        return Customer::onlyTrashed()->whereIn('id', $ids)->forceDelete();
    }

    /**
     * Settle B2B customer outstanding debt.
     */
    public function settleDebt(int $customerId, array $data): array
    {
        return DB::transaction(function () use ($customerId, $data) {
            $customer = Customer::lockForUpdate()->findOrFail($customerId);
            $amount = (float) ($data['amount'] ?? 0);
            $previousBalance = (float) $customer->outstanding_balance;
            $newBalance = max(0, $previousBalance - $amount);
            
            $customer->outstanding_balance = $newBalance;
            if ($newBalance <= 0 && $customer->is_credit_hold) {
                $customer->is_credit_hold = false;
            }
            $customer->save();

            $paymentMethod = $data['payment_method'] ?? 'cash';
            $refNo = $data['reference_no'] ?? 'N/A';
            $notes = $data['notes'] ?? '';

            CustomerInteraction::create([
                'company_id'    => $customer->company_id ?? 1,
                'customer_id'   => $customerId,
                'user_id'       => auth()->id(),
                'type'          => 'debt_settlement',
                'subject'       => 'Payment Received: $' . number_format($amount, 2),
                'description'   => "Settled outstanding balance by {$paymentMethod}. Ref: {$refNo}. Notes: {$notes}",
                'outcome'       => 'completed',
                'interacted_at' => now(),
            ]);

            return [
                'customer_id'       => $customerId,
                'paid_amount'       => $amount,
                'previous_balance'  => $previousBalance,
                'remaining_balance' => $newBalance,
                'is_credit_hold'    => $customer->is_credit_hold,
            ];
        });
    }

    /**
     * Merge duplicate customer into primary customer.
     */
    public function mergeCustomers(int $primaryId, int $duplicateId): Customer
    {
        return DB::transaction(function () use ($primaryId, $duplicateId) {
            $primary = Customer::findOrFail($primaryId);
            $duplicate = Customer::findOrFail($duplicateId);

            // Transfer addresses
            DB::table('customer_addresses')->where('customer_id', $duplicateId)->update(['customer_id' => $primaryId]);
            // Transfer wallet transactions
            DB::table('customer_wallet_transactions')->where('customer_id', $duplicateId)->update(['customer_id' => $primaryId]);
            // Transfer points ledger
            DB::table('customer_points_ledger')->where('customer_id', $duplicateId)->update(['customer_id' => $primaryId]);
            // Transfer interactions
            DB::table('customer_interactions')->where('customer_id', $duplicateId)->update(['customer_id' => $primaryId]);
            // Transfer orders & sales
            DB::table('orders')->where('customer_id', $duplicateId)->update(['customer_id' => $primaryId]);
            DB::table('sales')->where('customer_id', $duplicateId)->update(['customer_id' => $primaryId]);

            // Combine wallet balance & loyalty points & outstanding debt
            $primary->wallet_balance += (float) $duplicate->wallet_balance;
            $primary->loyalty_points += (float) $duplicate->loyalty_points;
            $primary->outstanding_balance += (float) $duplicate->outstanding_balance;
            $primary->save();

            // Log interaction
            CustomerInteraction::create([
                'company_id'    => $primary->company_id ?? 1,
                'customer_id'   => $primaryId,
                'user_id'       => auth()->id(),
                'type'          => 'system_merge',
                'subject'       => "Merged duplicate customer #{$duplicateId} ({$duplicate->name})",
                'description'   => "Combined sales, wallet balance (${$duplicate->wallet_balance}), points ({$duplicate->loyalty_points}), and debt (${$duplicate->outstanding_balance}) into primary account.",
                'outcome'       => 'completed',
                'interacted_at' => now(),
            ]);

            // Delete duplicate
            $duplicate->delete();

            return $this->getById($primaryId);
        });
    }
}
