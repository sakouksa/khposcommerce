<?php

namespace App\Repositories\Eloquent\Order;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Order\Wishlist;

class WishlistRepository extends BaseRepository
{
    public function __construct(Wishlist $model)
    {
        parent::__construct($model);
    }
}
