<?php

namespace App\Enums;

enum StockMovementType: string
{
    case IN         = 'in';
    case OUT        = 'out';
    case TRANSFER   = 'transfer';
    case ADJUSTMENT = 'adjustment';
    case SALE       = 'sale';
    case RETURN     = 'return';

    public function label(): string
    {
        return match ($this) {
            self::IN         => 'Stock In',
            self::OUT        => 'Stock Out',
            self::TRANSFER   => 'Stock Transfer',
            self::ADJUSTMENT => 'Stock Adjustment',
            self::SALE       => 'POS / Online Sale',
            self::RETURN     => 'Return',
        };
    }

    public function labelKhmer(): string
    {
        return match ($this) {
            self::IN         => 'នាំចូលស្តុក',
            self::OUT        => 'នាំចេញស្តុក',
            self::TRANSFER   => 'ផ្ទេរស្តុក',
            self::ADJUSTMENT => 'កែតម្រូវស្តុក',
            self::SALE       => 'លក់ចេញ',
            self::RETURN     => 'ទំនិញត្រឡប់មកវិញ',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
