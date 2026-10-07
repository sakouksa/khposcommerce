<?php

namespace App\Format\Casts;

use App\Format\Formatters\PhoneFormatter;
use App\Format\ValueObjects\PhoneNumber;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class PhoneNumberCast implements CastsAttributes
{
    /**
     * Cast the given value from database.
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?PhoneNumber
    {
        if ($value === null || $value === '') {
            return null;
        }

        return PhoneNumber::from((string) $value);
    }

    /**
     * Prepare the given value for storage in canonical E.164 format (+855...).
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof PhoneNumber) {
            return $value->e164();
        }

        return PhoneFormatter::normalize((string) $value);
    }
}
