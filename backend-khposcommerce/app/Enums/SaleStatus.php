<?php

namespace App\Enums;

enum SaleStatus: string
{
    case COMPLETED = 'completed';
    case PENDING = 'pending';
    case DRAFT = 'draft';
    case CANCELLED = 'cancelled';
    case REFUNDED = 'refunded';
    case PARTIALLY_REFUNDED = 'partially_refunded';

    public function label(): string
    {
        return match ($this) {
            self::COMPLETED => 'Completed',
            self::PENDING => 'Pending',
            self::DRAFT => 'Draft',
            self::CANCELLED => 'Cancelled',
            self::REFUNDED => 'Refunded',
            self::PARTIALLY_REFUNDED => 'Partially Refunded',
        };
    }
}
