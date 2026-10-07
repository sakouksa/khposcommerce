<?php

namespace App\Repositories\Supplier;

use App\Repositories\BaseRepository;
use App\Models\Supplier\SupplierContact;

class SupplierContactRepository extends BaseRepository
{
    public function __construct(SupplierContact $model)
    {
        parent::__construct($model);
    }
}
