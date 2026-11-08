<?php

namespace App\Services\Payment\Contracts;

interface PaymentGateway
{
    public function createPayment(array $data): array;
    public function verifyPayment(array $data): array;
    public function refund(array $data): array;
}
