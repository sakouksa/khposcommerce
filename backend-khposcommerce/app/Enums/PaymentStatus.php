<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING            = 'pending';
    case PAID               = 'paid';
    case PARTIALLY_PAID     = 'partially_paid';
    case FAILED             = 'failed';
    case REFUNDED           = 'refunded';
    case PARTIALLY_REFUNDED = 'partially_refunded';

    public function label(): string
    {
        return match ($this) {
            self::PENDING            => 'Pending Payment',
            self::PAID               => 'Paid',
            self::PARTIALLY_PAID     => 'Partially Paid',
            self::FAILED             => 'Failed',
            self::REFUNDED           => 'Refunded',
            self::PARTIALLY_REFUNDED => 'Partially Refunded',
        };
    }

    public function labelKhmer(): string
    {
        return match ($this) {
            self::PENDING            => 'មិនទាន់ទូទាត់',
            self::PAID               => 'បានទូទាត់រួច',
            self::PARTIALLY_PAID     => 'ទូទាត់បានមួយផ្នែក',
            self::FAILED             => 'បរាជ័យ',
            self::REFUNDED           => 'បានសងប្រាក់វិញ',
            self::PARTIALLY_REFUNDED => 'សងប្រាក់វិញមួយផ្នែក',
        };
    }

    public function badgeColor(): string
    {
        return match ($this) {
            self::PENDING            => 'warning',
            self::PAID               => 'success',
            self::PARTIALLY_PAID     => 'info',
            self::FAILED             => 'danger',
            self::REFUNDED, self::PARTIALLY_REFUNDED => 'secondary',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
