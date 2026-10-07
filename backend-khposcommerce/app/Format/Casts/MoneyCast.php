<?php

namespace App\Format\Casts;

use App\Format\ValueObjects\Money;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class MoneyCast implements CastsAttributes
{
    /**
     * Cast the given value to a Money ValueObject.
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?Money
    {
        if ($value === null) {
            return null;
        }

        $currency = $attributes['currency'] ?? $attributes['currency_code'] ?? 'USD';
        return Money::from((float) $value, $currency);
    }

    /**
     * Prepare the given value for database storage.
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): ?float
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof Money) {
            return $value->amount();
        }

        return round((float) $value, 2);
    }
}
