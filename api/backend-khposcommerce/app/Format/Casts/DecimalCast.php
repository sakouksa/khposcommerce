<?php

namespace App\Format\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class DecimalCast implements CastsAttributes
{
    public function __construct(protected int $precision = 2)
    {
    }

    /**
     * Cast the given value from database.
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?float
    {
        return $value !== null ? round((float) $value, $this->precision) : null;
    }

    /**
     * Prepare the given value for storage.
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): ?float
    {
        return $value !== null ? round((float) $value, $this->precision) : null;
    }
}
