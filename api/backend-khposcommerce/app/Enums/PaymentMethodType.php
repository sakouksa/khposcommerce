<?php

namespace App\Enums;

enum PaymentMethodType: string
{
    case CASH          = 'cash';
    case KHQR          = 'khqr';
    case BANK_TRANSFER = 'bank_transfer';
    case CREDIT_CARD   = 'credit_card';
    case WALLET        = 'wallet';

    public function label(): string
    {
        return match ($this) {
            self::CASH          => 'Cash',
            self::KHQR          => 'KHQR / Bakong',
            self::BANK_TRANSFER => 'Bank Transfer',
            self::CREDIT_CARD   => 'Credit / Debit Card',
            self::WALLET        => 'Customer Wallet',
        };
    }

    public function labelKhmer(): string
    {
        return match ($this) {
            self::CASH          => 'សាច់ប្រាក់សុទ្ធ',
            self::KHQR          => 'KHQR / បាគង',
            self::BANK_TRANSFER => 'ផ្ទេរតាមធនាគារ',
            self::CREDIT_CARD   => 'កាតឥណទាន / ឥណពន្ធ',
            self::WALLET        => 'កាបូបលុយអតិថិជន',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
