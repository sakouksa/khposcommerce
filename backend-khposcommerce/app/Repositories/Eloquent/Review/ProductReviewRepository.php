<?php

namespace App\Repositories\Eloquent\Review;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Review\ProductReview;

class ProductReviewRepository extends BaseRepository
{
    public function __construct(ProductReview $model)
    {
        parent::__construct($model);
    }
}
