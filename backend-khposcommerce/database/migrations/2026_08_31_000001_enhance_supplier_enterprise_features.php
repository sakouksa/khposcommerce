<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            if (!Schema::hasColumn('suppliers', 'supplier_type')) {
                $table->string('supplier_type', 50)->default('distributor')->after('tax_number');
            }
            if (!Schema::hasColumn('suppliers', 'tier')) {
                $table->string('tier', 50)->default('standard')->after('supplier_type');
            }
            if (!Schema::hasColumn('suppliers', 'credit_limit')) {
                $table->decimal('credit_limit', 15, 2)->default(0)->after('tier');
            }
            if (!Schema::hasColumn('suppliers', 'payment_terms')) {
                $table->string('payment_terms', 50)->default('Net 30')->after('credit_limit');
            }
            if (!Schema::hasColumn('suppliers', 'payment_term_days')) {
                $table->integer('payment_term_days')->default(30)->after('payment_terms');
            }
            if (!Schema::hasColumn('suppliers', 'lead_time_days')) {
                $table->integer('lead_time_days')->default(3)->after('payment_term_days');
            }
            if (!Schema::hasColumn('suppliers', 'currency_code')) {
                $table->string('currency_code', 10)->default('USD')->after('lead_time_days');
            }
            if (!Schema::hasColumn('suppliers', 'website')) {
                $table->string('website')->nullable()->after('fax');
            }
            if (!Schema::hasColumn('suppliers', 'hotline')) {
                $table->string('hotline')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('suppliers', 'support_email')) {
                $table->string('support_email')->nullable()->after('email');
            }
            if (!Schema::hasColumn('suppliers', 'swift_code')) {
                $table->string('swift_code', 50)->nullable()->after('bank_account_name');
            }
            if (!Schema::hasColumn('suppliers', 'logo')) {
                $table->string('logo')->nullable()->after('code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $columns = [
                'supplier_type', 'tier', 'credit_limit', 'payment_terms',
                'payment_term_days', 'lead_time_days', 'currency_code',
                'website', 'hotline', 'support_email', 'swift_code', 'logo'
            ];
            foreach ($columns as $col) {
                if (Schema::hasColumn('suppliers', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
