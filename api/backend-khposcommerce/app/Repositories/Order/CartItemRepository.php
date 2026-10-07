<?php

namespace App\Repositories\Order;

use App\Repositories\BaseRepository;
use App\Models\Order\CartItem;

class CartItemRepository extends BaseRepository
{
    public function __construct(CartItem $model)
    {
        parent::__construct($model);
    }
}
