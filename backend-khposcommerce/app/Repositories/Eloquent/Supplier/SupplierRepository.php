<?php

namespace App\Repositories\Eloquent\Supplier;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Supplier\Supplier;

class SupplierRepository extends BaseRepository
{
    public function __construct(Supplier $model)
    {
        parent::__construct($model);
    }
}
