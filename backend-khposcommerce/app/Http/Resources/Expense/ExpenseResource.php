<?php

namespace App\Http\Resources\Expense;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        if (isset($this->amount)) {
            $data['amount_formatted'] = \App\Format\GlobalFormat::money($this->amount);
        }
        if (!empty($this->date)) {
            $data['date_formatted'] = \App\Format\GlobalFormat::dateOnly($this->date);
        }
        if (!empty($this->status)) {
            $data['status_badge'] = \App\Format\GlobalFormat::statusBadge($this->status);
        }
        return $data;
    }
}
