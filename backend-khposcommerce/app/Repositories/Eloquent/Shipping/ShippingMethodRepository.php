<?php

namespace App\Repositories\Eloquent\Shipping;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Shipping\ShippingMethod;

class ShippingMethodRepository extends BaseRepository
{
    public function __construct(ShippingMethod $model)
    {
        parent::__construct($model);
    }
}
