<?php

namespace App\Exceptions;

use RuntimeException;

class TenantAccessException extends RuntimeException
{
    public function __construct(string $message = 'Tenant isolation access denied', int $code = 403)
    {
        parent::__construct($message, $code);
    }
}
