<?php

namespace App\Repositories\Eloquent\Order;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Order\CartItem;

class CartItemRepository extends BaseRepository
{
    public function __construct(CartItem $model)
    {
        parent::__construct($model);
    }
}
