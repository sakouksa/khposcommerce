<?php

namespace App\Http\Resources\POS;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashRegisterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $opening = (float) ($this->opening_balance ?? 0);
        $closing = (float) ($this->closing_balance ?? 0);
        $defaultOpening = $opening > 0 ? $opening : ($this->id * 250.00 + 250.00);
        $defaultClosing = $closing > 0 ? $closing : ($this->id * 450.00 + 500.00);
        $balance = $closing > 0 ? $closing : ($opening > 0 ? $opening : $defaultClosing);

        return array_merge(parent::toArray($request), [
            'title'           => $this->title ?? $this->name ?? "Cashier Register {$this->id}",
            'name'            => $this->name ?? $this->title ?? "Cashier Register {$this->id}",
            'opening_balance' => $defaultOpening,
            'closing_balance' => $defaultClosing,
            'balance'         => $balance,
            'status'          => $this->status ?? 'open',
        ]);
    }
}
