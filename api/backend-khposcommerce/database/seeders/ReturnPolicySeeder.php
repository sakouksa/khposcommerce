<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;
use App\Models\Product\Category;
use App\Models\Order\ReturnPolicy;

class ReturnPolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::all();
        if ($companies->isEmpty()) {
            $companies = collect([(object)['id' => 1]]);
        }

        // Cache category IDs
        $catMap = [
            'smartphones' => Category::where('name', 'like', '%Smartphone%')->value('id'),
            'laptops'     => Category::where('name', 'like', '%Laptop%')->value('id'),
            'monitors'    => Category::where('name', 'like', '%Monitor%')->value('id'),
            'apparel'     => Category::where('name', 'like', '%Apparel%')->orWhere('name', 'like', '%Cloth%')->value('id'),
            'shoes'       => Category::where('name', 'like', '%Shoe%')->value('id'),
            'audio'       => Category::where('name', 'like', '%Audio%')->value('id'),
            'smartwatches'=> Category::where('name', 'like', '%Smartwatch%')->orWhere('name', 'like', '%Watch%')->value('id'),
            'cameras'     => Category::where('name', 'like', '%Camera%')->value('id'),
            'keyboards'   => Category::where('name', 'like', '%Keyboard%')->value('id'),
            'chargers'    => Category::where('name', 'like', '%Charger%')->value('id'),
        ];

        foreach ($companies as $company) {
            $policies = [
                // 1. Store-Wide Standard 7-Day (Default)
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => null,
                    'name'                        => 'គោលការណ៍បង្វិលសងទូទៅស្តង់ដារ (Store-Wide Standard 7-Day)',
                    'return_window_days'          => 7,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 0.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 2.00,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => true,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['has_receipt', 'original_packaging', 'resellable_condition'],
                    'is_default'                  => true,
                ],
                // 2. Smartphones & Tablets 14-Day (Apple & Samsung Benchmark)
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => $catMap['smartphones'],
                    'name'                        => 'គោលការណ៍ទូរស័ព្ទ និងថេបប្លេត (Smartphones & Tablets 14-Day)',
                    'return_window_days'          => 14,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 10.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 3.00,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => true,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['serial_imei_match', 'icloud_google_unlocked', 'all_in_box_accessories', 'no_screen_scratch'],
                    'is_default'                  => false,
                ],
                // 3. Laptops & Computers 14-Day (Dell, HP & Lenovo Benchmark)
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => $catMap['laptops'],
                    'name'                        => 'គោលការណ៍កុំព្យូទ័រយួរដៃ និង PC (Laptops & Computers 14-Day)',
                    'return_window_days'          => 14,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 15.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 5.00,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => true,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['serial_match', 'undamaged_screen', 'power_brick_included', 'os_intact'],
                    'is_default'                  => false,
                ],
                // 4. Monitors & Displays 14-Day
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => $catMap['monitors'],
                    'name'                        => 'គោលការណ៍ម៉ូនីទ័រ និងអេក្រង់ (Monitors & Displays 14-Day)',
                    'return_window_days'          => 14,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 10.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 4.00,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => true,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['dead_pixel_inspection', 'foam_packaging_intact', 'stand_and_cables_present'],
                    'is_default'                  => false,
                ],
                // 5. Fashion & Apparel 30-Day (Zara & Uniqlo Benchmark)
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => $catMap['apparel'],
                    'name'                        => 'គោលការណ៍សម្លៀកបំពាក់ និងម៉ូដ (Fashion & Apparel 30-Day)',
                    'return_window_days'          => 30,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 0.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 1.50,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => false,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['unwashed', 'unworn', 'price_tags_attached', 'no_perfume_odor'],
                    'is_default'                  => false,
                ],
                // 6. Footwear & Shoes 14-Day (Nike & Adidas Benchmark)
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => $catMap['shoes'],
                    'name'                        => 'គោលការណ៍ស្បែកជើង និងស្បែកជើងកីឡា (Footwear & Shoes 14-Day)',
                    'return_window_days'          => 14,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 0.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 2.00,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => true,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['original_shoe_box', 'no_sole_scuffs', 'indoor_try_on_only'],
                    'is_default'                  => false,
                ],
                // 7. Audio & Earbuds - Sealed Only (Hygiene Policy)
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => $catMap['audio'],
                    'name'                        => 'គោលការណ៍កាស និងឧបករណ៍សំឡេង (Audio & Earbuds - Sealed Only)',
                    'return_window_days'          => 7,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 0.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 2.00,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => true,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['sealed_security_sticker', 'hygiene_unopened', 'tamper_proof_intact'],
                    'is_default'                  => false,
                ],
                // 8. Smartwatches & Wearables 14-Day
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => $catMap['smartwatches'],
                    'name'                        => 'គោលការណ៍នាឡិកាឆ្លាតវៃ និងកងដៃសុខភាព (Smartwatches 14-Day)',
                    'return_window_days'          => 14,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 10.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 2.50,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => true,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['account_unpaired', 'original_strap_undamaged', 'magnetic_charger_included'],
                    'is_default'                  => false,
                ],
                // 9. Cameras & Photography Gear 14-Day
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => $catMap['cameras'],
                    'name'                        => 'គោលការណ៍កាមេរ៉ា និងឧបករណ៍ថតរូប (Cameras & Gear 14-Day)',
                    'return_window_days'          => 14,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 15.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 5.00,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => true,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['shutter_count_verified', 'sensor_scratch_free', 'lens_caps_present'],
                    'is_default'                  => false,
                ],
                // 10. Keyboards & Gaming Gear 7-Day
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => $catMap['keyboards'],
                    'name'                        => 'គោលការណ៍ក្តារចុច និងឧបករណ៍ហ្គេម (Gaming & Keyboards 7-Day)',
                    'return_window_days'          => 7,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 0.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 2.00,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => true,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['all_keycaps_present', 'cable_functional', 'clean_switches'],
                    'is_default'                  => false,
                ],
                // 11. Chargers & Peripherals 7-Day
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => $catMap['chargers'],
                    'name'                        => 'គោលការណ៍គ្រឿងបន្លាស់ និងឆ្នាំងសាក (Accessories & Chargers 7-Day)',
                    'return_window_days'          => 7,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 0.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 1.50,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => true,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['cable_undamaged', 'original_packaging_present', 'no_scratches'],
                    'is_default'                  => false,
                ],
                // 12. Manufacturer Defect / DOA 30-Day (100% Free Store Fault)
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => null,
                    'name'                        => 'គោលការណ៍ទំនិញខូចពីអ្នកផលិត (Defective / DOA 30-Day Guarantee)',
                    'return_window_days'          => 30,
                    'is_returnable'               => true,
                    'allow_exchange'              => true,
                    'restocking_fee_percentage'   => 0.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 0.00,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => true,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['technical_qc_verified', 'hardware_defect_confirmed', 'immediate_1_to_1_swap'],
                    'is_default'                  => false,
                ],
                // 13. Clearance / Final Sale - Non-Returnable
                [
                    'company_id'                  => $company->id,
                    'category_id'                 => null,
                    'name'                        => 'ទំនិញលក់បញ្ចុះតម្លៃជម្រះស្តុក (Clearance / Final Sale - No Returns)',
                    'return_window_days'          => 0,
                    'is_returnable'               => false,
                    'allow_exchange'              => false,
                    'restocking_fee_percentage'   => 0.00,
                    'restocking_fee_flat'         => 0.00,
                    'customer_fault_shipping_fee' => 0.00,
                    'store_fault_shipping_fee'    => 0.00,
                    'requires_original_packaging' => false,
                    'requires_receipt'            => true,
                    'conditions_accepted'         => ['all_sales_final', 'sold_as_is', 'no_refund_no_exchange'],
                    'is_default'                  => false,
                ],
            ];

            foreach ($policies as $policyData) {
                ReturnPolicy::updateOrCreate(
                    [
                        'company_id' => $policyData['company_id'],
                        'name'       => $policyData['name'],
                    ],
                    $policyData
                );
            }
        }
    }
}
