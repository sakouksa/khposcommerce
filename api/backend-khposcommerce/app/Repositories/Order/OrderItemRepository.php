<?php

namespace App\Repositories\Order;

use App\Repositories\BaseRepository;
use App\Models\Order\OrderItem;

class OrderItemRepository extends BaseRepository
{
    public function __construct(OrderItem $model)
    {
        parent::__construct($model);
    }
}
