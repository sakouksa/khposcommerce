<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientStockException extends RuntimeException
{
    public function __construct(string $message = 'Insufficient stock available for the requested product.', int $code = 422)
    {
        parent::__construct($message, $code);
    }
}
