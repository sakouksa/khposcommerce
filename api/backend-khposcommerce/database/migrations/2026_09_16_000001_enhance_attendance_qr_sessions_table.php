<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendance_qr_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('attendance_qr_sessions', 'is_standee')) {
                $table->boolean('is_standee')->default(false)->after('interval_seconds');
            }
            if (!Schema::hasColumn('attendance_qr_sessions', 'checkpoint_name')) {
                $table->string('checkpoint_name', 150)->nullable()->after('is_standee');
            }
            if (!Schema::hasColumn('attendance_qr_sessions', 'radius_meters')) {
                $table->integer('radius_meters')->default(50)->nullable()->after('checkpoint_name');
            }
            if (!Schema::hasColumn('attendance_qr_sessions', 'wifi_ssid')) {
                $table->string('wifi_ssid', 100)->nullable()->after('radius_meters');
            }
            if (!Schema::hasColumn('attendance_qr_sessions', 'gps_latitude')) {
                $table->decimal('gps_latitude', 10, 8)->nullable()->after('wifi_ssid');
            }
            if (!Schema::hasColumn('attendance_qr_sessions', 'gps_longitude')) {
                $table->decimal('gps_longitude', 11, 8)->nullable()->after('gps_latitude');
            }
            if (!Schema::hasColumn('attendance_qr_sessions', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('gps_longitude');
            }
            if (!Schema::hasColumn('attendance_qr_sessions', 'revoked_at')) {
                $table->timestamp('revoked_at')->nullable()->after('is_active');
            }

            $table->index(['company_id', 'branch_id', 'is_standee', 'is_active'], 'att_qr_active_standee_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_qr_sessions', function (Blueprint $table) {
            $table->dropIndex('att_qr_active_standee_idx');
            $table->dropColumn([
                'is_standee',
                'checkpoint_name',
                'radius_meters',
                'wifi_ssid',
                'gps_latitude',
                'gps_longitude',
                'is_active',
                'revoked_at',
            ]);
        });
    }
};
