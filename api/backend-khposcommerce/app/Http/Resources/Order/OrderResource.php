<?php

namespace App\Http\Resources\Order;

use App\Format\GlobalFormat;
use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class OrderResource extends BaseJsonResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        if (!empty($this->shipping_phone)) {
            $data['shipping_phone_local'] = GlobalFormat::phoneLocal($this->shipping_phone);
        }

        if (isset($this->grand_total)) {
            $data['grand_total_formatted'] = GlobalFormat::money($this->grand_total, $this->currency_code ?: 'USD');
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
