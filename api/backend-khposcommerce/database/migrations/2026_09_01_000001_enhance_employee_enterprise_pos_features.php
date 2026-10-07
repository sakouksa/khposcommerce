<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── 1. ENHANCE EMPLOYEES TABLE ─────────────────────────────────────
        Schema::table('employees', function (Blueprint $table) {
            // POS & Security
            if (!Schema::hasColumn('employees', 'pos_pin')) {
                $table->string('pos_pin', 6)->nullable()->after('basic_salary');
            }
            if (!Schema::hasColumn('employees', 'card_uid')) {
                $table->string('card_uid', 100)->nullable()->after('pos_pin');
            }
            if (!Schema::hasColumn('employees', 'sales_commission_rate')) {
                $table->decimal('sales_commission_rate', 5, 2)->default(0.00)->after('card_uid');
            }
            if (!Schema::hasColumn('employees', 'is_pos_supervisor')) {
                $table->boolean('is_pos_supervisor')->default(false)->after('sales_commission_rate');
            }
            if (!Schema::hasColumn('employees', 'can_override_discount')) {
                $table->boolean('can_override_discount')->default(false)->after('is_pos_supervisor');
            }
            if (!Schema::hasColumn('employees', 'can_void_sale')) {
                $table->boolean('can_void_sale')->default(false)->after('can_override_discount');
            }

            // E-Commerce & Driver / Logistics
            if (!Schema::hasColumn('employees', 'is_driver')) {
                $table->boolean('is_driver')->default(false)->after('can_void_sale');
            }
            if (!Schema::hasColumn('employees', 'driver_license_no')) {
                $table->string('driver_license_no', 100)->nullable()->after('is_driver');
            }
            if (!Schema::hasColumn('employees', 'vehicle_plate_no')) {
                $table->string('vehicle_plate_no', 50)->nullable()->after('driver_license_no');
            }
            if (!Schema::hasColumn('employees', 'driver_status')) {
                $table->string('driver_status', 30)->default('available')->after('vehicle_plate_no');
            }
            if (!Schema::hasColumn('employees', 'is_fulfillment_picker')) {
                $table->boolean('is_fulfillment_picker')->default(false)->after('driver_status');
            }

            // Hierarchy & Cambodia Compliance
            if (!Schema::hasColumn('employees', 'reporting_to_id')) {
                $table->foreignId('reporting_to_id')->nullable()->after('position_id')->constrained('employees')->nullOnDelete();
            }
            if (!Schema::hasColumn('employees', 'contract_type')) {
                $table->string('contract_type', 30)->default('udc')->after('resign_date'); // probation, fdc, udc
            }
            if (!Schema::hasColumn('employees', 'contract_end_date')) {
                $table->date('contract_end_date')->nullable()->after('contract_type');
            }
            if (!Schema::hasColumn('employees', 'bank_name')) {
                $table->string('bank_name', 100)->nullable()->default('ABA Bank')->after('contract_end_date');
            }
            if (!Schema::hasColumn('employees', 'bank_account_number')) {
                $table->string('bank_account_number', 100)->nullable()->after('bank_name');
            }
            if (!Schema::hasColumn('employees', 'bank_account_holder')) {
                $table->string('bank_account_holder', 150)->nullable()->after('bank_account_number');
            }
            if (!Schema::hasColumn('employees', 'nssf_number')) {
                $table->string('nssf_number', 100)->nullable()->after('bank_account_holder');
            }
            if (!Schema::hasColumn('employees', 'has_nssf')) {
                $table->boolean('has_nssf')->default(true)->after('nssf_number');
            }
            if (!Schema::hasColumn('employees', 'dependents_count')) {
                $table->integer('dependents_count')->default(0)->after('has_nssf');
            }
        });

        // ─── 2. CREATE LEAVE REQUESTS TABLE ─────────────────────────────────
        if (!Schema::hasTable('leave_requests')) {
            Schema::create('leave_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->cascadeOnDelete();
                $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
                $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
                $table->string('leave_type', 30)->default('annual'); // annual, sick, maternity, special, unpaid
                $table->date('start_date');
                $table->date('end_date');
                $table->decimal('total_days', 4, 1)->default(1.0);
                $table->text('reason')->nullable();
                $table->string('status', 30)->default('pending'); // pending, approved, rejected, cancelled
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->dateTime('approved_at')->nullable();
                $table->text('manager_notes')->nullable();
                $table->json('attachments')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['employee_id', 'status']);
                $table->index(['company_id', 'branch_id']);
                $table->index(['start_date', 'end_date']);
            });
        }

        // ─── 3. CREATE LEAVE BALANCES TABLE ─────────────────────────────────
        if (!Schema::hasTable('leave_balances')) {
            Schema::create('leave_balances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->cascadeOnDelete();
                $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
                $table->integer('year');
                $table->decimal('annual_leave_total', 4, 1)->default(18.0);
                $table->decimal('annual_leave_used', 4, 1)->default(0.0);
                $table->decimal('sick_leave_total', 4, 1)->default(15.0);
                $table->decimal('sick_leave_used', 4, 1)->default(0.0);
                $table->decimal('special_leave_total', 4, 1)->default(7.0);
                $table->decimal('special_leave_used', 4, 1)->default(0.0);
                $table->decimal('maternity_leave_total', 4, 1)->default(90.0);
                $table->decimal('maternity_leave_used', 4, 1)->default(0.0);
                $table->timestamps();

                $table->unique(['employee_id', 'year']);
            });
        }

        // ─── 4. ENHANCE PAYROLLS TABLE ──────────────────────────────────────
        Schema::table('payrolls', function (Blueprint $table) {
            if (!Schema::hasColumn('payrolls', 'sales_commission')) {
                $table->decimal('sales_commission', 15, 2)->default(0)->after('overtime_pay');
            }
            if (!Schema::hasColumn('payrolls', 'nssf_deduction')) {
                $table->decimal('nssf_deduction', 15, 2)->default(0)->after('deductions');
            }
            if (!Schema::hasColumn('payrolls', 'tax_deduction')) {
                $table->decimal('tax_deduction', 15, 2)->default(0)->after('nssf_deduction');
            }
            if (!Schema::hasColumn('payrolls', 'seniority_pay')) {
                $table->decimal('seniority_pay', 15, 2)->default(0)->after('sales_commission');
            }
            if (!Schema::hasColumn('payrolls', 'payment_method')) {
                $table->string('payment_method', 30)->default('bank_transfer')->after('status');
            }
            if (!Schema::hasColumn('payrolls', 'bank_account_snapshot')) {
                $table->string('bank_account_snapshot', 255)->nullable()->after('payment_method');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payrolls', function (Blueprint $table) {
            $table->dropColumn([
                'sales_commission',
                'nssf_deduction',
                'tax_deduction',
                'seniority_pay',
                'payment_method',
                'bank_account_snapshot',
            ]);
        });

        Schema::dropIfExists('leave_balances');
        Schema::dropIfExists('leave_requests');

        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['reporting_to_id']);
            $table->dropColumn([
                'pos_pin',
                'card_uid',
                'sales_commission_rate',
                'is_pos_supervisor',
                'can_override_discount',
                'can_void_sale',
                'is_driver',
                'driver_license_no',
                'vehicle_plate_no',
                'driver_status',
                'is_fulfillment_picker',
                'reporting_to_id',
                'contract_type',
                'contract_end_date',
                'bank_name',
                'bank_account_number',
                'bank_account_holder',
                'nssf_number',
                'has_nssf',
                'dependents_count',
            ]);
        });
    }
};
