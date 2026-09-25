<?php

namespace App\Repositories\Shipping;

use App\Repositories\BaseRepository;
use App\Models\Shipping\ShippingZone;

class ShippingZoneRepository extends BaseRepository
{
    public function __construct(ShippingZone $model)
    {
        parent::__construct($model);
    }
}
