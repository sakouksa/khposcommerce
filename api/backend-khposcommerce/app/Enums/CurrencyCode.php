<?php

namespace App\Enums;

enum CurrencyCode: string
{
    case USD = 'USD';
    case KHR = 'KHR';

    public function symbol(): string
    {
        return match ($this) {
            self::USD => '$',
            self::KHR => '៛',
        };
    }

    public function decimalPlaces(): int
    {
        return match ($this) {
            self::USD => 2,
            self::KHR => 0,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::USD => 'US Dollar',
            self::KHR => 'Cambodian Riel',
        };
    }

    public function labelKhmer(): string
    {
        return match ($this) {
            self::USD => 'ដុល្លារអាមេរិក',
            self::KHR => 'រៀលកម្ពុជា',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
