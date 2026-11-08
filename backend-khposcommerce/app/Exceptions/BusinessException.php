<?php

namespace App\Exceptions;

use RuntimeException;

class BusinessException extends RuntimeException
{
    public function __construct(string $message = 'Business domain rule violation', int $code = 422)
    {
        parent::__construct($message, $code);
    }
}
