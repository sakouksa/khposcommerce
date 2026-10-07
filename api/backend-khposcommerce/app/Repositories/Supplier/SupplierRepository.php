<?php

namespace App\Repositories\Supplier;

use App\Repositories\BaseRepository;
use App\Models\Supplier\Supplier;

class SupplierRepository extends BaseRepository
{
    public function __construct(Supplier $model)
    {
        parent::__construct($model);
    }
}
