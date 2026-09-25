<?php

namespace App\Repositories\Order;

use App\Repositories\BaseRepository;
use App\Models\Order\Wishlist;

class WishlistRepository extends BaseRepository
{
    public function __construct(Wishlist $model)
    {
        parent::__construct($model);
    }
}
