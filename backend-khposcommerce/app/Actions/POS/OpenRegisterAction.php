<?php

namespace App\Actions\POS;

use App\Models\POS\CashRegisterSession;
use Illuminate\Support\Facades\DB;

class OpenRegisterAction
{
    public function execute(int|string $registerId, int|string $userId, float $openingBalance = 0.0): CashRegisterSession
    {
        return DB::transaction(function () use ($registerId, $userId, $openingBalance) {
            return CashRegisterSession::create([
                'cash_register_id' => $registerId,
                'user_id' => $userId,
                'opening_amount' => $openingBalance,
                'opened_at' => now(),
                'status' => 'open',
            ]);
        });
    }
}
