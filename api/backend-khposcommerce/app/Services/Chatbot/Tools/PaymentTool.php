<?php

namespace App\Services\Chatbot\Tools;

use App\Models\Payment\PaymentMethod;

class PaymentTool
{
    /**
     * Get accepted payment options for customer checkout.
     */
    public function getPaymentMethods(array $params = []): array
    {
        $methods = PaymentMethod::where('is_active', true)
            ->where('available_online', true)
            ->get();

        if ($methods->isEmpty()) {
            return [
                'methods' => [
                    ['id' => 1, 'name' => 'Bakong KHQR (Cambodia QR)', 'code' => 'khqr', 'type' => 'digital', 'fee' => '0%'],
                    ['id' => 2, 'name' => 'Credit / Debit Card (Visa, MasterCard)', 'code' => 'stripe', 'type' => 'card', 'fee' => '0%'],
                    ['id' => 3, 'name' => 'Cash On Delivery (COD)', 'code' => 'cod', 'type' => 'cash', 'fee' => 'Free'],
                    ['id' => 4, 'name' => 'ABA PAY', 'code' => 'aba_pay', 'type' => 'digital', 'fee' => '0%'],
                ],
            ];
        }

        return [
            'methods' => $methods->map(fn ($m) => [
                'id'          => $m->id,
                'name'        => $m->name,
                'code'        => $m->code,
                'type'        => $m->type,
                'fee_percent' => (float) $m->fee_percent,
                'fee_fixed'   => (float) $m->fee_fixed,
            ])->toArray(),
        ];
    }
}
