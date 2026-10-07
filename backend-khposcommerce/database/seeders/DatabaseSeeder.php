<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesPermissionsSeeder::class,
            CompanySeeder::class,
            SettingsSeeder::class,
            UsersSeeder::class,
            EmployeeSeeder::class,
            HolidaySeeder::class,
            ProductCatalogSeeder::class,
            CustomerSeeder::class,
            SupplierSeeder::class,
            InventorySeeder::class,
            PurchaseSeeder::class,
            SaleSeeder::class,
            CMSSeeder::class,
            PromotionSeeder::class,
            LogSeeder::class,
            NotificationSeeder::class,
            ReturnPolicySeeder::class,
            OrderReturnSeeder::class,
        ]);
    }
}

