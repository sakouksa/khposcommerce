<?php

namespace App\Http\Resources\Customer;

use App\Format\GlobalFormat;
use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class CustomerResource extends BaseJsonResource
{
    public function toArray(Request $request): array
    {
        $photoUrl = $this->formatMediaUrl($this->photo);

        return [
            'id'                => $this->id,
            'company_id'        => $this->company_id,
            'customer_group_id' => $this->customer_group_id,
            'user_id'           => $this->user_id,
            'name'              => $this->name,
            'email'             => GlobalFormat::email($this->email),
            'phone'             => $this->phone ? GlobalFormat::phone($this->phone) : null,
            'phone_local'       => $this->phone ? GlobalFormat::phoneLocal($this->phone) : null,
            'gender'            => $this->gender,
            'birth_date'        => GlobalFormat::dateOnly($this->birth_date),
            'photo'             => $photoUrl,
            'avatar'            => $photoUrl,
            'total_spent'       => GlobalFormat::decimal($this->total_spent, 2),
            'total_spent_formatted' => GlobalFormat::money($this->total_spent, 'USD'),
            'order_count'       => GlobalFormat::integer($this->order_count),
            'loyalty_points'    => GlobalFormat::decimal($this->loyalty_points, 2),
            'tax_number'        => $this->tax_number ? GlobalFormat::taxId($this->tax_number) : null,
            'notes'             => $this->notes,
            'is_active'         => GlobalFormat::boolean($this->is_active),
            'group'             => $this->whenLoaded('group', fn() => [
                'id'   => $this->group?->id,
                'name' => $this->group?->name,
            ]),
            'addresses'         => $this->whenLoaded('addresses'),
            'created_at'        => $this->created_at?->toIso8601String(),
            'updated_at'        => $this->updated_at?->toIso8601String(),
        ];
    }
}
