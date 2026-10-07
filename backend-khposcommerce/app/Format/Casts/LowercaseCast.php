<?php

namespace App\Format\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class LowercaseCast implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        return $value !== null ? strtolower(trim((string) $value)) : null;
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        return $value !== null ? strtolower(trim((string) $value)) : null;
    }
}
