<?php

namespace App\Repositories\Eloquent\Shipping;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Shipping\ShippingRate;

class ShippingRateRepository extends BaseRepository
{
    public function __construct(ShippingRate $model)
    {
        parent::__construct($model);
    }
}
