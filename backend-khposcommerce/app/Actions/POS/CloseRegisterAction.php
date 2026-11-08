<?php

namespace App\Actions\POS;

use App\Models\POS\CashRegisterSession;
use Illuminate\Support\Facades\DB;

class CloseRegisterAction
{
    public function execute(CashRegisterSession|int|string $session, float $closingBalance, ?string $notes = null): CashRegisterSession
    {
        return DB::transaction(function () use ($session, $closingBalance, $notes) {
            $sessionModel = $session instanceof CashRegisterSession ? $session : CashRegisterSession::findOrFail($session);
            $sessionModel->update([
                'closing_amount' => $closingBalance,
                'closed_at' => now(),
                'status' => 'closed',
                'notes' => $notes,
            ]);
            return $sessionModel;
        });
    }
}
