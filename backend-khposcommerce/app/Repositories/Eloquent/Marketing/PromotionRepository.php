<?php

namespace App\Repositories\Eloquent\Marketing;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Marketing\Promotion;

class PromotionRepository extends BaseRepository
{
    public function __construct(Promotion $model)
    {
        parent::__construct($model);
    }
}
