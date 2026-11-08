<?php

namespace App\Repositories\Eloquent\Order;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Order\Cart;

class CartRepository extends BaseRepository
{
    public function __construct(Cart $model)
    {
        parent::__construct($model);
    }
}
