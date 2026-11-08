<?php

namespace App\Repositories\Eloquent\Shipping;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Shipping\ShippingZone;

class ShippingZoneRepository extends BaseRepository
{
    public function __construct(ShippingZone $model)
    {
        parent::__construct($model);
    }
}
