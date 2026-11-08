<?php

namespace App\Repositories\Eloquent\Supplier;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Supplier\SupplierContact;

class SupplierContactRepository extends BaseRepository
{
    public function __construct(SupplierContact $model)
    {
        parent::__construct($model);
    }
}
