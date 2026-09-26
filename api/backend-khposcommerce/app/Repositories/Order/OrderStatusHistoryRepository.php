<?php

namespace App\Repositories\Order;

use App\Repositories\BaseRepository;
use App\Models\Order\OrderStatusHistory;

class OrderStatusHistoryRepository extends BaseRepository
{
    public function __construct(OrderStatusHistory $model)
    {
        parent::__construct($model);
    }
}
