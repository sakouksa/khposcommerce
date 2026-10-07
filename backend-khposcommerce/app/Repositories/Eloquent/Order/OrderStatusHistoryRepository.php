<?php

namespace App\Repositories\Eloquent\Order;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Order\OrderStatusHistory;

class OrderStatusHistoryRepository extends BaseRepository
{
    public function __construct(OrderStatusHistory $model)
    {
        parent::__construct($model);
    }
}
