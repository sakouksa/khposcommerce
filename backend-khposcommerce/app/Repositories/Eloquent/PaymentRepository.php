<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Eloquent\Payment\TransactionRepository as DomainPaymentRepository;
use App\Repositories\Contracts\PaymentRepositoryInterface;

class PaymentRepository extends DomainPaymentRepository implements PaymentRepositoryInterface
{
}
