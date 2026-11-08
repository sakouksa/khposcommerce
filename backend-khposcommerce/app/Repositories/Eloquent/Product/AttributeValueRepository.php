<?php

namespace App\Repositories\Eloquent\Product;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Product\AttributeValue;

class AttributeValueRepository extends BaseRepository
{
    public function __construct(AttributeValue $model)
    {
        parent::__construct($model);
    }
}
