<?php

namespace App\Repositories\Shipping;

use App\Repositories\BaseRepository;
use App\Models\Shipping\ShippingRate;

class ShippingRateRepository extends BaseRepository
{
    public function __construct(ShippingRate $model)
    {
        parent::__construct($model);
    }
}
