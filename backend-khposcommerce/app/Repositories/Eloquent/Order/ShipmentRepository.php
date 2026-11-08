<?php

namespace App\Repositories\Eloquent\Order;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Order\Shipment;

class ShipmentRepository extends BaseRepository
{
    public function __construct(Shipment $model)
    {
        parent::__construct($model);
    }
}
