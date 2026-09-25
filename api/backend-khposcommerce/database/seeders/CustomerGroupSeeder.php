<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer\CustomerGroup;
use App\Models\Company\Company;

class CustomerGroupSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();

        CustomerGroup::firstOrCreate(['company_id' => $company->id, 'name' => 'General'], ['description' => 'Regular Retail Customers', 'discount_percent' => 0.0000, 'is_active' => true]);
        CustomerGroup::firstOrCreate(['company_id' => $company->id, 'name' => 'VIP'], ['description' => 'Loyal VIP Customers', 'discount_percent' => 10.0000, 'is_active' => true]);
        CustomerGroup::firstOrCreate(['company_id' => $company->id, 'name' => 'Wholesale'], ['description' => 'Bulk buying customers', 'discount_percent' => 15.0000, 'is_active' => true]);
    }
}
