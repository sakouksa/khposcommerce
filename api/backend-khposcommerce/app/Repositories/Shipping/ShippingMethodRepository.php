<?php

namespace App\Repositories\Shipping;

use App\Repositories\BaseRepository;
use App\Models\Shipping\ShippingMethod;

class ShippingMethodRepository extends BaseRepository
{
    public function __construct(ShippingMethod $model)
    {
        parent::__construct($model);
    }
}
