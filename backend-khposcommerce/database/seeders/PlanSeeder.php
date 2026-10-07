<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company\Plan;
use App\Models\Company\Company;
use App\Models\Company\Subscription;
use App\Models\Company\SubscriptionInvoice;
use App\Models\User;
use Carbon\Carbon;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'                 => 'Starter (អាជីវកម្មខ្នាតតូច)',
                'slug'                 => 'starter',
                'description'          => 'ស័ក្តិសមសម្រាប់ហាងទោល ឬអាជីវកម្មទើបចាប់ផ្តើមដំណើរការ',
                'price_monthly'        => 19.00,
                'price_yearly'         => 190.00,
                'currency'             => 'USD',
                'max_branches'         => 1,
                'max_users'            => 5,
                'max_warehouses'       => 2,
                'max_products'         => 500,
                'max_orders_per_month' => 1000,
                'max_storage_mb'       => 1024,
                'features'             => [
                    'pos_enabled'       => true,
                    'ecommerce_enabled' => false,
                    'advanced_reports'  => false,
                    'campaigns'         => false,
                    'api_access'        => false,
                    'mobile_app'        => true,
                    'khqr_payments'     => true,
                ],
                'is_popular'           => false,
                'is_active'            => true,
                'sort_order'           => 1,
            ],
            [
                'name'                 => 'Business (អាជីវកម្មរីកចម្រើន)',
                'slug'                 => 'business',
                'description'          => 'ពេញនិយមបំផុត! គ្រប់គ្រងច្រើនសាខា ឃ្លាំង និងប្រព័ន្ធលក់ E-Commerce',
                'price_monthly'        => 49.00,
                'price_yearly'         => 490.00,
                'currency'             => 'USD',
                'max_branches'         => 5,
                'max_users'            => 30,
                'max_warehouses'       => 10,
                'max_products'         => 10000,
                'max_orders_per_month' => 15000,
                'max_storage_mb'       => 10240,
                'features'             => [
                    'pos_enabled'       => true,
                    'ecommerce_enabled' => true,
                    'advanced_reports'  => true,
                    'campaigns'         => true,
                    'api_access'        => true,
                    'mobile_app'        => true,
                    'khqr_payments'     => true,
                    'audit_logs'        => true,
                    'multi_branch'      => true,
                ],
                'is_popular'           => true,
                'is_active'            => true,
                'sort_order'           => 2,
            ],
            [
                'name'                 => 'Enterprise (សហគ្រាសធំ)',
                'slug'                 => 'enterprise',
                'description'          => 'សម្រាប់សហគ្រាសធំ មិនកំណត់ចំនួនសាខា មុខងារគ្រប់យ៉ាង និង AI Assistant',
                'price_monthly'        => 129.00,
                'price_yearly'         => 1290.00,
                'currency'             => 'USD',
                'max_branches'         => -1,
                'max_users'            => -1,
                'max_warehouses'       => -1,
                'max_products'         => -1,
                'max_orders_per_month' => -1,
                'max_storage_mb'       => -1,
                'features'             => [
                    'pos_enabled'       => true,
                    'ecommerce_enabled' => true,
                    'advanced_reports'  => true,
                    'campaigns'         => true,
                    'api_access'        => true,
                    'mobile_app'        => true,
                    'khqr_payments'     => true,
                    'audit_logs'        => true,
                    'multi_branch'      => true,
                    'custom_domain'     => true,
                    'dedicated_support' => true,
                    'ai_chatbot'        => true,
                ],
                'is_popular'           => false,
                'is_active'            => true,
                'sort_order'           => 3,
            ],
        ];

        foreach ($plans as $p) {
            Plan::updateOrCreate(['slug' => $p['slug']], $p);
        }

        $starterPlan = Plan::where('slug', 'starter')->first();
        $businessPlan = Plan::where('slug', 'business')->first();
        $enterprisePlan = Plan::where('slug', 'enterprise')->first();

        // ─── Attach Subscriptions to Existing Companies ───────────────────────
        $companies = Company::all();
        $ownerUser = User::whereHas('roles', function($q) {
            $q->whereIn('name', ['owner', 'super_admin', 'admin']);
        })->first();

        foreach ($companies as $index => $company) {
            $plan = match ($index % 3) {
                0 => $businessPlan,
                1 => $starterPlan,
                2 => $enterprisePlan,
            };

            // Set primary owner
            if ($ownerUser && !$company->primary_owner_id) {
                $company->update(['primary_owner_id' => $ownerUser->id]);
            }

            $startDate = Carbon::now()->subMonths(rand(1, 4))->startOfDay();
            $endDate = (clone $startDate)->addYear();

            $subscription = Subscription::updateOrCreate(
                ['company_id' => $company->id],
                [
                    'plan_id'        => $plan->id,
                    'status'         => 'active',
                    'billing_cycle'  => 'yearly',
                    'amount'         => $plan->price_yearly,
                    'currency'       => 'USD',
                    'starts_at'      => $startDate,
                    'ends_at'        => $endDate,
                    'auto_renew'     => true,
                    'payment_method' => 'khqr',
                    'notes'          => 'Initial SaaS subscription setup for ' . $company->name,
                ]
            );

            // Generate Invoices
            SubscriptionInvoice::firstOrCreate(
                ['invoice_number' => 'INV-2026-000' . ($company->id)],
                [
                    'company_id'      => $company->id,
                    'subscription_id' => $subscription->id,
                    'amount'          => $plan->price_yearly,
                    'currency'        => 'USD',
                    'status'          => 'paid',
                    'billing_cycle'   => 'yearly',
                    'payment_method'  => 'khqr',
                    'transaction_id'  => 'TXN-KHQR-' . rand(100000, 999999),
                    'paid_at'         => $startDate,
                    'due_date'        => $startDate,
                    'notes'           => 'Paid via Bakong KHQR',
                ]
            );
        }
    }
}
