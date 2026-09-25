<?php

namespace App\Services\Product;

use App\Repositories\Product\UnitRepository;
use App\Services\BaseService;

class UnitService extends BaseService
{
    public function __construct(UnitRepository $repository)
    {
        parent::__construct($repository);
    }
}
