<?php

namespace App\Services\Product;

use App\Repositories\Product\AttributeValueRepository;
use App\Services\BaseService;

class AttributeValueService extends BaseService
{
    public function __construct(AttributeValueRepository $repository)
    {
        parent::__construct($repository);
    }
}
