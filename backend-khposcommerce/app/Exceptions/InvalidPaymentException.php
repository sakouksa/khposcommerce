<?php

namespace App\Exceptions;

use RuntimeException;

class InvalidPaymentException extends RuntimeException
{
    public function __construct(string $message = 'Payment gateway transaction invalid or failed', int $code = 400)
    {
        parent::__construct($message, $code);
    }
}
