<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── SHIFTS ─────────────────────────────────────────────────────────
        if (!Schema::hasTable('shifts')) {
            Schema::create('shifts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->cascadeOnDelete();
                $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
                $table->string('name'); // e.g. Morning, Afternoon, Night, Flexible
                $table->time('start_time')->default('08:00:00');
                $table->time('end_time')->default('17:00:00');
                $table->integer('break_minutes')->default(60);
                $table->integer('late_grace_minutes')->default(10);
                $table->time('max_check_in_time')->nullable(); // Cut-off time for check in
                $table->time('min_check_out_time')->nullable(); // Earliest allowed check out
                $table->integer('max_overtime_minutes')->default(240); // Max overtime per day
                $table->json('working_days')->nullable(); // ["Mon", "Tue", "Wed", "Thu", "Fri"]
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->softDeletes();

                $table->index(['company_id', 'branch_id']);
            });
        }

        // ─── ATTENDANCE TABLE EXPANSION ─────────────────────────────────────
        Schema::table('attendance', function (Blueprint $table) {
            if (!Schema::hasColumn('attendance', 'company_id')) {
                $table->foreignId('company_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            }
            if (!Schema::hasColumn('attendance', 'branch_id')) {
                $table->foreignId('branch_id')->nullable()->after('company_id')->constrained()->cascadeOnDelete();
            }
            if (!Schema::hasColumn('attendance', 'department_id')) {
                $table->foreignId('department_id')->nullable()->after('employee_id')->constrained()->nullOnDelete();
            }
            if (!Schema::hasColumn('attendance', 'position_id')) {
                $table->foreignId('position_id')->nullable()->after('department_id')->constrained()->nullOnDelete();
            }
            if (!Schema::hasColumn('attendance', 'attendance_date')) {
                $table->date('attendance_date')->nullable()->after('position_id');
            }
            if (!Schema::hasColumn('attendance', 'shift_id')) {
                $table->foreignId('shift_id')->nullable()->after('attendance_date')->constrained()->nullOnDelete();
            }
            if (!Schema::hasColumn('attendance', 'scheduled_check_in')) {
                $table->timestamp('scheduled_check_in')->nullable()->after('check_out');
            }
            if (!Schema::hasColumn('attendance', 'scheduled_check_out')) {
                $table->timestamp('scheduled_check_out')->nullable()->after('scheduled_check_in');
            }
            if (!Schema::hasColumn('attendance', 'late_minutes')) {
                $table->integer('late_minutes')->default(0)->after('scheduled_check_out');
            }
            if (!Schema::hasColumn('attendance', 'early_leave_minutes')) {
                $table->integer('early_leave_minutes')->default(0)->after('late_minutes');
            }
            if (!Schema::hasColumn('attendance', 'worked_minutes')) {
                $table->integer('worked_minutes')->default(0)->after('early_leave_minutes');
            }
            if (!Schema::hasColumn('attendance', 'break_minutes')) {
                $table->integer('break_minutes')->default(60)->after('worked_minutes');
            }
            if (!Schema::hasColumn('attendance', 'overtime_minutes')) {
                $table->integer('overtime_minutes')->default(0)->after('break_minutes');
            }
            if (!Schema::hasColumn('attendance', 'attendance_type')) {
                $table->enum('attendance_type', ['regular', 'overtime', 'remote', 'field'])->default('regular')->after('status');
            }
            if (!Schema::hasColumn('attendance', 'device_id')) {
                $table->string('device_id')->nullable()->after('attendance_type');
            }
            if (!Schema::hasColumn('attendance', 'device_name')) {
                $table->string('device_name')->nullable()->after('device_id');
            }
            if (!Schema::hasColumn('attendance', 'device_platform')) {
                $table->enum('device_platform', ['android', 'ios', 'web'])->default('android')->after('device_name');
            }
            if (!Schema::hasColumn('attendance', 'device_ip')) {
                $table->string('device_ip')->nullable()->after('device_platform');
            }
            if (!Schema::hasColumn('attendance', 'gps_latitude')) {
                $table->decimal('gps_latitude', 10, 8)->nullable()->after('device_ip');
            }
            if (!Schema::hasColumn('attendance', 'gps_longitude')) {
                $table->decimal('gps_longitude', 11, 8)->nullable()->after('gps_latitude');
            }
            if (!Schema::hasColumn('attendance', 'qr_token')) {
                $table->text('qr_token')->nullable()->after('gps_longitude');
            }
            if (!Schema::hasColumn('attendance', 'qr_expired_at')) {
                $table->timestamp('qr_expired_at')->nullable()->after('qr_token');
            }
            if (!Schema::hasColumn('attendance', 'check_in_method')) {
                $table->enum('check_in_method', ['qr_scan', 'gps', 'manual', 'face_id'])->default('qr_scan')->after('qr_expired_at');
            }
            if (!Schema::hasColumn('attendance', 'check_out_method')) {
                $table->enum('check_out_method', ['qr_scan', 'gps', 'manual', 'face_id'])->default('qr_scan')->after('check_in_method');
            }
            if (!Schema::hasColumn('attendance', 'is_manual')) {
                $table->boolean('is_manual')->default(false)->after('check_out_method');
            }
            if (!Schema::hasColumn('attendance', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->after('is_manual')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('attendance', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (!Schema::hasColumn('attendance', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // Add performance indexes on attendance table
        Schema::table('attendance', function (Blueprint $table) {
            $table->index(['company_id', 'branch_id', 'attendance_date'], 'idx_att_comp_branch_date');
            $table->index(['employee_id', 'attendance_date'], 'idx_att_emp_date');
        });

        // ─── EMPLOYEE DEVICES (Device Lock) ─────────────────────────────────
        if (!Schema::hasTable('employee_devices')) {
            Schema::create('employee_devices', function (Blueprint $table) {
                $table->id();
                $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
                $table->string('device_id');
                $table->string('device_name')->nullable();
                $table->enum('device_platform', ['android', 'ios', 'web'])->default('android');
                $table->string('device_ip')->nullable();
                $table->boolean('is_locked')->default(true);
                $table->timestamp('last_used_at')->nullable();
                $table->timestamps();

                $table->unique(['employee_id', 'device_id']);
                $table->index('device_id');
            });
        }

        // ─── ATTENDANCE QR SESSIONS (Dynamic Kiosk QR) ───────────────────────
        if (!Schema::hasTable('attendance_qr_sessions')) {
            Schema::create('attendance_qr_sessions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->cascadeOnDelete();
                $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
                $table->foreignId('shift_id')->nullable()->constrained()->nullOnDelete();
                $table->text('qr_token');
                $table->uuid('random_uuid');
                $table->string('secret_signature');
                $table->timestamp('qr_expired_at');
                $table->integer('interval_seconds')->default(30); // 30 or 60
                $table->timestamps();

                $table->index(['company_id', 'branch_id', 'qr_expired_at']);
            });
        }

        // ─── PAYROLL TABLE EXPANSION ────────────────────────────────────────
        Schema::table('payrolls', function (Blueprint $table) {
            if (!Schema::hasColumn('payrolls', 'late_count')) {
                $table->integer('late_count')->default(0)->after('present_days');
            }
            if (!Schema::hasColumn('payrolls', 'absent_count')) {
                $table->integer('absent_count')->default(0)->after('late_count');
            }
            if (!Schema::hasColumn('payrolls', 'leave_count')) {
                $table->integer('leave_count')->default(0)->after('absent_count');
            }
            if (!Schema::hasColumn('payrolls', 'holiday_count')) {
                $table->integer('holiday_count')->default(0)->after('leave_count');
            }
            if (!Schema::hasColumn('payrolls', 'worked_hours')) {
                $table->decimal('worked_hours', 8, 2)->default(0)->after('holiday_count');
            }
            if (!Schema::hasColumn('payrolls', 'overtime_hours')) {
                $table->decimal('overtime_hours', 8, 2)->default(0)->after('worked_hours');
            }
            if (!Schema::hasColumn('payrolls', 'late_deduction')) {
                $table->decimal('late_deduction', 15, 2)->default(0)->after('deductions');
            }
            if (!Schema::hasColumn('payrolls', 'early_leave_deduction')) {
                $table->decimal('early_leave_deduction', 15, 2)->default(0)->after('late_deduction');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_qr_sessions');
        Schema::dropIfExists('employee_devices');
        Schema::dropIfExists('shifts');
    }
};
