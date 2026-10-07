<?php

namespace App\Repositories\Eloquent\Order;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Order\OrderItem;

class OrderItemRepository extends BaseRepository
{
    public function __construct(OrderItem $model)
    {
        parent::__construct($model);
    }
}
