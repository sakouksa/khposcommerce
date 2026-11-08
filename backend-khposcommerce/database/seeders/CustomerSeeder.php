<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company\Company;
use App\Models\Company\Store;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::value('id') ?? 1;
        $storeId = Store::value('id') ?? 1;

        // 1. Customer Groups (10 records)
        $groups = [];
        $groupNames = [
            'General Retail',
            'VIP Platinum',
            'Gold Member',
            'Silver Member',
            'Wholesale Buyer',
            'Company Partner',
            'Employee Family',
            'Distributor tier 1',
            'Distributor tier 2',
            'Dropshipper'
        ];
        foreach ($groupNames as $i => $name) {
            $groups[] = [
                'id' => $i + 1,
                'company_id' => $companyId,
                'name' => $name,
                'description' => "Group for " . $name,
                'discount_percent' => rand(0, 15),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('customer_groups')->upsert($groups, ['id'], ['name', 'description', 'discount_percent', 'is_active', 'updated_at']);

        // 50 Authentic Unique Cambodian Male Names
        $khmerMaleNames = [
            'Sok Dara', 'Chan Vanna', 'Heng Piseth', 'Bun Rotha', 'Chea Sothea',
            'Kim Seng', 'Seng Sovann', 'Ouk Panha', 'Rath Vicheka', 'Tep Rithy',
            'Long Vannak', 'Chhim Kosal', 'Ung Sambath', 'Prak Visal', 'Mao Sarath',
            'Vannak Thavry', 'Kheng Sophal', 'Noun Virak', 'Kong Pisey', 'Em Samnang',
            'Samnang Rath', 'Pich Ponlok', 'Srey Vuthy', 'Ros Chandara', 'Taing Meng',
            'Pheng Chanthou', 'Neth Sovannarith', 'Yim Phearom', 'Thon Samat', 'Mey Serey',
            'Keo Rithisak', 'Hout Vibol', 'Suon Chantha', 'Lay Socheat', 'Korn Phearith',
            'Prum Sereyvuth', 'Ly Monirath', 'Chhay Sovannara', 'Phan Boramey', 'Sun Thearith',
            'Sin Viseth', 'Khuon Vicheth', 'Chhorn Kakada', 'San Rathana', 'Vong Samith',
            'Pen Sovisal', 'Toch Chamroeun', 'Nhek Ratanak', 'Chey Norak', 'Dy Sereyvath'
        ];

        // 50 Authentic Unique Cambodian Female Names
        $khmerFemaleNames = [
            'Meas Sreypov', 'Lim Socheata', 'Pich Chanmony', 'Tep Bopha', 'Nuon Chantrea',
            'Chhorn Sreyleak', 'Keo Kolap', 'Mam Theary', 'Ly Sreynich', 'Khim Malis',
            'Chenda Phalla', 'Sophal Devi', 'Vanny Khemara', 'Nita Sovanny', 'Thyda Pich',
            'Sreyka Mom', 'Roth Neary', 'Bopha Romduol', 'Dany Kunthea', 'Channary Leak',
            'Sophea Kalyan', 'Malis Chanda', 'Sina Phary', 'Vicheka Thida', 'Channy Solika',
            'Kalyan Raksmey', 'Sovanna Sreymom', 'Neary Rathana', 'Socheat Vanny', 'Borey Kunthea',
            'Phat Sreyroth', 'Hun Sreynet', 'Oung Chanthy', 'Touch Mommony', 'Kong Socheat',
            'Chhouk Rachana', 'Vann Sotheary', 'Mom Chanleak', 'Srun Solida', 'Koy Bophana',
            'Heng Rathavy', 'Dy Channeth', 'Pao Sokunthea', 'Chheng Phirun', 'So Somavatey',
            'Yin Kanhara', 'Nhoek Sreynat', 'Sokun Theavy', 'Bin Sreypich', 'Chhea Sovanmoly'
        ];

        $khmerProvinces = [
            'Phnom Penh', 'Kandal', 'Siem Reap', 'Battambang', 'Tbong Khmum',
            'Kampong Cham', 'Kampot', 'Sihanoukville (Preah Sihanouk)', 'Takeo',
            'Kampong Speu', 'Prey Veng', 'Svay Rieng', 'Banteay Meanchey', 'Pursat',
            'Kampong Chhnang', 'Kampong Thom', 'Kratie', 'Stung Treng', 'Ratanakiri',
            'Mondulkiri', 'Koh Kong', 'Kep', 'Pailin', 'Oddar Meanchey', 'Preah Vihear'
        ];

        $phonePrefixes = ['012', '093', '071', '085', '096', '089', '010', '078', '088', '097'];
        $paymentTermsOptions = ['prepaid', 'net_15', 'net_30', 'net_60', 'eom'];
        $rfmOptions = ['champions', 'loyal', 'potential', 'at_risk', 'hibernating', 'new'];
        $tagPool = [
            '#B2BVerified', '#VIPContract', '#Wholesale', '#Dropshipper', '#FastPayer',
            '#Net30Approved', '#TaxExempt', '#BulkBuyer', '#SpecialDietary', '#HighSpender'
        ];

        // 2. Customers (100 distinct authentic records)
        $customers = [];
        for ($i = 1; $i <= 100; $i++) {
            $isMale = ($i % 2 === 1);
            $gender = $isMale ? 'male' : 'female';
            $idx = (int) floor(($i - 1) / 2);
            $customerName = $isMale ? $khmerMaleNames[$idx % 50] : $khmerFemaleNames[$idx % 50];

            $cleanSlug = strtolower(preg_replace('/[^A-Za-z0-9]/', '.', $customerName));
            $email = $cleanSlug . '@gmail.com';
            
            $prefix = $phonePrefixes[($i - 1) % count($phonePrefixes)];
            $phone = $prefix . ' ' . rand(100, 999) . ' ' . str_pad($i, 3, '0', STR_PAD_LEFT);

            // Enterprise Attributes
            $paymentTerms = ($i % 4 === 0) ? 'net_30' : (($i % 7 === 0) ? 'net_60' : (($i % 10 === 0) ? 'eom' : 'prepaid'));
            $creditLimit = ($paymentTerms !== 'prepaid') ? rand(2000, 50000) : 0;
            $outstandingBalance = ($creditLimit > 0) ? rand(0, (int) ($creditLimit * 0.8)) : 0;
            $isCreditHold = ($i % 18 === 0 && $outstandingBalance > 0);
            $walletBalance = ($i % 3 === 0) ? rand(10, 450) : 0;

            $rfmSegment = $rfmOptions[$i % count($rfmOptions)];
            $churnRisk = ($rfmSegment === 'at_risk') ? rand(60, 88) : (($rfmSegment === 'hibernating') ? rand(75, 95) : rand(5, 30));

            $assignedTags = [
                $tagPool[$i % count($tagPool)],
                $tagPool[($i + 3) % count($tagPool)],
            ];

            // First 50 customers have genuine real portrait avatars; the other 50 have null to display default avatar
            $avatarPhoto = ($i <= 50) ? 'customers/avatar_' . str_pad($i, 2, '0', STR_PAD_LEFT) . '.png' : null;

            $customers[] = [
                'id' => $i,
                'company_id' => $companyId,
                'customer_group_id' => ($i % 10) + 1,
                'name' => $customerName,
                'email' => $email,
                'phone' => $phone,
                'gender' => $gender,
                'birth_date' => '19' . rand(80, 99) . '-' . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-' . str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT),
                'photo' => $avatarPhoto,
                'loyalty_points' => rand(50, 1200),
                'payment_terms' => $paymentTerms,
                'credit_limit' => $creditLimit,
                'outstanding_balance' => $outstandingBalance,
                'is_credit_hold' => $isCreditHold,
                'wallet_balance' => $walletBalance,
                'tax_number' => 'K00' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'tax_branch_code' => ($i % 5 === 0) ? 'HQ-001' : '00001',
                'rfm_segment' => $rfmSegment,
                'churn_risk_score' => $churnRisk,
                'tags' => json_encode($assignedTags),
                'notes' => ($paymentTerms !== 'prepaid') ? "Enterprise B2B Account with {$paymentTerms} payment terms. Pre-approved for credit limit." : null,
                'is_active' => true,
                'created_at' => now()->subDays(rand(10, 180)),
                'updated_at' => now(),
            ];
        }
        DB::table('customers')->upsert($customers, ['id'], [
            'company_id', 'customer_group_id', 'name', 'email', 'phone', 'gender', 'birth_date', 
            'photo', 'loyalty_points', 'payment_terms', 'credit_limit', 'outstanding_balance', 
            'is_credit_hold', 'wallet_balance', 'tax_number', 'tax_branch_code', 'rfm_segment', 
            'churn_risk_score', 'tags', 'notes', 'is_active', 'updated_at'
        ]);

        // 3. Customer Addresses (100 records)
        $addresses = [];
        for ($i = 1; $i <= 100; $i++) {
            $province = $khmerProvinces[($i - 1) % count($khmerProvinces)];
            $cityName = ($province === 'Phnom Penh') ? 'Phnom Penh' : 'Krong ' . explode(' ', $province)[0];
            $streetNo = rand(10, 450);

            $addresses[] = [
                'id' => $i,
                'customer_id' => $i,
                'label' => ($i % 3 === 0) ? 'Office / Warehouse' : 'Head Office',
                'name' => $customers[$i - 1]['name'],
                'phone' => $customers[$i - 1]['phone'],
                'address' => "Building #" . $streetNo . ", St. " . rand(100, 598) . ", Sangkat " . (($i % 4) + 1) . ", Khan Daun Penh",
                'city' => $cityName,
                'province' => $province,
                'country' => 'Cambodia',
                'postal_code' => '120' . str_pad($i % 100, 2, '0', STR_PAD_LEFT),
                'is_default' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('customer_addresses')->upsert($addresses, ['id'], ['customer_id', 'label', 'name', 'phone', 'address', 'city', 'province', 'country', 'postal_code', 'is_default', 'updated_at']);

        // 4. B2B Multi-Contacts (for first 30 B2B customers)
        DB::table('customer_contacts')->truncate();
        $contacts = [];
        $jobTitles = ['Purchasing Manager', 'Chief Financial Officer', 'Senior Accountant', 'Operations Director', 'Supply Chain Specialist'];
        for ($i = 1; $i <= 30; $i++) {
            $contacts[] = [
                'customer_id' => $i,
                'name' => 'Sok Chantha',
                'email' => 'purchasing.' . $i . '@cambodiab2b.com',
                'phone' => '012 ' . rand(200, 800) . ' ' . rand(100, 999),
                'job_title' => $jobTitles[0],
                'department' => 'Procurement',
                'is_primary' => true,
                'notes' => 'Authorized person for placing purchase orders.',
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $contacts[] = [
                'customer_id' => $i,
                'name' => 'Heng Vanny',
                'email' => 'billing.' . $i . '@cambodiab2b.com',
                'phone' => '093 ' . rand(200, 800) . ' ' . rand(100, 999),
                'job_title' => $jobTitles[2],
                'department' => 'Finance & Accounting',
                'is_primary' => false,
                'notes' => 'Handles invoice clearing and bank transfers.',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('customer_contacts')->insert($contacts);

        // 5. KYC & Legal Documents (for first 25 customers)
        DB::table('customer_kyc_documents')->truncate();
        $docs = [];
        $docTypes = [
            ['patent_tax', 'Certificate of Patent Tax 2026', 'PAT-2026-'],
            ['vat_certificate', 'General Department of Taxation VAT Certificate', 'GDT-VAT-'],
            ['business_license', 'Ministry of Commerce Business Registration', 'MOC-REG-'],
            ['contract_agreement', 'B2B Annual Supply Agreement (Signed)', 'AGR-2026-']
        ];
        for ($i = 1; $i <= 25; $i++) {
            foreach ($docTypes as $dIdx => $docType) {
                $docs[] = [
                    'customer_id' => $i,
                    'document_type' => $docType[0],
                    'title' => $docType[1],
                    'document_number' => $docType[2] . str_pad($i * 10 + $dIdx, 6, '0', STR_PAD_LEFT),
                    'file_url' => '/assets/docs/enterprise_kyc_sample.pdf',
                    'file_size' => rand(450, 2400) . ' KB',
                    'issue_date' => '2026-01-15',
                    'expiry_date' => '2026-12-31',
                    'status' => 'verified',
                    'verified_by' => 'Compliance Officer - Seng Rath',
                    'verified_at' => now()->subDays(rand(5, 60)),
                    'notes' => 'Officially notarized and verified against GDT tax portal.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        DB::table('customer_kyc_documents')->insert($docs);

        // 6. Store Wallet Transactions (for first 25 customers)
        DB::table('customer_wallet_transactions')->truncate();
        $wltTxs = [];
        for ($i = 1; $i <= 25; $i++) {
            $wltTxs[] = [
                'customer_id' => $i,
                'type' => 'top_up',
                'amount' => 500.00,
                'balance_after' => 500.00,
                'reference_no' => 'WLT-DEP-' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'payment_method' => 'Bakong KHQR',
                'notes' => 'Prepaid corporate store credit top-up via Bakong KHQR.',
                'created_by' => 'Cashier - Dara',
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(20),
            ];
            $wltTxs[] = [
                'customer_id' => $i,
                'type' => 'pos_payment',
                'amount' => 125.50,
                'balance_after' => 374.50,
                'reference_no' => 'POS-SL-2026' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'payment_method' => 'Store Wallet',
                'notes' => 'Redeemed wallet balance on POS order invoice.',
                'created_by' => 'POS Terminal #01',
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ];
        }
        DB::table('customer_wallet_transactions')->insert($wltTxs);

        // 7. Loyalty Points Ledger (for first 30 customers)
        DB::table('customer_points_ledger')->truncate();
        $ptsLedger = [];
        for ($i = 1; $i <= 30; $i++) {
            $ptsLedger[] = [
                'customer_id' => $i,
                'type' => 'earned',
                'points' => 250.00,
                'balance_after' => 250.00,
                'reference_no' => 'INV-2026-PTS-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'expiry_date' => now()->addMonths(12)->toDateString(),
                'notes' => 'Earned 1 point per $2 spent on completed POS order.',
                'created_by' => 'System Rewards Engine',
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(30),
            ];
            $ptsLedger[] = [
                'customer_id' => $i,
                'type' => 'redeemed',
                'points' => 50.00,
                'balance_after' => 200.00,
                'reference_no' => 'RED-VOUCHER-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'expiry_date' => null,
                'notes' => 'Redeemed 50 points for $5 discount coupon.',
                'created_by' => 'POS Cashier',
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ];
        }
        DB::table('customer_points_ledger')->insert($ptsLedger);

        // 8. 360° Interaction Timeline (for first 30 customers)
        DB::table('customer_interactions')->truncate();
        $interactions = [];
        $interactionTemplates = [
            ['phone_call', 'Q1 Wholesale Price & Bulk Stock Negotiation', 'Discussed 15% discount for 500 units order. Customer requested formal quotation.'],
            ['meeting', 'Quarterly Partnership & Logistics Review', 'In-person meeting at customer head office. Agreed on Net 30 payment terms and weekly delivery schedule.'],
            ['telegram', 'Product Inquiry & Catalog Delivery', 'Sent updated 2026 digital product catalog and promotion list via official Telegram channel.'],
            ['site_visit', 'Warehouse Capacity & Delivery Inspection', 'Inspected customer receiving dock and verified unloading equipment for pallet deliveries.']
        ];
        for ($i = 1; $i <= 30; $i++) {
            $tpl = $interactionTemplates[$i % count($interactionTemplates)];
            $interactions[] = [
                'customer_id' => $i,
                'type' => $tpl[0],
                'subject' => $tpl[1],
                'description' => $tpl[2],
                'outcome' => 'completed',
                'interacted_at' => now()->subDays(rand(2, 45)),
                'next_follow_up_at' => now()->addDays(rand(5, 20)),
                'created_by' => 'Key Account Manager - Piseth',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('customer_interactions')->insert($interactions);

        // 9. Pricing Contracts (for first 20 B2B customers)
        DB::table('customer_pricing_contracts')->truncate();
        $contracts = [];
        for ($i = 1; $i <= 20; $i++) {
            $contracts[] = [
                'customer_id' => $i,
                'contract_number' => 'CTR-2026-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'title' => 'Exclusive Wholesale Distribution Master Agreement 2026',
                'start_date' => '2026-01-01',
                'end_date' => '2026-12-31',
                'discount_type' => 'percentage',
                'discount_value' => 12.50,
                'status' => 'active',
                'items' => json_encode([
                    ['category' => 'Beverages & Drinks', 'special_discount' => '15%'],
                    ['category' => 'Electronics & Accessories', 'special_discount' => '10%'],
                    ['tier_rule' => 'Orders > $5,000 receive additional 2% rebate'],
                ]),
                'terms_and_conditions' => 'Minimum order volume $1,500/month. Payment within 30 days of invoice receipt.',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('customer_pricing_contracts')->insert($contracts);

        // 10. Support Tickets & RMA Claims (for first 25 customers)
        DB::table('customer_support_tickets')->truncate();
        $tickets = [];
        $ticketTypes = [
            ['rma_return', 'urgent', 'open', 'Damaged Packaging during Delivery (Box #3)', 'Customer reported damaged outer cartons during courier drop-off. Warehouse inspection requested.'],
            ['warranty_claim', 'high', 'in_progress', 'POS Hardware Scanner Replacement Request', 'Barcode scanner unit SN-98231 not reading 2D QR codes. Replacement dispatched.'],
            ['inquiry', 'medium', 'resolved', 'e-Invoice Tax Breakdown Clarification', 'Inquired about VAT breakdown on invoice #INV-9821. Tax invoice re-sent by accounting.'],
            ['billing_issue', 'low', 'closed', 'Payment Reconciliation Confirmation', 'Confirmed bank transfer receipt for overdue Net 30 balance. Account unblocked.']
        ];
        for ($i = 1; $i <= 25; $i++) {
            $tTpl = $ticketTypes[$i % count($ticketTypes)];
            $tickets[] = [
                'customer_id' => $i,
                'ticket_number' => 'TCK-2026-' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'subject' => $tTpl[3],
                'type' => $tTpl[0],
                'priority' => $tTpl[1],
                'status' => $tTpl[2],
                'description' => $tTpl[4],
                'resolution' => ($tTpl[2] === 'resolved' || $tTpl[2] === 'closed') ? 'Resolved and signed off with client.' : null,
                'assigned_to' => 'Support Lead - Sophea',
                'created_at' => now()->subDays(rand(1, 20)),
                'updated_at' => now(),
            ];
        }
        DB::table('customer_support_tickets')->insert($tickets);
    }
}
