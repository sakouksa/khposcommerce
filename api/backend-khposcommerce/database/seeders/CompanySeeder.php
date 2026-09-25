<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $cambodiaLocations = [
            1  => ['name' => 'NexTech Cambodia (HQ)', 'city' => 'Khan Daun Penh', 'province' => 'Phnom Penh', 'code' => 'PNH', 'postal' => '120200', 'phone' => '+855 71 888 999', 'address' => '#128, មហាវិថីព្រះនរោត្តម, សង្កាត់ចតុមុខ, ខណ្ឌដូនពេញ'],
            2  => ['name' => 'សាខាខេត្តត្បូងឃ្មុំ (Tbong Khmum Branch)', 'city' => 'ក្រុងសួង (Suong)', 'province' => 'Tbong Khmum', 'code' => 'TBK', 'postal' => '030101', 'phone' => '+855 71 888 991', 'address' => 'ផ្លូវជាតិលេខ ៧, ភូមិជើងវត្ត, សង្កាត់សួង, ក្រុងសួង'],
            3  => ['name' => 'សាខាខេត្តសៀមរាប (Siem Reap Branch)', 'city' => 'ក្រុងសៀមរាប', 'province' => 'Siem Reap', 'code' => 'REP', 'postal' => '17252', 'phone' => '+855 63 963 888', 'address' => 'ផ្លូវស៊ីវុត្ថា, សង្កាត់ស្វាយដង្គំ, ក្រុងសៀមរាប'],
            4  => ['name' => 'សាខាខេត្តបាត់ដំបង (Battambang Branch)', 'city' => 'ក្រុងបាត់ដំបង', 'province' => 'Battambang', 'code' => 'BBM', 'postal' => '02360', 'phone' => '+855 53 952 888', 'address' => 'ផ្លូវលេខ ៣, សង្កាត់ស្វាយប៉ោ, ក្រុងបាត់ដំបង'],
            5  => ['name' => 'សាខាក្រុងព្រះសីហនុ (Sihanoukville Hub)', 'city' => 'ក្រុងព្រះសីហនុ', 'province' => 'Sihanoukville (Preah Sihanouk)', 'code' => 'KOS', 'postal' => '18000', 'phone' => '+855 34 934 888', 'address' => 'វិថីឯករាជ្យ, សង្កាត់លេខ ៤, ក្រុងព្រះសីហនុ'],
            6  => ['name' => 'សាខាខេត្តកំពង់ចាម (Kampong Cham Branch)', 'city' => 'ក្រុងកំពង់ចាម', 'province' => 'Kampong Cham', 'code' => 'KPC', 'postal' => '03000', 'phone' => '+855 42 941 888', 'address' => 'ផ្លូវមាត់ទន្លេ, សង្កាត់វាលវង់, ក្រុងកំពង់ចាម'],
            7  => ['name' => 'សាខាខេត្តកំពត (Kampot Branch)', 'city' => 'ក្រុងកំពត', 'province' => 'Kampot', 'code' => 'KPT', 'postal' => '07000', 'phone' => '+855 33 932 888', 'address' => 'រង្វង់មូលធុរេន, សង្កាត់កំពង់កណ្តាល, ក្រុងកំពត'],
            8  => ['name' => 'សាខាខេត្តកណ្តាល (Kandal Branch)', 'city' => 'ក្រុងតាខ្មៅ', 'province' => 'Kandal', 'code' => 'KDL', 'postal' => '08000', 'phone' => '+855 24 987 888', 'address' => 'ផ្លូវលេខ ២១, សង្កាត់តាខ្មៅ, ក្រុងតាខ្មៅ'],
            9  => ['name' => 'សាខាក្រុងប៉ោយប៉ែត (Poipet Hub)', 'city' => 'ក្រុងប៉ោយប៉ែត', 'province' => 'Banteay Meanchey', 'code' => 'PPT', 'postal' => '01000', 'phone' => '+855 54 958 888', 'address' => 'ផ្លូវជាតិលេខ ៥, សង្កាត់ប៉ោយប៉ែត, ក្រុងប៉ោយប៉ែត'],
            10 => ['name' => 'សាខាក្រុងបាវិត (Bavet SEZ Branch)', 'city' => 'ក្រុងបាវិត', 'province' => 'Svay Rieng', 'code' => 'BVT', 'postal' => '20000', 'phone' => '+855 44 945 888', 'address' => 'តំបន់សេដ្ឋកិច្ចពិសេសបាវិត, ក្រុងបាវិត'],
        ];

        // Seed 10 Companies (Cambodia Enterprise Scope)
        $companyNames = [
            1  => 'NexTech Cambodia Co., Ltd. (HQ)',
            2  => 'NexTech Electronics (Tbong Khmum) Co., Ltd.',
            3  => 'NexTech Retail Solutions (Siem Reap) Co., Ltd.',
            4  => 'NexTech Trading & Distribution (Battambang) Co., Ltd.',
            5  => 'NexTech Maritime Logistics & Hardware (Sihanoukville) Co., Ltd.',
            6  => 'NexTech Digital Commerce (Kampong Cham) Co., Ltd.',
            7  => 'NexTech Southern Trade Hub (Kampot) Co., Ltd.',
            8  => 'NexTech Greater Capital Depot (Kandal) Co., Ltd.',
            9  => 'NexTech Border Logistics Hub (Poipet) Co., Ltd.',
            10 => 'NexTech SEZ Export & Hardware (Bavet) Co., Ltd.',
        ];

        DB::table('companies')->truncate();
        $companies = [];
        for ($i = 1; $i <= 10; $i++) {
            $loc = $cambodiaLocations[$i];
            $companies[] = [
                'id' => $i,
                'name' => $companyNames[$i],
                'slug' => Str::slug($companyNames[$i]),
                'email' => $i === 1 ? 'tbongkhmum@enterprise-pos.com' : "contact.{$loc['code']}@nextech-cambodia.com",
                'phone' => $loc['phone'],
                'website' => 'https://www.enterprise-pos.com',
                'address' => $loc['address'],
                'city' => $loc['city'],
                'province' => $loc['province'],
                'country' => 'KH',
                'postal_code' => $loc['postal'],
                'tax_number' => 'K00' . str_pad($i, 7, '0', STR_PAD_LEFT),
                'currency_code' => 'USD',
                'timezone' => 'Asia/Phnom_Penh',
                'language' => 'km',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('companies')->insert($companies);

        // Seed 10 Branches
        DB::table('branches')->truncate();
        $branches = [];
        for ($i = 1; $i <= 10; $i++) {
            $loc = $cambodiaLocations[$i];
            $branches[] = [
                'id' => $i,
                'company_id' => $i === 1 || $i === 2 ? 1 : $i,
                'name' => $loc['name'],
                'code' => "BR-KH-{$loc['code']}",
                'email' => "branch.{$loc['code']}@nextech-cambodia.com",
                'phone' => $loc['phone'],
                'address' => $loc['address'],
                'city' => $loc['city'],
                'province' => $loc['province'],
                'postal_code' => $loc['postal'],
                'is_main' => $i === 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('branches')->insert($branches);

        // Seed 10 Stores
        DB::table('stores')->truncate();
        $stores = [];
        for ($i = 1; $i <= 10; $i++) {
            $loc = $cambodiaLocations[$i];
            $stores[] = [
                'id' => $i,
                'company_id' => $i === 1 || $i === 2 ? 1 : $i,
                'branch_id' => $i,
                'name' => "NexTech Store ({$loc['province']})",
                'slug' => "nextech-store-{$loc['code']}",
                'domain' => "store-{$loc['code']}.nextech-cambodia.com",
                'email' => "store.{$loc['code']}@nextech-cambodia.com",
                'phone' => $loc['phone'],
                'address' => $loc['address'],
                'logo' => "companies/logo_1789034319_6aa27f4fe25bf.png",
                'banner' => "banners/banner_hero_1.webp",
                'description' => "Official smart retail store in {$loc['province']}, Cambodia",
                'type' => 'hybrid',
                'is_active' => true,
                'settings' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('stores')->insert($stores);

        // Seed 10 Warehouses
        $warehouseDetails = [
            1  => ['name' => 'Phnom Penh Central Distribution Depot',         'pic' => 'Heng Piseth'],
            2  => ['name' => 'Tbong Khmum Regional Logistics Depot',          'pic' => 'Sok Dara'],
            3  => ['name' => 'Siem Reap Northern Fulfillment Hub',            'pic' => 'Chan Vanna'],
            4  => ['name' => 'Battambang Northwestern Storeroom',             'pic' => 'Bun Rotha'],
            5  => ['name' => 'Sihanoukville Port Sea-Freight Vault',          'pic' => 'Prak Visal'],
            6  => ['name' => 'Kampong Cham Mekong Distribution Center',       'pic' => 'Mao Sarath'],
            7  => ['name' => 'Kampot Coastal Logistics Depot',                'pic' => 'Ung Sambath'],
            8  => ['name' => 'Kandal Suburban Buffer Facility',               'pic' => 'Kong Pisey'],
            9  => ['name' => 'Poipet Cross-Border Logistics Station',         'pic' => 'Nuon Virak'],
            10 => ['name' => 'Bavet SEZ Fast-Transit Warehouse',              'pic' => 'Em Samnang'],
        ];

        DB::table('warehouses')->truncate();
        $warehouses = [];
        for ($i = 1; $i <= 10; $i++) {
            $loc = $cambodiaLocations[$i];
            $wh = $warehouseDetails[$i];
            $warehouses[] = [
                'id' => $i,
                'company_id' => $i <= 3 ? 1 : $i,
                'branch_id' => $i,
                'name' => $wh['name'],
                'code' => "WH-KH-{$loc['code']}",
                'address' => "Logistics Depot, {$loc['address']}",
                'city' => $loc['city'],
                'province' => $loc['province'],
                'phone' => $loc['phone'],
                'pic_name' => $wh['pic'],
                'is_main' => $i === 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('warehouses')->insert($warehouses);

        if (DB::getDriverName() === 'pgsql') {
            $tables = ['companies', 'branches', 'stores', 'warehouses'];
            foreach ($tables as $table) {
                try {
                    DB::statement("SELECT setval('{$table}_id_seq', COALESCE((SELECT MAX(id) FROM {$table}), 0) + 1, false);");
                } catch (\Throwable $e) {}
            }
        }
    }
}
