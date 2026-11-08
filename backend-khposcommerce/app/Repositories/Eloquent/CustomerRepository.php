<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Eloquent\Customer\CustomerRepository as DomainCustomerRepository;
use App\Repositories\Contracts\CustomerRepositoryInterface;

class CustomerRepository extends DomainCustomerRepository implements CustomerRepositoryInterface
{
}
