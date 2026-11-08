<?php

namespace App\Repositories\Eloquent\Customer;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Customer\CustomerAddress;

class CustomerAddressRepository extends BaseRepository
{
    public function __construct(CustomerAddress $model)
    {
        parent::__construct($model);
    }
}
