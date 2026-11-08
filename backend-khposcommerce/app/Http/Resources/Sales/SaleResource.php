<?php

namespace App\Http\Resources\Sales;

use App\Format\GlobalFormat;
use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class SaleResource extends BaseJsonResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        if (isset($this->final_amount)) {
            $data['final_amount_formatted'] = GlobalFormat::money($this->final_amount, 'USD');
        } elseif (isset($this->total_amount)) {
            $data['total_amount_formatted'] = GlobalFormat::money($this->total_amount, 'USD');
        }

        if (isset($this->paid_amount)) {
            $data['paid_amount_formatted'] = GlobalFormat::money($this->paid_amount, 'USD');
        }

        if (!empty($this->status)) {
            $data['status_badge'] = GlobalFormat::statusBadge($this->status);
        }

        if (!empty($this->payment_status)) {
            $data['payment_status_badge'] = GlobalFormat::statusBadge($this->payment_status);
        }

        return $data;
    }
}
