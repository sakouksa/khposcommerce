<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CASH = 'cash';
    case BAKONG_KHQR = 'bakong_khqr';
    case ABA_PAYWAY = 'aba_payway';
    case STRIPE = 'stripe';
    case BANK_TRANSFER = 'bank_transfer';
    case CREDIT_CARD = 'credit_card';

    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Cash (សាច់ប្រាក់)',
            self::BAKONG_KHQR => 'Bakong KHQR (បាគង KHQR)',
            self::ABA_PAYWAY => 'ABA PayWay',
            self::STRIPE => 'Stripe Card',
            self::BANK_TRANSFER => 'Bank Transfer',
            self::CREDIT_CARD => 'Credit/Debit Card',
        };
    }
}
