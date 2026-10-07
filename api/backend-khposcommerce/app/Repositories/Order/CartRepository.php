<?php

namespace App\Repositories\Order;

use App\Repositories\BaseRepository;
use App\Models\Order\Cart;

class CartRepository extends BaseRepository
{
    public function __construct(Cart $model)
    {
        parent::__construct($model);
    }
}
