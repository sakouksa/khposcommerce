<?php

namespace App\Http\Resources\Purchase;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PurchaseCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => PurchaseResource::collection($this->collection),
        ];
    }
}
