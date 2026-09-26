<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::value('id') ?? 1;

        // 1. Settings (Cambodia Enterprise Configuration)
        $settings = [
            ['key' => 'site_name', 'value' => 'NexTech Cambodia', 'type' => 'string', 'group' => 'general'],
            ['key' => 'site_subtitle', 'value' => 'Enterprise E-Commerce & Smart POS System', 'type' => 'string', 'group' => 'general'],
            ['key' => 'site_email', 'value' => 'info@nextech-cambodia.com', 'type' => 'string', 'group' => 'general'],
            ['key' => 'allow_registration', 'value' => 'true', 'type' => 'boolean', 'group' => 'general'],
            ['key' => 'pos_receipt_header', 'value' => 'NexTech Cambodia - សូមអរគុណសម្រាប់ការជាវទំនិញ!', 'type' => 'string', 'group' => 'pos'],
            ['key' => 'pos_receipt_footer', 'value' => 'ទំនិញទិញរួចមិនអាចប្តូរជាប្រាក់វិញបានទេ • ទំនាក់ទំនង៖ 071 888 999', 'type' => 'string', 'group' => 'pos'],
            ['key' => 'pos_receipt_paper_size', 'value' => '80mm', 'type' => 'string', 'group' => 'pos'],
            ['key' => 'tax_rate_default', 'value' => '10', 'type' => 'integer', 'group' => 'tax'],
            ['key' => 'currency_base', 'value' => 'USD', 'type' => 'string', 'group' => 'currency'],
            ['key' => 'default_country', 'value' => 'Cambodia', 'type' => 'string', 'group' => 'general'],
            ['key' => 'default_timezone', 'value' => 'Asia/Phnom_Penh', 'type' => 'string', 'group' => 'general'],
            ['key' => 'loyalty_points_multiplier', 'value' => '1', 'type' => 'integer', 'group' => 'loyalty'],
            ['key' => 'loyalty_points_min_spend', 'value' => '1', 'type' => 'integer', 'group' => 'loyalty'],
            ['key' => 'enable_low_stock_warnings', 'value' => 'true', 'type' => 'boolean', 'group' => 'inventory'],
            ['key' => 'default_warehouse_id', 'value' => '1', 'type' => 'integer', 'group' => 'inventory'],
            ['key' => 'company_address', 'value' => '#128, មហាវិថីព្រះនរោត្តម, សង្កាត់ចតុមុខ, ខណ្ឌដូនពេញ, រាជធានីភ្នំពេញ', 'type' => 'string', 'group' => 'company'],
            ['key' => 'company_phone', 'value' => '+855 71 888 999', 'type' => 'string', 'group' => 'company'],
            ['key' => 'smtp_host', 'value' => 'smtp.mailtrap.io', 'type' => 'string', 'group' => 'mail'],
            ['key' => 'smtp_port', 'value' => '2525', 'type' => 'string', 'group' => 'mail'],
            [
                'key' => 'announcement_bar',
                'value' => json_encode([
                    'enabled'     => true,
                    'message'     => '🚚 Free Nationwide Delivery across Cambodia on all orders over $0.50!',
                    'message_km'  => '🚚 ដឹកជញ្ជូនឥតគិតថ្លៃទូទាំង ២៥ រាជធានី-ខេត្ត សម្រាប់ការកុម្ម៉ង់ចាប់ពី $0.50 ឡើងទៅ!',
                    'link'        => '/promotions',
                    'coupon_code' => 'OPTAPOS2026',
                    'bg_gradient' => 'from-indigo-600 to-purple-700',
                    'badge_text'  => 'SPECIAL PROMO',
                ]),
                'type' => 'json',
                'group' => 'cms',
            ],
        ];
        foreach ($settings as $s) {
            DB::table('settings')->updateOrInsert(
                ['company_id' => $companyId, 'key' => $s['key']],
                ['value' => $s['value'], 'type' => $s['type'], 'group' => $s['group'], 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // 2. Currencies (USD Base + KHR Dual-pricing + Regional trading currencies)
        DB::table('currencies')->truncate();
        $currencies = [
            ['id' => 1, 'name' => 'US Dollar', 'code' => 'USD', 'symbol' => '$', 'exchange_rate' => 1.000000, 'is_default' => true, 'is_active' => true],
            ['id' => 2, 'name' => 'Cambodian Riel', 'code' => 'KHR', 'symbol' => '៛', 'exchange_rate' => 4100.000000, 'is_default' => false, 'is_active' => true],
            ['id' => 3, 'name' => 'Thai Baht', 'code' => 'THB', 'symbol' => '฿', 'exchange_rate' => 35.500000, 'is_default' => false, 'is_active' => true],
            ['id' => 4, 'name' => 'Vietnamese Dong', 'code' => 'VND', 'symbol' => '₫', 'exchange_rate' => 25400.000000, 'is_default' => false, 'is_active' => true],
            ['id' => 5, 'name' => 'Chinese Yuan', 'code' => 'CNY', 'symbol' => '¥', 'exchange_rate' => 7.250000, 'is_default' => false, 'is_active' => true],
            ['id' => 6, 'name' => 'Euro', 'code' => 'EUR', 'symbol' => '€', 'exchange_rate' => 0.920000, 'is_default' => false, 'is_active' => true],
            ['id' => 7, 'name' => 'Singapore Dollar', 'code' => 'SGD', 'symbol' => 'S$', 'exchange_rate' => 1.350000, 'is_default' => false, 'is_active' => true],
            ['id' => 8, 'name' => 'Japanese Yen', 'code' => 'JPY', 'symbol' => '¥', 'exchange_rate' => 155.000000, 'is_default' => false, 'is_active' => true],
            ['id' => 9, 'name' => 'British Pound', 'code' => 'GBP', 'symbol' => '£', 'exchange_rate' => 0.790000, 'is_default' => false, 'is_active' => true],
            ['id' => 10, 'name' => 'Australian Dollar', 'code' => 'AUD', 'symbol' => 'A$', 'exchange_rate' => 1.520000, 'is_default' => false, 'is_active' => true],
        ];
        foreach ($currencies as $curr) {
            DB::table('currencies')->insert(array_merge($curr, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 3. Languages (Khmer Primary + English + Regional Business)
        DB::table('languages')->truncate();
        $languages = [
            ['id' => 1, 'name' => 'Khmer', 'code' => 'km', 'flag' => '🇰🇭', 'direction' => 'ltr', 'is_default' => true, 'is_active' => true],
            ['id' => 2, 'name' => 'English', 'code' => 'en', 'flag' => '🇺🇸', 'direction' => 'ltr', 'is_default' => false, 'is_active' => true],
            ['id' => 3, 'name' => 'Thai', 'code' => 'th', 'flag' => '🇹🇭', 'direction' => 'ltr', 'is_default' => false, 'is_active' => true],
            ['id' => 4, 'name' => 'Vietnamese', 'code' => 'vi', 'flag' => '🇻🇳', 'direction' => 'ltr', 'is_default' => false, 'is_active' => true],
            ['id' => 5, 'name' => 'Chinese', 'code' => 'zh', 'flag' => '🇨🇳', 'direction' => 'ltr', 'is_default' => false, 'is_active' => true],
        ];
        foreach ($languages as $lang) {
            DB::table('languages')->insert(array_merge($lang, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 4. Countries (Cambodia Base ID: 1 + Key Trading Partners)
        DB::table('countries')->truncate();
        $countries = [
            ['id' => 1, 'name' => 'Cambodia', 'code' => 'KH', 'phone_code' => '+855'],
            ['id' => 2, 'name' => 'Thailand', 'code' => 'TH', 'phone_code' => '+66'],
            ['id' => 3, 'name' => 'Vietnam', 'code' => 'VN', 'phone_code' => '+84'],
            ['id' => 4, 'name' => 'China', 'code' => 'CN', 'phone_code' => '+86'],
            ['id' => 5, 'name' => 'United States', 'code' => 'US', 'phone_code' => '+1'],
            ['id' => 6, 'name' => 'Singapore', 'code' => 'SG', 'phone_code' => '+65'],
            ['id' => 7, 'name' => 'Japan', 'code' => 'JP', 'phone_code' => '+81'],
        ];
        foreach ($countries as $c) {
            DB::table('countries')->insert(array_merge($c, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()]));
        }

        // 5. 25 Cambodian Provinces & Capital Phnom Penh (Under Country ID 1: Cambodia)
        DB::table('provinces')->truncate();
        $cambodiaProvinces = [
            ['id' => 1,  'name' => 'Phnom Penh', 'code' => 'KH-12'],
            ['id' => 2,  'name' => 'Siem Reap', 'code' => 'KH-17'],
            ['id' => 3,  'name' => 'Battambang', 'code' => 'KH-02'],
            ['id' => 4,  'name' => 'Sihanoukville (Preah Sihanouk)', 'code' => 'KH-18'],
            ['id' => 5,  'name' => 'Kampot', 'code' => 'KH-07'],
            ['id' => 6,  'name' => 'Kandal', 'code' => 'KH-08'],
            ['id' => 7,  'name' => 'Tbong Khmum', 'code' => 'KH-25'],
            ['id' => 8,  'name' => 'Kampong Cham', 'code' => 'KH-03'],
            ['id' => 9,  'name' => 'Kampong Chhnang', 'code' => 'KH-04'],
            ['id' => 10, 'name' => 'Kampong Speu', 'code' => 'KH-05'],
            ['id' => 11, 'name' => 'Kampong Thom', 'code' => 'KH-06'],
            ['id' => 12, 'name' => 'Kep', 'code' => 'KH-23'],
            ['id' => 13, 'name' => 'Koh Kong', 'code' => 'KH-09'],
            ['id' => 14, 'name' => 'Kratie', 'code' => 'KH-10'],
            ['id' => 15, 'name' => 'Mondulkiri', 'code' => 'KH-11'],
            ['id' => 16, 'name' => 'Oddar Meanchey', 'code' => 'KH-22'],
            ['id' => 17, 'name' => 'Pailin', 'code' => 'KH-24'],
            ['id' => 18, 'name' => 'Preah Vihear', 'code' => 'KH-13'],
            ['id' => 19, 'name' => 'Prey Veng', 'code' => 'KH-14'],
            ['id' => 20, 'name' => 'Pursat', 'code' => 'KH-15'],
            ['id' => 21, 'name' => 'Ratanakiri', 'code' => 'KH-16'],
            ['id' => 22, 'name' => 'Stung Treng', 'code' => 'KH-19'],
            ['id' => 23, 'name' => 'Svay Rieng', 'code' => 'KH-20'],
            ['id' => 24, 'name' => 'Takeo', 'code' => 'KH-21'],
            ['id' => 25, 'name' => 'Banteay Meanchey', 'code' => 'KH-01'],
        ];

        $provincesData = [];
        foreach ($cambodiaProvinces as $p) {
            $provincesData[] = [
                'id' => $p['id'],
                'country_id' => 1, // Cambodia
                'name' => $p['name'],
                'code' => $p['code'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('provinces')->insert($provincesData);

        // 6. Cambodian Districts / Khans / Krongs
        DB::table('cities')->truncate();
        $cambodiaDistricts = [
            // Phnom Penh (Province 1)
            ['province_id' => 1, 'name' => 'Khan Daun Penh', 'type' => 'Khan', 'postal_code' => '120200'],
            ['province_id' => 1, 'name' => 'Khan Chamkarmon', 'type' => 'Khan', 'postal_code' => '120100'],
            ['province_id' => 1, 'name' => 'Khan Tuol Kouk', 'type' => 'Khan', 'postal_code' => '120400'],
            ['province_id' => 1, 'name' => 'Khan Boeung Keng Kang', 'type' => 'Khan', 'postal_code' => '120102'],
            ['province_id' => 1, 'name' => 'Khan Sen Sok', 'type' => 'Khan', 'postal_code' => '120800'],
            ['province_id' => 1, 'name' => 'Khan Chroy Changvar', 'type' => 'Khan', 'postal_code' => '121100'],
            // Siem Reap (Province 2)
            ['province_id' => 2, 'name' => 'Krong Siem Reap', 'type' => 'Krong', 'postal_code' => '17252'],
            ['province_id' => 2, 'name' => 'Srok Prasat Bakong', 'type' => 'Srok', 'postal_code' => '17253'],
            // Battambang (Province 3)
            ['province_id' => 3, 'name' => 'Krong Battambang', 'type' => 'Krong', 'postal_code' => '02360'],
            ['province_id' => 3, 'name' => 'Srok Moung Ruessei', 'type' => 'Srok', 'postal_code' => '02361'],
            // Sihanoukville (Province 4)
            ['province_id' => 4, 'name' => 'Krong Preah Sihanouk', 'type' => 'Krong', 'postal_code' => '18000'],
            // Kampot (Province 5)
            ['province_id' => 5, 'name' => 'Krong Kampot', 'type' => 'Krong', 'postal_code' => '07000'],
            // Kandal (Province 6)
            ['province_id' => 6, 'name' => 'Krong Ta Khmau', 'type' => 'Krong', 'postal_code' => '08000'],
            // Tbong Khmum (Province 7)
            ['province_id' => 7, 'name' => 'Krong Suong', 'type' => 'Krong', 'postal_code' => '030101'],
            ['province_id' => 7, 'name' => 'Srok Memot', 'type' => 'Srok', 'postal_code' => '030102'],
        ];

        $citiesData = [];
        foreach ($cambodiaDistricts as $idx => $d) {
            $citiesData[] = [
                'id' => $idx + 1,
                'province_id' => $d['province_id'],
                'name' => $d['name'],
                'type' => $d['type'],
                'postal_code' => $d['postal_code'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('cities')->insert($citiesData);
    }
}
