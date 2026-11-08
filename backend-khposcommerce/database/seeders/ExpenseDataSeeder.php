<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExpenseDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Truncate expenses and categories
        DB::table('expenses')->truncate();
        DB::table('expense_categories')->truncate();

        // 2. Standard 12 OPEX Categories template
        $templateCategories = [
            // Group 1: ទីតាំង & ហាងលក់ទំនិញ (Store & Facilities)
            ['name' => 'ថ្លៃជួលទីតាំងហាង & ឃ្លាំង', 'code' => 'EXP-RENT', 'desc' => 'ថ្លៃជួលទីតាំងហាងលក់រាយ និងឃ្លាំងស្តុកទំនិញប្រចាំខែ'],
            ['name' => 'ថ្លៃទឹក ភ្លើង & ម៉ាស៊ីនត្រជាក់', 'code' => 'EXP-UTIL', 'desc' => 'ថ្លៃទឹក ភ្លើងរដ្ឋ អគ្គិសនី និងម៉ាស៊ីនត្រជាក់ហាង'],
            ['name' => 'សម្ភារៈប្រើប្រាស់ POS & ក្រដាសកម្ដៅ', 'code' => 'EXP-POS', 'desc' => 'ក្រដាសវិក្កយបត្រកម្ដៅ 80mm/58mm ទឹកថ្នាំព្រីន និងសម្ភារៈកេះប្រាក់'],
            ['name' => 'ការថែទាំ & ជួសជុលហាង', 'code' => 'EXP-MAIN', 'desc' => 'ការជួសជុលអំពូលភ្លើង ម៉ាស៊ីនត្រជាក់ ទូកញ្ចក់ និងសម្អាតហាង'],

            // Group 2: ការលក់ ទីផ្សារ & ដឹកជញ្ជូន (Sales, Marketing & Logistics)
            ['name' => 'ថ្លៃផ្សព្វផ្សាយ & ទីផ្សារឌីជីថល', 'code' => 'EXP-MKT', 'desc' => 'ចំណាយផ្សាយពាណិជ្ជកម្ម Meta Ads, TikTok, Google & Influencers'],
            ['name' => 'ប្រអប់កាតុង ថង់ & ប្លាស្ទិកវេចខ្ចប់', 'code' => 'EXP-PACK', 'desc' => 'ប្រអប់កាតុង eCommerce ថង់យួរ និង Bubble wrap ការពារទំនិញ'],
            ['name' => 'សេវាផ្ញើទំនិញ & ប្រេងឥន្ធនៈដឹកជញ្ជូន', 'code' => 'EXP-LOG', 'desc' => 'សេវាដឹកជញ្ជូនរហ័ស J&T, Virak Buntham និងប្រេងសាំងឡាន/ម៉ូតូដឹកជញ្ជូន'],

            // Group 3: បុគ្គលិក & រដ្ឋបាលទូទៅ (Staff & Administration)
            ['name' => 'ប្រាក់បៀវត្សរ៍ & ប្រាក់លើកទឹកចិត្ត', 'code' => 'EXP-SAL', 'desc' => 'ប្រាក់ខែមូលដ្ឋាន ប្រាក់បន្ថែមម៉ោង OT និងកម្រៃជើងសារបុគ្គលិក'],
            ['name' => 'អាហារសម្រន់ & សុខុមាលភាពបុគ្គលិក', 'code' => 'EXP-WELF', 'desc' => 'ទឹកផឹកបរិសុទ្ធ កាហ្វេ តែ អាហារសម្រន់ និងថ្នាំសង្កូវបឋម'],
            ['name' => 'សម្ភារៈការិយាល័យ & សេវាគណនេយ្យ', 'code' => 'EXP-ADM', 'desc' => 'ក្រដាស A4 ប៊ិច ឯកសាររដ្ឋបាល និងថ្លៃសេវាគណនេយ្យ/ពន្ធដារ'],

            // Group 4: បច្ចេកវិទ្យា & ប្រព័ន្ធព័ត៌មានវិទ្យា (IT & Software)
            ['name' => 'ថ្លៃ Cloud Server, Hosting & POS SaaS', 'code' => 'EXP-SRV', 'desc' => 'ថ្លៃសេវាម៉ាស៊ីនបម្រើ Cloud, Domain, SSL និងប្រព័ន្ធទិន្នន័យ'],
            ['name' => 'អ៊ីនធឺណិត Fiber & សេវាទូរស័ព្ទ', 'code' => 'EXP-NET', 'desc' => 'សេវាអ៊ីនធឺណិតល្បឿនលឿន Fiber Optic និងស៊ីមទូរស័ព្ទប្រចាំហាង'],
        ];

        // Ensure all companies in database (1, 2, 3) get full set of categories
        $companyIds = DB::table('companies')->orderBy('id')->pluck('id')->toArray();
        if (empty($companyIds)) {
            $companyIds = [1, 2, 3];
        }

        $allCategories = [];
        $catMap = []; // [companyId => [templateIndex => categoryId]]
        $catCounter = 1;
        $now = Carbon::now();

        foreach ($companyIds as $cId) {
            $catMap[$cId] = [];
            foreach ($templateCategories as $idx => $tCat) {
                $curId = $catCounter++;
                $catMap[$cId][$idx] = $curId;
                $allCategories[] = [
                    'id'          => $curId,
                    'company_id'  => $cId,
                    'name'        => $tCat['name'],
                    'code'        => $tCat['code'],
                    'description' => $tCat['desc'],
                    'is_active'   => true,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ];
            }
        }
        DB::table('expense_categories')->insert($allCategories);

        // 3. Operational Expenses Template Data (for realistic business operations)
        $expenseTemplates = [
            [
                'title'       => 'ទិញក្រដាសកម្ដៅ 80mm ចំនួន ៥ កេស សម្រាប់ម៉ាស៊ីន POS',
                'cat_idx'     => 2, // EXP-POS
                'amount'      => 65.00,
                'days_ago'    => 0,
                'status'      => 'approved',
                'desc'        => 'ទិញក្រដាស Thermal Receipt Paper 80x80mm ចំនួន ៥ កេស សម្រាប់បញ្ជរគិតប្រាក់ POS។',
            ],
            [
                'title'       => 'ចាក់ប្រេងសាំងម៉ូតូដឹកជញ្ជូនរហ័សប្រចាំថ្ងៃ',
                'cat_idx'     => 6, // EXP-LOG
                'amount'      => 20.00,
                'days_ago'    => 0,
                'status'      => 'approved',
                'desc'        => 'សាច់ប្រាក់រាយចាក់សាំងម៉ូតូដឹកជញ្ជូន Deliveries វេនព្រឹក និងរសៀល។',
            ],
            [
                'title'       => 'ទិញទឹកផឹកបរិសុទ្ធ ៥ ធុង និងកាហ្វេសម្រាប់បុគ្គលិក',
                'cat_idx'     => 8, // EXP-WELF
                'amount'      => 25.50,
                'days_ago'    => 0,
                'status'      => 'pending',
                'desc'        => 'ទឹកបរិសុទ្ធ 20L ចំនួន ៥ ធុង និងកាហ្វេសម្រាប់បន្ទប់សម្រាកបុគ្គលិក។',
            ],
            [
                'title'       => 'ចំណាយលើការរត់ពាណិជ្ជកម្ម Meta Ads (Facebook & Instagram)',
                'cat_idx'     => 4, // EXP-MKT
                'amount'      => 150.00,
                'days_ago'    => 1,
                'status'      => 'approved',
                'desc'        => 'យុទ្ធនាការផ្សព្វផ្សាយប្រចាំសប្តាហ៍លើទំព័រ Facebook Page និង Instagram Shop។',
            ],
            [
                'title'       => 'ទិញប្រអប់កាតុង និង Bubble Wrap សម្រាប់វេចខ្ចប់ eCommerce',
                'cat_idx'     => 5, // EXP-PACK
                'amount'      => 85.00,
                'days_ago'    => 1,
                'status'      => 'approved',
                'desc'        => 'ប្រអប់កាតុងទំហំ M & L ចំនួន ២០០ ប្រអប់ និង Bubble wrap ២ ដុំធំ។',
            ],
            [
                'title'       => 'ថ្លៃជួសជុលម៉ាស៊ីនត្រជាក់បន្ទប់តាំងទំនិញ',
                'cat_idx'     => 3, // EXP-MAIN
                'amount'      => 45.00,
                'days_ago'    => 2,
                'status'      => 'pending',
                'desc'        => 'សេវាលាងសម្អាត និងបញ្ចូលហ្គាសម៉ាស៊ីនត្រជាក់ 2HP។',
            ],
            [
                'title'       => 'ថ្លៃសេវាអ៊ីនធឺណិត Fiber Optic 500Mbps ប្រចាំខែ',
                'cat_idx'     => 11, // EXP-NET
                'amount'      => 80.00,
                'days_ago'    => 2,
                'status'      => 'approved',
                'desc'        => 'វិក្កយបត្រអ៊ីនធឺណិតក្រុមហ៊ុនផ្តល់សេវា OpenNet/Today ISP។',
            ],
            [
                'title'       => 'សេវាផ្ញើទំនិញអន្តរខេត្តតាម វីរៈប៊ុនថាំ (VET Express)',
                'cat_idx'     => 6, // EXP-LOG
                'amount'      => 42.00,
                'days_ago'    => 3,
                'status'      => 'approved',
                'desc'        => 'ថ្លៃផ្ញើទំនិញអតិថិជន eCommerce ទៅកាន់ខេត្តបាត់ដំបង និងសៀមរាប។',
            ],
            [
                'title'       => 'ទិញសម្ភារៈការិយាល័យ ក្រដាស A4 និងប៊ិច',
                'cat_idx'     => 9, // EXP-ADM
                'amount'      => 35.00,
                'days_ago'    => 3,
                'status'      => 'approved',
                'desc'        => 'ក្រដាស A4 Double A ចំនួន ៥ រុំ ថតឯកសារ និងប៊ិចសរសេរ។',
            ],
            [
                'title'       => 'ទូទាត់ថ្លៃ Cloud Server & PostgreSQL Database Hosting',
                'cat_idx'     => 10, // EXP-SRV
                'amount'      => 120.00,
                'days_ago'    => 4,
                'status'      => 'approved',
                'desc'        => 'សេវាកម្ម Cloud VPS និង Database Backup ប្រចាំខែសម្រាប់ប្រព័ន្ធ POS & API។',
            ],
            [
                'title'       => 'ទូទាត់ថ្លៃជួលទីតាំងហាងប្រចាំខែ',
                'cat_idx'     => 0, // EXP-RENT
                'amount'      => 1200.00,
                'days_ago'    => 5,
                'status'      => 'approved',
                'desc'        => 'ថ្លៃជួលអគារពាណិជ្ជកម្មសម្រាប់ខែតុលា ឆ្នាំ២០២៦។',
            ],
            [
                'title'       => 'ថ្លៃអគ្គិសនី EDC និងទឹកស្អាតរដ្ឋប្រចាំខែ',
                'cat_idx'     => 1, // EXP-UTIL
                'amount'      => 380.00,
                'days_ago'    => 5,
                'status'      => 'approved',
                'desc'        => 'វិក្កយបត្រអគ្គិសនីកម្ពុជា EDC និងរដ្ឋាករទឹកស្អាត។',
            ],
            [
                'title'       => 'ទិញថង់យួរជីវគីមី Biodegradable Bags ចំនួន ១០ គីឡូ',
                'cat_idx'     => 5, // EXP-PACK
                'amount'      => 32.00,
                'days_ago'    => 6,
                'status'      => 'approved',
                'desc'        => 'ថង់យួរទំនិញសម្រាប់អតិថិជនទិញនៅបញ្ជរ POS ផ្ទាល់។',
            ],
            [
                'title'       => 'ថ្លៃសេវាថែទាំកាមេរ៉ា CCTV និងប្រព័ន្ធ Alarm សុវត្ថិភាព',
                'cat_idx'     => 3, // EXP-MAIN
                'amount'      => 55.00,
                'days_ago'    => 6,
                'status'      => 'approved',
                'desc'        => 'ត្រួតពិនិត្យខ្សែ និងក្បាលកាមេរ៉ាសុវត្ថិភាព ៨ គ្រាប់ជុំវិញបរិវេណហាង។',
            ],
            [
                'title'       => 'ទិញឧបករណ៍ស្កេនបាកូដឥតខ្សែបន្ថែម (Wireless Barcode Scanner)',
                'cat_idx'     => 2, // EXP-POS
                'amount'      => 75.00,
                'days_ago'    => 7,
                'status'      => 'approved',
                'desc'        => 'ម៉ាស៊ីនស្កេន 2D Bluetooth Barcode Scanner សម្រាប់តុរៀបចំអីវ៉ាន់ eCommerce។',
            ],
            [
                'title'       => 'ប្រាក់ឧបត្ថម្ភអាហារបន្ថែមម៉ោងវេនរាត្រី (Overtime Catering)',
                'cat_idx'     => 8, // EXP-WELF
                'amount'      => 40.00,
                'days_ago'    => 8,
                'status'      => 'approved',
                'desc'        => 'អាហារពេលល្ងាចសម្រាប់បុគ្គលិករាប់ស្តុកប្រចាំត្រីមាស។',
            ],
            [
                'title'       => 'ថ្លៃសេវាប្រកាសពន្ធ និងគណនេយ្យប្រចាំខែ',
                'cat_idx'     => 9, // EXP-ADM
                'amount'      => 150.00,
                'days_ago'    => 12,
                'status'      => 'approved',
                'desc'        => 'សេវាកម្មប្រកាសពន្ធប្រចាំខែ (GDT Monthly Tax Return Filing)។',
            ],
            [
                'title'       => 'សេវាផ្សព្វផ្សាយលើ TikTok Shop និងសហការជាមួយ Creator',
                'cat_idx'     => 4, // EXP-MKT
                'amount'      => 180.00,
                'days_ago'    => 14,
                'status'      => 'approved',
                'desc'        => 'ចំណាយលើវីដេអូ Review ផលិតផល និង TikTok Spark Ads។',
            ],
            [
                'title'       => 'ការស្នើសុំទិញកៅអីការិយាល័យបន្ថែម ២ គ្រឿង',
                'cat_idx'     => 9, // EXP-ADM
                'amount'      => 70.00,
                'days_ago'    => 2,
                'status'      => 'pending',
                'desc'        => 'ស្នើសុំទិញកៅអី Ergonomic សម្រាប់បុគ្គលិកផ្នែកបម្រើអតិថិជន។',
            ],
            [
                'title'       => 'ការស្នើសុំដំឡើង RAM កុំព្យូទ័រ Server សាខា',
                'cat_idx'     => 10, // EXP-SRV
                'amount'      => 60.00,
                'days_ago'    => 1,
                'status'      => 'pending',
                'desc'        => 'ស្នើសុំដំឡើង RAM 16GB សម្រាប់កុំព្យូទ័របម្រើការលក់ POS។',
            ],
        ];

        $insertedExpenses = [];
        $expGlobalCounter = 1;

        foreach ($companyIds as $cId) {
            $branchId = $cId; // Branch 1 for Company 1, Branch 2 for Company 2, Branch 3 for Company 3
            $branchCode = $cId === 1 ? 'HQ' : ($cId === 2 ? 'TK' : 'SR');

            // For Company 1 (HQ): insert all 20 records
            // For other branches: insert a subset of 10 records
            $subset = ($cId === 1) ? $expenseTemplates : array_slice($expenseTemplates, 0, 10);

            foreach ($subset as $tmpl) {
                $eId = $expGlobalCounter++;
                $catId = $catMap[$cId][$tmpl['cat_idx']];
                $dateObj = Carbon::now()->subDays($tmpl['days_ago']);
                $dateStr = $dateObj->format('Y-m-d');
                $createdAt = $dateObj->copy()->setHour(rand(8, 17))->setMinute(rand(0, 59));
                $refNumber = sprintf('EXP-%s-%s-%04d', $branchCode, $dateObj->format('Ym'), $eId);

                $insertedExpenses[] = [
                    'id'                  => $eId,
                    'company_id'          => $cId,
                    'branch_id'           => $branchId,
                    'expense_category_id' => $catId,
                    'user_id'             => 1,
                    'reference_number'    => $refNumber,
                    'title'               => $tmpl['title'],
                    'description'         => $tmpl['desc'],
                    'amount'              => $tmpl['amount'],
                    'date'                => $dateStr,
                    'receipt'             => 'receipts/receipt-' . (($eId % 10) + 1) . '.jpg',
                    'status'              => $tmpl['status'],
                    'created_at'          => $createdAt,
                    'updated_at'          => $createdAt,
                ];
            }
        }

        DB::table('expenses')->insert($insertedExpenses);

        if (DB::getDriverName() === 'pgsql') {
            try {
                DB::statement("SELECT setval('expense_categories_id_seq', COALESCE((SELECT MAX(id) FROM expense_categories), 0) + 1, false);");
                DB::statement("SELECT setval('expenses_id_seq', COALESCE((SELECT MAX(id) FROM expenses), 0) + 1, false);");
            } catch (\Throwable $e) {}
        }
    }
}
