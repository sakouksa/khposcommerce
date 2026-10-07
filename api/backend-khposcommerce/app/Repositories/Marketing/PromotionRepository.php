<?php

namespace App\Repositories\Marketing;

use App\Repositories\BaseRepository;
use App\Models\Marketing\Promotion;

class PromotionRepository extends BaseRepository
{
    public function __construct(Promotion $model)
    {
        parent::__construct($model);
    }
}
