<?php

namespace App\Repositories\Customer;

use App\Repositories\BaseRepository;
use App\Models\Customer\CustomerAddress;

class CustomerAddressRepository extends BaseRepository
{
    public function __construct(CustomerAddress $model)
    {
        parent::__construct($model);
    }
}
