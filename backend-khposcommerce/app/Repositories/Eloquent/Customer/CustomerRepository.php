<?php

namespace App\Repositories\Eloquent\Customer;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Customer\Customer;

class CustomerRepository extends BaseRepository
{
    public function __construct(Customer $model)
    {
        parent::__construct($model);
    }
}
