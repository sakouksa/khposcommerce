<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING    = 'pending';
    case CONFIRMED  = 'confirmed';
    case PROCESSING = 'processing';
    case SHIPPING   = 'shipping';
    case DELIVERED  = 'delivered';
    case COMPLETED  = 'completed';
    case CANCELLED  = 'cancelled';
    case RETURNED   = 'returned';

    public function label(): string
    {
        return match ($this) {
            self::PENDING    => 'Pending',
            self::CONFIRMED  => 'Confirmed',
            self::PROCESSING => 'Processing',
            self::SHIPPING   => 'Shipping',
            self::DELIVERED  => 'Delivered',
            self::COMPLETED  => 'Completed',
            self::CANCELLED  => 'Cancelled',
            self::RETURNED   => 'Returned',
        };
    }

    public function labelKhmer(): string
    {
        return match ($this) {
            self::PENDING    => 'រង់ចាំការបញ្ជាក់',
            self::CONFIRMED  => 'បានបញ្ជាក់',
            self::PROCESSING => 'កំពុងរៀបចំ',
            self::SHIPPING   => 'កំពុងដឹកជញ្ជូន',
            self::DELIVERED  => 'បានដឹកដល់',
            self::COMPLETED  => 'បានបញ្ចប់',
            self::CANCELLED  => 'បានបោះបង់',
            self::RETURNED   => 'បានប្រគល់ត្រឡប់',
        };
    }

    public function badgeColor(): string
    {
        return match ($this) {
            self::PENDING    => 'warning',
            self::CONFIRMED  => 'info',
            self::PROCESSING => 'primary',
            self::SHIPPING   => 'indigo',
            self::DELIVERED, self::COMPLETED => 'success',
            self::CANCELLED, self::RETURNED  => 'danger',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
