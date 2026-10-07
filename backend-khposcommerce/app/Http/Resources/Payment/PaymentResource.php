<?php

namespace App\Http\Resources\Payment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        if (isset($this->amount)) {
            $data['amount_formatted'] = \App\Format\GlobalFormat::money($this->amount, $this->currency ?? 'USD');
        }
        if (!empty($this->status)) {
            $data['status_badge'] = \App\Format\GlobalFormat::statusBadge($this->status);
        }
        return $data;
    }
}
