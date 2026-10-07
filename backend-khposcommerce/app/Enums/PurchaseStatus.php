<?php

namespace App\Enums;

enum PurchaseStatus: string
{
    case PENDING = 'pending';
    case ORDERED = 'ordered';
    case PARTIALLY_RECEIVED = 'partially_received';
    case RECEIVED = 'received';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::ORDERED => 'Ordered',
            self::PARTIALLY_RECEIVED => 'Partially Received',
            self::RECEIVED => 'Received',
            self::CANCELLED => 'Cancelled',
        };
    }
}
