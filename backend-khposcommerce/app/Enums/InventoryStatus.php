<?php

namespace App\Enums;

enum InventoryStatus: string
{
    case AVAILABLE    = 'available';
    case RESERVED     = 'reserved';
    case OUT_OF_STOCK = 'out_of_stock';
    case DAMAGED      = 'damaged';
    case EXPIRED      = 'expired';

    public function label(): string
    {
        return match ($this) {
            self::AVAILABLE    => 'Available',
            self::RESERVED     => 'Reserved',
            self::OUT_OF_STOCK => 'Out of Stock',
            self::DAMAGED      => 'Damaged',
            self::EXPIRED      => 'Expired',
        };
    }

    public function labelKhmer(): string
    {
        return match ($this) {
            self::AVAILABLE    => 'មានក្នុងស្តុក',
            self::RESERVED     => 'បានកក់ទុក',
            self::OUT_OF_STOCK => 'អស់ពីស្តុក',
            self::DAMAGED      => 'ខូចខាត',
            self::EXPIRED      => 'ផុតកំណត់',
        };
    }

    public function badgeColor(): string
    {
        return match ($this) {
            self::AVAILABLE    => 'success',
            self::RESERVED     => 'info',
            self::OUT_OF_STOCK => 'warning',
            self::DAMAGED, self::EXPIRED => 'danger',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
