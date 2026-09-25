<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;

class UpdateStoreEcommerceSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::value('id') ?? 1;

        // 1. Seed Cambodian Payment Methods
        DB::table('payment_methods')->truncate();
        $paymentMethods = [
            [
                'id' => 1,
                'company_id' => $companyId,
                'name' => 'ABA KHQR (PayWay Instant QR)',
                'code' => 'aba_khqr',
                'type' => 'qris',
                'logo' => 'payments/aba_khqr.png',
                'config' => json_encode(['merchant_id' => 'EC_POS_001', 'currency' => 'USD', 'instruction' => 'Scan with any Banking App supporting KHQR']),
                'fee_percent' => 0.0000,
                'fee_fixed' => 0.00,
                'is_active' => true,
                'available_pos' => true,
                'available_online' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'company_id' => $companyId,
                'name' => 'ACLEDA Mobile (KHQR)',
                'code' => 'acleda_khqr',
                'type' => 'qris',
                'logo' => 'payments/acleda_khqr.png',
                'config' => json_encode(['merchant_id' => 'ACL_002', 'currency' => 'USD', 'instruction' => 'Scan with ACLEDA Mobile app']),
                'fee_percent' => 0.0000,
                'fee_fixed' => 0.00,
                'is_active' => true,
                'available_pos' => true,
                'available_online' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'company_id' => $companyId,
                'name' => 'Wing Bank (KHQR / Wallet)',
                'code' => 'wing_khqr',
                'type' => 'ewallet',
                'logo' => 'payments/wing_khqr.png',
                'config' => json_encode(['merchant_id' => 'WING_003', 'currency' => 'USD']),
                'fee_percent' => 0.0000,
                'fee_fixed' => 0.00,
                'is_active' => true,
                'available_pos' => true,
                'available_online' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'company_id' => $companyId,
                'name' => 'Credit / Debit Card (Visa, Mastercard)',
                'code' => 'credit_card',
                'type' => 'credit_card',
                'logo' => 'payments/card.png',
                'config' => json_encode(['gateway' => 'Stripe/CyberSource', 'currency' => 'USD']),
                'fee_percent' => 2.5000,
                'fee_fixed' => 0.00,
                'is_active' => true,
                'available_pos' => true,
                'available_online' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'company_id' => $companyId,
                'name' => 'Cash on Delivery (COD)',
                'code' => 'cod',
                'type' => 'cash',
                'logo' => 'payments/cod.png',
                'config' => json_encode(['max_cod_amount' => 500, 'instruction' => 'Pay cash upon package arrival']),
                'fee_percent' => 0.0000,
                'fee_fixed' => 0.00,
                'is_active' => true,
                'available_pos' => true,
                'available_online' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('payment_methods')->insert($paymentMethods);

        // 2. Seed Cambodian Shipping Methods
        DB::table('shipping_methods')->truncate();
        $shippingMethods = [
            [
                'id' => 1,
                'company_id' => $companyId,
                'name' => 'Standard Nationwide Express (1-2 Days)',
                'code' => 'standard_express',
                'provider' => 'OptaLogistics',
                'base_price' => 0.20,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'company_id' => $companyId,
                'name' => 'Phnom Penh Express (Same Day 1-3 Hours)',
                'code' => 'phnom_penh_sameday',
                'provider' => 'FastCourier',
                'base_price' => 0.30,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'company_id' => $companyId,
                'name' => 'Virak Buntham Logistics (VET Express)',
                'code' => 'vet_express',
                'provider' => 'Virak Buntham',
                'base_price' => 0.25,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'company_id' => $companyId,
                'name' => 'J&T Express Cambodia',
                'code' => 'jt_express',
                'provider' => 'J&T Express',
                'base_price' => 0.20,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'company_id' => $companyId,
                'name' => 'GrabExpress Instant Delivery',
                'code' => 'grab_express',
                'provider' => 'GrabExpress',
                'base_price' => 0.35,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('shipping_methods')->insert($shippingMethods);

        // 3. Seed 25 Cambodian Provinces
        DB::table('provinces')->truncate();
        $cambodiaProvinces = [
            'Phnom Penh',
            'Siem Reap',
            'Battambang',
            'Sihanoukville (Preah Sihanouk)',
            'Kampot',
            'Kandal',
            'Tbong Khmum',
            'Kampong Cham',
            'Kampong Chhnang',
            'Kampong Speu',
            'Kampong Thom',
            'Kep',
            'Koh Kong',
            'Kratie',
            'Mondulkiri',
            'Oddar Meanchey',
            'Pailin',
            'Preah Vihear',
            'Prey Veng',
            'Pursat',
            'Ratanakiri',
            'Stung Treng',
            'Svay Rieng',
            'Takeo',
            'Banteay Meanchey',
        ];

        $provincesData = [];
        foreach ($cambodiaProvinces as $idx => $provName) {
            $provincesData[] = [
                'id' => $idx + 1,
                'country_id' => 1,
                'name' => $provName,
                'code' => 'KH-' . str_pad((string)($idx + 1), 2, '0', STR_PAD_LEFT),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('provinces')->insert($provincesData);

        // 4. Seed Real E-Commerce FAQs
        DB::table('faqs')->truncate();
        $realFaqs = [
            [
                'company_id' => $companyId,
                'question' => 'How long does nationwide shipping take in Cambodia?',
                'answer' => 'Express delivery takes 1 to 3 hours within Phnom Penh for orders placed before 4:00 PM. For all other 25 provinces, standard express delivery takes 1 to 2 business days.',
                'category' => 'Shipping & Delivery',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'company_id' => $companyId,
                'question' => 'What payment methods do you support for online checkout?',
                'answer' => 'We support ABA KHQR, ACLEDA Mobile, Wing Bank, Visa & Mastercard credit/debit cards, and Cash on Delivery (COD) across all 25 provinces.',
                'category' => 'Payment & Checkout',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'company_id' => $companyId,
                'question' => 'What is your 30-Day return and refund guarantee policy?',
                'answer' => 'You can return any unopened and unused item in its original packaging within 30 days of purchase for an exchange or full refund to your original payment method.',
                'category' => 'Returns & Refunds',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'company_id' => $companyId,
                'question' => 'Are all products 100% authentic with warranty?',
                'answer' => 'Yes! 100% of products sold on our platform are genuine, sourced directly from authorized manufacturers and backed by official warranty support.',
                'category' => 'Product Authenticity',
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'company_id' => $companyId,
                'question' => 'How do I track my order delivery in real time?',
                'answer' => 'You can check your live order tracking status anytime by visiting our Track Order page and entering your Order Number (e.g. ORD-XXXXXXXXXX).',
                'category' => 'Order Tracking',
                'sort_order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'company_id' => $companyId,
                'question' => 'Do you provide hardware repair and POS technical support?',
                'answer' => 'Yes, our dedicated Service & Technical Support Center provides complete hardware warranty diagnosis, repair, and POS installation assistance.',
                'category' => 'Technical Support',
                'sort_order' => 6,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('faqs')->insert($realFaqs);
    }
}
