<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Companies Table: Set Cambodia defaults
        if (Schema::hasTable('companies')) {
            Schema::table('companies', function (Blueprint $table) {
                if (Schema::hasColumn('companies', 'country')) {
                    $table->string('country')->default('KH')->change();
                }
                if (Schema::hasColumn('companies', 'currency_code')) {
                    $table->string('currency_code', 10)->default('USD')->change();
                }
                if (Schema::hasColumn('companies', 'timezone')) {
                    $table->string('timezone')->default('Asia/Phnom_Penh')->change();
                }
                if (Schema::hasColumn('companies', 'language')) {
                    $table->string('language', 10)->default('km')->change();
                }
            });

            // Update any legacy 'ID' / 'IDR' / 'Asia/Jakarta' records to Cambodia defaults
            DB::table('companies')
                ->where('country', 'ID')
                ->orWhere('country', 'id')
                ->update(['country' => 'KH']);

            DB::table('companies')
                ->where('currency_code', 'IDR')
                ->update(['currency_code' => 'USD']);

            DB::table('companies')
                ->where('timezone', 'Asia/Jakarta')
                ->update(['timezone' => 'Asia/Phnom_Penh']);

            DB::table('companies')
                ->where('language', 'id')
                ->update(['language' => 'km']);
        }

        // 2. Customer Addresses Table: Make country default to 'Cambodia' and postal_code nullable
        if (Schema::hasTable('customer_addresses')) {
            Schema::table('customer_addresses', function (Blueprint $table) {
                if (Schema::hasColumn('customer_addresses', 'country')) {
                    $table->string('country')->default('Cambodia')->change();
                }
                if (Schema::hasColumn('customer_addresses', 'postal_code')) {
                    $table->string('postal_code')->nullable()->change();
                }
            });

            DB::table('customer_addresses')
                ->where('country', 'ID')
                ->orWhere('country', 'id')
                ->orWhereNull('country')
                ->update(['country' => 'Cambodia']);
        }

        // 3. Orders Table: Set USD currency default and Cambodia shipping default
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (Schema::hasColumn('orders', 'currency_code')) {
                    $table->string('currency_code', 10)->default('USD')->change();
                }
                if (Schema::hasColumn('orders', 'shipping_country')) {
                    $table->string('shipping_country')->default('Cambodia')->change();
                }
            });

            DB::table('orders')
                ->where('currency_code', 'IDR')
                ->update(['currency_code' => 'USD']);

            DB::table('orders')
                ->where('shipping_country', 'ID')
                ->orWhereNull('shipping_country')
                ->update(['shipping_country' => 'Cambodia']);
        }

        // 4. Carts Table: Set USD currency default
        if (Schema::hasTable('carts')) {
            Schema::table('carts', function (Blueprint $table) {
                if (Schema::hasColumn('carts', 'currency_code')) {
                    $table->string('currency_code', 10)->default('USD')->change();
                }
            });

            DB::table('carts')
                ->where('currency_code', 'IDR')
                ->update(['currency_code' => 'USD']);
        }

        // 5. Sales Table: Set USD currency default
        if (Schema::hasTable('sales')) {
            Schema::table('sales', function (Blueprint $table) {
                if (Schema::hasColumn('sales', 'currency_code')) {
                    $table->string('currency_code', 10)->default('USD')->change();
                }
            });

            DB::table('sales')
                ->where('currency_code', 'IDR')
                ->update(['currency_code' => 'USD']);
        }

        // 6. Purchases Table: Set USD currency default
        if (Schema::hasTable('purchases')) {
            Schema::table('purchases', function (Blueprint $table) {
                if (Schema::hasColumn('purchases', 'currency_code')) {
                    $table->string('currency_code', 10)->default('USD')->change();
                }
            });

            DB::table('purchases')
                ->where('currency_code', 'IDR')
                ->update(['currency_code' => 'USD']);
        }

        // 7. Price Lists Table (if exists): Set USD currency default
        if (Schema::hasTable('price_lists')) {
            Schema::table('price_lists', function (Blueprint $table) {
                if (Schema::hasColumn('price_lists', 'currency_code')) {
                    $table->string('currency_code', 10)->default('USD')->change();
                }
            });
        }
    }

    public function down(): void
    {
        // Revert defaults if ever rolled back
        if (Schema::hasTable('companies')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->string('country')->default('ID')->change();
                $table->string('currency_code', 10)->default('IDR')->change();
                $table->string('timezone')->default('Asia/Jakarta')->change();
                $table->string('language', 10)->default('id')->change();
            });
        }

        if (Schema::hasTable('customer_addresses')) {
            Schema::table('customer_addresses', function (Blueprint $table) {
                $table->string('country')->default('ID')->change();
            });
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('currency_code', 10)->default('IDR')->change();
            });
        }

        if (Schema::hasTable('carts')) {
            Schema::table('carts', function (Blueprint $table) {
                $table->string('currency_code', 10)->default('IDR')->change();
            });
        }

        if (Schema::hasTable('sales')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->string('currency_code', 10)->default('IDR')->change();
            });
        }

        if (Schema::hasTable('purchases')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->string('currency_code', 10)->default('IDR')->change();
            });
        }
    }
};
