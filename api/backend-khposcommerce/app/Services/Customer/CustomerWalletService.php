<?php

namespace App\Services\Customer;

use App\Models\Customer\Customer;
use App\Models\Customer\CustomerWallet;
use App\Models\Customer\StoreCreditTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CustomerWalletService
{
    /**
     * Get or initialize a customer wallet.
     */
    public function getOrCreateWallet(Customer $customer): CustomerWallet
    {
        return CustomerWallet::firstOrCreate(
            ['customer_id' => $customer->id],
            [
                'company_id'    => $customer->company_id,
                'balance'       => 0.00,
                'currency_code' => 'USD',
                'is_active'     => true,
            ]
        );
    }

    /**
     * Issue store credit refund to customer wallet.
     */
    public function creditStoreReturn(
        Customer $customer,
        float $amount,
        int $orderReturnId,
        ?string $notes = null,
        int $expiryDays = 180
    ): CustomerWallet {
        return DB::transaction(function () use ($customer, $amount, $orderReturnId, $notes, $expiryDays) {
            $wallet = $this->getOrCreateWallet($customer);
            $before = (float)$wallet->balance;
            $after = $before + $amount;

            $wallet->update(['balance' => $after]);

            // Sync with customer table wallet_balance column if exists
            $customer->update(['wallet_balance' => $after]);

            StoreCreditTransaction::create([
                'customer_wallet_id' => $wallet->id,
                'order_return_id'    => $orderReturnId,
                'type'               => 'credit_return',
                'amount'             => $amount,
                'balance_before'     => $before,
                'balance_after'      => $after,
                'expires_at'         => now()->addDays($expiryDays),
                'reference_number'   => 'CR-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -5)),
                'notes'              => $notes ?? "Store Credit Refund for Return #{$orderReturnId}",
                'created_by'         => Auth::id() ?? 1,
            ]);

            return $wallet->fresh();
        });
    }

    /**
     * Deduct store credit for a purchase.
     */
    public function debitPurchase(
        Customer $customer,
        float $amount,
        int $orderId,
        ?string $notes = null
    ): CustomerWallet {
        return DB::transaction(function () use ($customer, $amount, $orderId, $notes) {
            $wallet = $this->getOrCreateWallet($customer);
            $before = (float)$wallet->balance;

            if ($before < $amount) {
                throw new \Exception("Insufficient store credit balance. Current: \${$before}, Requested: \${$amount}");
            }

            $after = $before - $amount;
            $wallet->update(['balance' => $after]);
            $customer->update(['wallet_balance' => $after]);

            StoreCreditTransaction::create([
                'customer_wallet_id' => $wallet->id,
                'order_id'           => $orderId,
                'type'               => 'debit_purchase',
                'amount'             => $amount,
                'balance_before'     => $before,
                'balance_after'      => $after,
                'reference_number'   => 'DR-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -5)),
                'notes'              => $notes ?? "Payment with Store Credit for Order #{$orderId}",
                'created_by'         => Auth::id() ?? 1,
            ]);

            return $wallet->fresh();
        });
    }
}
