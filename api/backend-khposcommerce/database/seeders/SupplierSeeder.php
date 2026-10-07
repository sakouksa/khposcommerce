<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::value('id') ?? 1;

        // 50 Unique Authentic Domestic & Regional Suppliers
        $suppliersList = [
            ['name' => 'K-Tech Distribution Cambodia Co., Ltd.',      'country' => 'Cambodia',    'city' => 'Khan Sen Sok',          'province' => 'Phnom Penh',                   'phone' => '+855 23 888 101', 'bank' => 'ABA Bank',         'curr' => 'USD', 'type' => 'authorized_dealer', 'tier' => 'tier_1'],
            ['name' => 'Angkor IT Solutions Co., Ltd.',               'country' => 'Cambodia',    'city' => 'Khan Tuol Kouk',        'province' => 'Phnom Penh',                   'phone' => '+855 23 888 102', 'bank' => 'ACLEDA Bank Plc',  'curr' => 'USD', 'type' => 'distributor',       'tier' => 'tier_1'],
            ['name' => 'Sovannaphum Electronics Supply',              'country' => 'Cambodia',    'city' => 'Khan Daun Penh',        'province' => 'Phnom Penh',                   'phone' => '+855 12 889 001', 'bank' => 'Canadia Bank',      'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_2'],
            ['name' => 'Phnom Penh Mobile Direct Source',             'country' => 'Cambodia',    'city' => 'Khan Chamkarmon',       'province' => 'Phnom Penh',                   'phone' => '+855 93 770 110', 'bank' => 'Wing Bank',         'curr' => 'USD', 'type' => 'distributor',       'tier' => 'tier_1'],
            ['name' => 'Mekong POS Hardware Supplies',                'country' => 'Cambodia',    'city' => 'Khan Chroy Changvar',   'province' => 'Phnom Penh',                   'phone' => '+855 23 888 105', 'bank' => 'Sathapana Bank',    'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Siem Reap Smart Devices Depot',               'country' => 'Cambodia',    'city' => 'Krong Siem Reap',       'province' => 'Siem Reap',                    'phone' => '+855 63 963 111', 'bank' => 'ABA Bank',         'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_2'],
            ['name' => 'Battambang Tech Wholesale Hub',               'country' => 'Cambodia',    'city' => 'Krong Battambang',      'province' => 'Battambang',                   'phone' => '+855 53 952 111', 'bank' => 'ACLEDA Bank Plc',  'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_2'],
            ['name' => 'Sihanoukville Port Logistics & Gear',         'country' => 'Cambodia',    'city' => 'Krong Preah Sihanouk',  'province' => 'Sihanoukville (Preah Sihanouk)','phone' => '+855 34 934 111', 'bank' => 'Canadia Bank',      'curr' => 'USD', 'type' => 'logistics_supplier','tier' => 'tier_1'],
            ['name' => 'Tbong Khmum Ag-Tech & Electronics',           'country' => 'Cambodia',    'city' => 'Krong Suong',           'province' => 'Tbong Khmum',                  'phone' => '+855 71 888 995', 'bank' => 'ABA Bank',         'curr' => 'USD', 'type' => 'distributor',       'tier' => 'tier_2'],
            ['name' => 'Kampong Cham Digital Source Co.',             'country' => 'Cambodia',    'city' => 'Krong Kampong Cham',    'province' => 'Kampong Cham',                 'phone' => '+855 42 941 111', 'bank' => 'Wing Bank',         'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_3'],
            ['name' => 'Kandal Express Electronics Trading',          'country' => 'Cambodia',    'city' => 'Krong Ta Khmau',        'province' => 'Kandal',                       'phone' => '+855 24 987 111', 'bank' => 'ABA Bank',         'curr' => 'USD', 'type' => 'distributor',       'tier' => 'tier_2'],
            ['name' => 'Poipet Border Import & Export Logistics',     'country' => 'Cambodia',    'city' => 'Krong Poipet',          'province' => 'Banteay Meanchey',             'phone' => '+855 54 958 111', 'bank' => 'Canadia Bank',      'curr' => 'USD', 'type' => 'logistics_supplier','tier' => 'tier_1'],
            ['name' => 'Bavet SEZ Technology Hardware Supply',        'country' => 'Cambodia',    'city' => 'Krong Bavet',           'province' => 'Svay Rieng',                   'phone' => '+855 44 945 111', 'bank' => 'ACLEDA Bank Plc',  'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Kampot Marine & Retail Tech Supplies',        'country' => 'Cambodia',    'city' => 'Krong Kampot',          'province' => 'Kampot',                       'phone' => '+855 33 932 111', 'bank' => 'Wing Bank',         'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_3'],
            ['name' => 'Takeo Smart Devices Distributor',             'country' => 'Cambodia',    'city' => 'Krong Doun Kaev',       'province' => 'Takeo',                        'phone' => '+855 32 931 111', 'bank' => 'ABA Bank',         'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_3'],
            ['name' => 'Kampong Speu Industrial Electronics',         'country' => 'Cambodia',    'city' => 'Krong Chbar Mon',       'province' => 'Kampong Speu',                 'phone' => '+855 25 985 111', 'bank' => 'Canadia Bank',      'curr' => 'USD', 'type' => 'distributor',       'tier' => 'tier_2'],
            ['name' => 'Prey Veng Regional Retail Logistics',         'country' => 'Cambodia',    'city' => 'Krong Prey Veng',       'province' => 'Prey Veng',                    'phone' => '+855 43 944 111', 'bank' => 'ACLEDA Bank Plc',  'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_3'],
            ['name' => 'Pursat Hardware & Component Depot',           'country' => 'Cambodia',    'city' => 'Krong Pursat',          'province' => 'Pursat',                       'phone' => '+855 52 951 111', 'bank' => 'Wing Bank',         'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_3'],
            ['name' => 'Kampong Thom Digital Trade Network',          'country' => 'Cambodia',    'city' => 'Krong Stueng Saen',     'province' => 'Kampong Thom',                 'phone' => '+855 62 961 111', 'bank' => 'ABA Bank',         'curr' => 'USD', 'type' => 'distributor',       'tier' => 'tier_2'],
            ['name' => 'Kratie Mekong River Electronics Wholesale',   'country' => 'Cambodia',    'city' => 'Krong Kratie',          'province' => 'Kratie',                       'phone' => '+855 72 971 111', 'bank' => 'Canadia Bank',      'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_3'],
            ['name' => 'Stung Treng Border Technology Trading',       'country' => 'Cambodia',    'city' => 'Krong Stung Treng',     'province' => 'Stung Treng',                  'phone' => '+855 74 973 111', 'bank' => 'ACLEDA Bank Plc',  'curr' => 'USD', 'type' => 'distributor',       'tier' => 'tier_3'],
            ['name' => 'Ratanakiri Highlands Smart Devices',          'country' => 'Cambodia',    'city' => 'Krong Banlung',         'province' => 'Ratanakiri',                   'phone' => '+855 75 974 111', 'bank' => 'ABA Bank',         'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_3'],
            ['name' => 'Koh Kong Port Technology Importers',          'country' => 'Cambodia',    'city' => 'Krong Khemarak Phoumin', 'province' => 'Koh Kong',                    'phone' => '+855 35 935 111', 'bank' => 'Wing Bank',         'curr' => 'USD', 'type' => 'direct_importer',   'tier' => 'tier_2'],
            ['name' => 'Preah Vihear Northern Tech Supply',           'country' => 'Cambodia',    'city' => 'Krong Tbeng Meanchey',  'province' => 'Preah Vihear',                 'phone' => '+855 64 964 111', 'bank' => 'Canadia Bank',      'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_3'],
            ['name' => 'Chaktomuk IT & Barcode Equipment',            'country' => 'Cambodia',    'city' => 'Khan Dangkao',          'province' => 'Phnom Penh',                   'phone' => '+855 23 888 125', 'bank' => 'ABA Bank',         'curr' => 'USD', 'type' => 'distributor',       'tier' => 'tier_1'],
            ['name' => 'Vimean Tech Solutions Cambodia',              'country' => 'Cambodia',    'city' => 'Khan Prampi Makara',    'province' => 'Phnom Penh',                   'phone' => '+855 23 888 126', 'bank' => 'ACLEDA Bank Plc',  'curr' => 'USD', 'type' => 'authorized_dealer', 'tier' => 'tier_1'],
            ['name' => 'Sensok Computer Wholesale Center',            'country' => 'Cambodia',    'city' => 'Khan Sen Sok',          'province' => 'Phnom Penh',                   'phone' => '+855 23 888 127', 'bank' => 'Canadia Bank',      'curr' => 'USD', 'type' => 'wholesaler',        'tier' => 'tier_2'],
            ['name' => 'Tuol Kouk Digital Hardware Supply',           'country' => 'Cambodia',    'city' => 'Khan Tuol Kouk',        'province' => 'Phnom Penh',                   'phone' => '+855 23 888 128', 'bank' => 'Wing Bank',         'curr' => 'USD', 'type' => 'distributor',       'tier' => 'tier_2'],
            ['name' => 'Boeung Keng Kang Retail Tech Sourcing',       'country' => 'Cambodia',    'city' => 'Khan Boeng Keng Kang',  'province' => 'Phnom Penh',                   'phone' => '+855 23 888 129', 'bank' => 'ABA Bank',         'curr' => 'USD', 'type' => 'authorized_dealer', 'tier' => 'tier_1'],
            ['name' => 'Chroy Changvar Logistics Hardware Depot',      'country' => 'Cambodia',    'city' => 'Khan Chroy Changvar',   'province' => 'Phnom Penh',                   'phone' => '+855 23 888 130', 'bank' => 'Sathapana Bank',    'curr' => 'USD', 'type' => 'logistics_supplier','tier' => 'tier_2'],
            ['name' => 'Siam Micro-Electronics Group (Bangkok)',      'country' => 'Thailand',    'city' => 'Bangkok',               'province' => 'Bangkok',                      'phone' => '+66 2 123 4567',  'bank' => 'Kasikornbank',      'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Bangkok Smart POS Technology Co.',            'country' => 'Thailand',    'city' => 'Bangkok',               'province' => 'Bangkok',                      'phone' => '+66 2 987 6543',  'bank' => 'Bangkok Bank',      'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Eastern Seaboard Components Ltd.',            'country' => 'Thailand',    'city' => 'Chonburi',              'province' => 'Chonburi',                     'phone' => '+66 38 123 456',  'bank' => 'Siam Commercial',   'curr' => 'USD', 'type' => 'direct_importer',   'tier' => 'tier_1'],
            ['name' => 'Saigon Components Tech Group (HCMC)',         'country' => 'Vietnam',     'city' => 'Ho Chi Minh City',      'province' => 'Ho Chi Minh',                  'phone' => '+84 28 3822 1000','bank' => 'Vietcombank',       'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Hanoi Optical & Sensor Technologies',         'country' => 'Vietnam',     'city' => 'Hanoi',                 'province' => 'Hanoi',                        'phone' => '+84 24 3933 2000','bank' => 'BIDV Bank',         'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Danang Semiconductor Import-Export',          'country' => 'Vietnam',     'city' => 'Danang',                'province' => 'Danang',                       'phone' => '+84 236 388 900', 'bank' => 'Techcombank',       'curr' => 'USD', 'type' => 'direct_importer',   'tier' => 'tier_2'],
            ['name' => 'Shenzhen Smart POS Hardware Co., Ltd.',       'country' => 'China',       'city' => 'Shenzhen',              'province' => 'Guangdong',                    'phone' => '+86 755 8888 9999','bank' => 'Bank of China',     'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Guangzhou Display & Touchpanel Group',        'country' => 'China',       'city' => 'Guangzhou',             'province' => 'Guangdong',                    'phone' => '+86 20 8765 4321', 'bank' => 'ICBC Bank',         'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Dongguan Precision Micro-Connectors',         'country' => 'China',       'city' => 'Dongguan',              'province' => 'Guangdong',                    'phone' => '+86 769 8234 5678','bank' => 'China Construction','curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Hong Kong Global Trade Electronics',          'country' => 'Hong Kong',   'city' => 'Kowloon',               'province' => 'Hong Kong',                    'phone' => '+852 2345 6789',  'bank' => 'HSBC Hong Kong',    'curr' => 'USD', 'type' => 'direct_importer',   'tier' => 'tier_1'],
            ['name' => 'Lion City IT Sourcing Singapore Pte Ltd',     'country' => 'Singapore',   'city' => 'Singapore',             'province' => 'Central',                      'phone' => '+65 6789 0123',   'bank' => 'DBS Bank',          'curr' => 'USD', 'type' => 'direct_importer',   'tier' => 'tier_1'],
            ['name' => 'Marina Bay Retail Technology Asia',           'country' => 'Singapore',   'city' => 'Singapore',             'province' => 'Central',                      'phone' => '+65 6234 5678',   'bank' => 'OCBC Bank',         'curr' => 'USD', 'type' => 'distributor',       'tier' => 'tier_1'],
            ['name' => 'Jurong Logistics & Barcode Scanners',         'country' => 'Singapore',   'city' => 'Singapore',             'province' => 'Jurong',                       'phone' => '+65 6890 1234',   'bank' => 'UOB Bank',          'curr' => 'USD', 'type' => 'logistics_supplier','tier' => 'tier_1'],
            ['name' => 'Tokyo Precision Optical Devices Corp.',       'country' => 'Japan',       'city' => 'Tokyo',                 'province' => 'Kanto',                        'phone' => '+81 3 5555 0100', 'bank' => 'MUFG Bank',         'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Osaka Electronics Industrial Group',          'country' => 'Japan',       'city' => 'Osaka',                 'province' => 'Kansai',                       'phone' => '+81 6 6234 5678', 'bank' => 'Sumitomo Mitsui',   'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Taipei Semiconductor & Motherboard Co.',      'country' => 'Taiwan',      'city' => 'Taipei',                'province' => 'Taipei',                       'phone' => '+886 2 2345 6789','bank' => 'CTBC Bank',         'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Hsinchu High-Tech Hardware Labs',             'country' => 'Taiwan',      'city' => 'Hsinchu',               'province' => 'Hsinchu',                      'phone' => '+886 3 578 9012', 'bank' => 'Mega ICBC',         'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Seoul Mobile Components Global',              'country' => 'South Korea', 'city' => 'Seoul',                 'province' => 'Seoul',                        'phone' => '+82 2 3456 7890', 'bank' => 'Shinhan Bank',      'curr' => 'USD', 'type' => 'manufacturer',      'tier' => 'tier_1'],
            ['name' => 'Incheon Digital Systems Logistics',           'country' => 'South Korea', 'city' => 'Incheon',               'province' => 'Gyeonggi',                     'phone' => '+82 32 890 1234', 'bank' => 'KB Kookmin Bank',   'curr' => 'USD', 'type' => 'logistics_supplier','tier' => 'tier_1'],
            ['name' => 'Kuala Lumpur Smart Device Hub',               'country' => 'Malaysia',    'city' => 'Kuala Lumpur',          'province' => 'Federal Territory',            'phone' => '+60 3 2145 6789', 'bank' => 'Maybank',           'curr' => 'USD', 'type' => 'distributor',       'tier' => 'tier_2'],
        ];

        DB::table('suppliers')->truncate();
        $suppliers = [];

        for ($i = 1; $i <= 50; $i++) {
            $tpl = $suppliersList[$i - 1];
            $name = $tpl['name'];
            $code = 'SPL-' . str_pad($i, 4, '0', STR_PAD_LEFT);
            $cleanDomain = strtolower(preg_replace('/[^A-Za-z0-9]/', '', explode(' ', $name)[0] . explode(' ', $name)[1]));
            $cleanEmail = 'sales@' . $cleanDomain . '.com';

            $suppliers[] = [
                'id' => $i,
                'company_id' => $companyId,
                'name' => $name,
                'code' => $code,
                'logo' => 'suppliers/' . strtolower($code) . '.svg',
                'email' => $cleanEmail,
                'phone' => $tpl['phone'],
                'fax' => null,
                'website' => 'https://www.' . $cleanDomain . '.com',
                'hotline' => $tpl['phone'],
                'support_email' => 'support@' . $cleanDomain . '.com',
                'supplier_type' => $tpl['type'],
                'tier' => $tpl['tier'],
                'address' => "Street " . (($i * 12) % 400 + 1) . ", Commercial Trade Zone",
                'city' => $tpl['city'],
                'province' => $tpl['province'],
                'country' => $tpl['country'],
                'postal_code' => '120' . str_pad($i % 100, 2, '0', STR_PAD_LEFT),
                'tax_number' => 'K00' . str_pad($i, 7, '0', STR_PAD_LEFT),
                'credit_limit' => rand(15000, 150000),
                'payment_terms' => 'Net 30',
                'payment_term_days' => 30,
                'lead_time_days' => $tpl['country'] === 'Cambodia' ? 1 : 5,
                'currency_code' => $tpl['curr'],
                'bank_name' => $tpl['bank'],
                'bank_account_number' => '00' . rand(100, 999) . '-' . rand(100, 999) . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'bank_account_name' => strtoupper($name),
                'swift_code' => $tpl['country'] === 'Cambodia' ? 'ABAKKHPP' : 'SWIFT' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'notes' => "Official verified supply vendor for enterprise hardware and consumer devices.",
                'is_active' => true,
                'created_at' => now()->subDays(rand(10, 180)),
                'updated_at' => now(),
            ];
        }
        DB::table('suppliers')->insert($suppliers);

        // Seed 35 Distinct Supplier Contacts
        DB::table('supplier_contacts')->truncate();
        $contacts = [];
        $khmerContactNames = [
            'Chan Vathana', 'Heng Piseth', 'Sok Visal', 'Chea Sothea', 'Pich Ponlok',
            'Ung Sambath', 'Mao Sarath', 'Nuon Virak', 'Kong Pisey', 'Em Samnang',
            'Meas Sreypov', 'Lim Socheata', 'Tep Bopha', 'Keo Kolap', 'Mam Theary',
            'Ly Sreynich', 'Khim Malis', 'Chenda Phalla', 'Sophal Devi', 'Vanny Khemara',
            'Nita Sovanny', 'Thyda Pich', 'Sreyka Mom', 'Roth Neary', 'Bopha Romduol',
            'Dany Kunthea', 'Channary Leak', 'Sophea Kalyan', 'Malis Chanda', 'Sina Phary',
            'Vicheka Thida', 'Channy Solika', 'Kalyan Raksmey', 'Sovanna Sreymom', 'Neary Rathana'
        ];

        for ($i = 1; $i <= 35; $i++) {
            $contactName = $khmerContactNames[$i - 1];
            $cleanEmail = strtolower(str_replace(' ', '.', $contactName)) . '@supplier.com';
            $contacts[] = [
                'supplier_id' => $i,
                'name' => $contactName,
                'title' => ($i % 3 === 0) ? 'Chief Operations Officer' : (($i % 2 === 0) ? 'Enterprise Account Director' : 'Senior Sales Manager'),
                'email' => $cleanEmail,
                'phone' => '+855 ' . (['12', '93', '71', '85', '96'][($i - 1) % 5]) . ' ' . rand(100, 999) . ' ' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'is_primary' => true,
                'created_at' => now()->subDays(rand(5, 100)),
                'updated_at' => now(),
            ];
        }
        DB::table('supplier_contacts')->insert($contacts);
    }
}
