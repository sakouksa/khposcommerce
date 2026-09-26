<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;
use App\Models\Company\Store;

class UpdateBannersSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::value('id') ?? 1;
        $storeId = Store::value('id') ?? 1;

        $bannersData = [
            [
                'id' => 1,
                'title' => 'HAPPY TECH WEEKEND',
                'subtitle' => 'មហោស្រពទំនិញបច្ចេកវិទ្យាប្រចាំខែ បញ្ចុះតម្លៃពិសេសលើ Laptops, Mac & Gaming Gear ជំនាន់ថ្មី 2026',
                'image' => 'banners/banner_hero_1.webp',
                'mobile_image' => 'banners/banner_hero_1.webp',
                'link' => '/products?sort=deals',
                'position' => 'hero',
                'sort_order' => 1,
            ],
            [
                'id' => 2,
                'title' => 'NEXT-GEN PRO GAMING ARENA',
                'subtitle' => 'ឧបករណ៍ហ្គេមអាជីព RTX 5090, 240Hz OLED Displays & Mechanical Keyboards ធានាផ្លូវការ',
                'image' => 'banners/banner_hero_2.webp',
                'mobile_image' => 'banners/banner_hero_2.webp',
                'link' => '/products?category=keyboards',
                'position' => 'hero',
                'sort_order' => 2,
            ],
            [
                'id' => 3,
                'title' => 'STUDIO AUDIO & WIRELESS HI-RES',
                'subtitle' => 'សំឡេងកម្រិតស្ទូឌីយោ Spatial Audio & Active Noise Cancellation គុណភាពខ្ពស់បំផុត',
                'image' => 'banners/banner_hero_3.webp',
                'mobile_image' => 'banners/banner_hero_3.webp',
                'link' => '/products?category=audio-sound',
                'position' => 'hero',
                'sort_order' => 3,
            ],
            [
                'id' => 4,
                'title' => 'ENTERPRISE SMART POS HARDWARE',
                'subtitle' => 'ប្រព័ន្ធគ្រប់គ្រងការលក់ POS All-in-One, ម៉ាស៊ីនស្កេនបាកូដ និងម៉ាស៊ីនព្រីនវិក្កយបត្រស្ដង់ដារ',
                'image' => 'banners/banner_hero_4.webp',
                'mobile_image' => 'banners/banner_hero_4.webp',
                'link' => '/products?category=printers-scanners',
                'position' => 'hero',
                'sort_order' => 4,
            ],
            [
                'id' => 5,
                'title' => 'FLAGSHIP SMARTPHONES & 5G',
                'subtitle' => 'ទូរស័ព្ទស្មាតហ្វូន & ថេប្លេត Flagship ជំនាន់ចុងក្រោយ បង់រំលស់ការប្រាក់ 0%',
                'image' => 'banners/banner_hero_5.webp',
                'mobile_image' => 'banners/banner_hero_5.webp',
                'link' => '/products?category=smartphones',
                'position' => 'hero',
                'sort_order' => 5,
            ],
            [
                'id' => 6,
                'title' => '5G High-Speed Mobile Routers',
                'subtitle' => 'Portable ultra-fast Wi-Fi 6 for 25 provinces.',
                'image' => 'banners/banner_spotlight_1.webp',
                'mobile_image' => 'banners/banner_spotlight_1.webp',
                'link' => '/products?category=smartphones',
                'position' => 'sidebar',
                'sort_order' => 6,
            ],
            [
                'id' => 7,
                'title' => 'MSI Cyborg 15 Pro Gaming',
                'subtitle' => 'Intel i7 RTX 4060 144Hz IPS display.',
                'image' => 'banners/banner_spotlight_5.webp',
                'mobile_image' => 'banners/banner_spotlight_5.webp',
                'link' => '/products?category=laptops',
                'position' => 'sidebar',
                'sort_order' => 7,
            ],
            [
                'id' => 8,
                'title' => 'Lenovo IdeaPad Slim 3 Ryzen',
                'subtitle' => 'Ultra-thin, all-day battery with fast charge.',
                'image' => 'banners/banner_spotlight_2.webp',
                'mobile_image' => 'banners/banner_spotlight_2.webp',
                'link' => '/products?category=laptops',
                'position' => 'sidebar',
                'sort_order' => 8,
            ],
            [
                'id' => 9,
                'title' => 'ASUS Official Service & Warranty',
                'subtitle' => '100% Genuine parts & certified warranty centers.',
                'image' => 'banners/banner_spotlight_4.webp',
                'mobile_image' => 'banners/banner_spotlight_4.webp',
                'link' => '/about',
                'position' => 'sidebar',
                'sort_order' => 9,
            ],
            [
                'id' => 10,
                'title' => 'Weekend Super Flash Sale — Up to 50% OFF',
                'subtitle' => 'Exclusive discounts on top tech brands. Free express nationwide delivery on orders over $50.',
                'image' => 'banners/banner_spotlight_3.webp',
                'mobile_image' => 'banners/banner_spotlight_3.webp',
                'link' => '/products?sort=deals',
                'position' => 'footer',
                'sort_order' => 10,
            ],
        ];

        foreach ($bannersData as $b) {
            DB::table('banners')->updateOrInsert(
                ['id' => $b['id']],
                array_merge($b, [
                    'company_id' => $companyId,
                    'store_id' => $storeId,
                    'starts_at' => now()->subDays(1),
                    'ends_at' => now()->addDays(60),
                    'is_active' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ])
            );
        }
    }
}
