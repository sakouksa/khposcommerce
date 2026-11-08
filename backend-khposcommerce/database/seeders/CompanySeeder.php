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
            1 => [
                'name'     => 'NexTech Cambodia (HQ) - សាខា A (ភ្នំពេញ)',
                'city'     => 'Khan Daun Penh',
                'province' => 'Phnom Penh',
                'code'     => 'A',
                'postal'   => '120200',
                'phone'    => '+855 71 888 999',
                'address'  => '#128, មហាវិថីព្រះនរោត្តម, សង្កាត់ចតុមុខ, ខណ្ឌដូនពេញ',
            ],
            2 => [
                'name'     => 'NexTech Tbong Khmum - សាខា B (ត្បូងឃ្មុំ)',
                'city'     => 'ក្រុងសួង (Suong)',
                'province' => 'Tbong Khmum',
                'code'     => 'B',
                'postal'   => '030101',
                'phone'    => '+855 71 888 991',
                'address'  => 'ផ្លូវជាតិលេខ ៧, ភូមិជើងវត្ត, សង្កាត់សួង, ក្រុងសួង',
            ],
            3 => [
                'name'     => 'NexTech Siem Reap - សាខា C (សៀមរាប)',
                'city'     => 'ក្រុងសៀមរាប',
                'province' => 'Siem Reap',
                'code'     => 'C',
                'postal'   => '17252',
                'phone'    => '+855 63 963 888',
                'address'  => 'ផ្លូវស៊ីវុត្ថា, សង្កាត់ស្វាយដង្គំ, ក្រុងសៀមរាប',
            ],
        ];

        // Seed 3 Companies (Enterprise Multi-Tenant Scope)
        $companyNames = [
            1 => 'NexTech Cambodia Co., Ltd. (HQ) - សាខា A',
            2 => 'NexTech Electronics (Tbong Khmum) Co., Ltd. - សាខា B',
            3 => 'NexTech Retail Solutions (Siem Reap) Co., Ltd. - សាខា C',
        ];

        DB::table('companies')->truncate();
        $companies = [];
        for ($i = 1; $i <= 3; $i++) {
            $loc = $cambodiaLocations[$i];
            $companies[] = [
                'id'            => $i,
                'name'          => $companyNames[$i],
                'slug'          => Str::slug($companyNames[$i]),
                'email'         => $i === 1 ? 'tbongkhmum@enterprise-pos.com' : "contact.branch{$loc['code']}@nextech-cambodia.com",
                'phone'         => $loc['phone'],
                'website'       => 'https://www.enterprise-pos.com',
                'address'       => $loc['address'],
                'city'          => $loc['city'],
                'province'      => $loc['province'],
                'country'       => 'KH',
                'postal_code'   => $loc['postal'],
                'tax_number'    => 'K00' . str_pad($i, 7, '0', STR_PAD_LEFT),
                'currency_code' => 'USD',
                'timezone'      => 'Asia/Phnom_Penh',
                'language'      => 'km',
                'is_active'     => true,
                'created_at'    => now(),
                'updated_at'    => now(),
            ];
        }
        DB::table('companies')->insert($companies);

        // Seed 3 Branches (all unified under primary company 1 with multi-branch operational scoping)
        DB::table('branches')->truncate();
        $branches = [];
        for ($i = 1; $i <= 3; $i++) {
            $loc = $cambodiaLocations[$i];
            $branches[] = [
                'id'          => $i,
                'company_id'  => 1,
                'name'        => $loc['name'],
                'code'        => "BR-KH-{$loc['code']}",
                'email'       => "branch{$loc['code']}@nextech-cambodia.com",
                'phone'       => $loc['phone'],
                'address'     => $loc['address'],
                'city'        => $loc['city'],
                'province'    => $loc['province'],
                'postal_code' => $loc['postal'],
                'is_main'     => $i === 1,
                'is_active'   => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ];
        }
        DB::table('branches')->insert($branches);

        // Seed 3 Stores
        DB::table('stores')->truncate();
        $stores = [];
        for ($i = 1; $i <= 3; $i++) {
            $loc = $cambodiaLocations[$i];
            $stores[] = [
                'id'          => $i,
                'company_id'  => 1,
                'branch_id'   => $i,
                'name'        => "NexTech Store - សាខា {$loc['code']} ({$loc['province']})",
                'slug'        => "nextech-store-branch-{$loc['code']}",
                'domain'      => "store-{$loc['code']}.nextech-cambodia.com",
                'email'       => "store.{$loc['code']}@nextech-cambodia.com",
                'phone'       => $loc['phone'],
                'address'     => $loc['address'],
                'logo'        => "companies/logo_1789034319_6aa27f4fe25bf.png",
                'banner'      => "banners/banner_hero_1.webp",
                'description' => "Official smart retail store in {$loc['province']}, Cambodia",
                'type'        => 'hybrid',
                'is_active'   => true,
                'settings'    => null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ];
        }
        DB::table('stores')->insert($stores);

        // Seed 3 Warehouses
        $warehouseDetails = [
            1 => ['name' => 'Phnom Penh Central Distribution Depot (សាខា A)', 'pic' => 'Heng Piseth'],
            2 => ['name' => 'Tbong Khmum Regional Logistics Depot (សាខា B)',  'pic' => 'Sok Dara'],
            3 => ['name' => 'Siem Reap Northern Fulfillment Hub (សាខា C)',    'pic' => 'Chan Vanna'],
        ];

        DB::table('warehouses')->truncate();
        $warehouses = [];
        for ($i = 1; $i <= 3; $i++) {
            $loc = $cambodiaLocations[$i];
            $wh  = $warehouseDetails[$i];
            $warehouses[] = [
                'id'         => $i,
                'company_id' => 1,
                'branch_id'  => $i,
                'name'       => $wh['name'],
                'code'       => "WH-KH-{$loc['code']}",
                'address'    => "Logistics Depot, {$loc['address']}",
                'city'       => $loc['city'],
                'province'   => $loc['province'],
                'phone'      => $loc['phone'],
                'pic_name'   => $wh['pic'],
                'is_main'    => $i === 1,
                'is_active'  => true,
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
