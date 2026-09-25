<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Enhance jwt_refresh_tokens table with device telemetry
        Schema::table('jwt_refresh_tokens', function (Blueprint $table) {
            if (!Schema::hasColumn('jwt_refresh_tokens', 'device_id')) {
                $table->string('device_id', 100)->nullable()->after('user_id')->index();
            }
            if (!Schema::hasColumn('jwt_refresh_tokens', 'device_name')) {
                $table->string('device_name', 150)->nullable()->after('device_id');
            }
            if (!Schema::hasColumn('jwt_refresh_tokens', 'device_type')) {
                $table->string('device_type', 50)->default('web')->after('device_name'); // web, android, ios, desktop, tablet
            }
            if (!Schema::hasColumn('jwt_refresh_tokens', 'platform')) {
                $table->string('platform', 100)->nullable()->after('os'); // macOS, Windows, Linux, Android, iOS
            }
            if (!Schema::hasColumn('jwt_refresh_tokens', 'app_version')) {
                $table->string('app_version', 50)->nullable()->after('browser');
            }
            if (!Schema::hasColumn('jwt_refresh_tokens', 'last_active_at')) {
                $table->timestamp('last_active_at')->nullable()->after('expires_at');
            }
            if (!Schema::hasColumn('jwt_refresh_tokens', 'status')) {
                $table->enum('status', ['active', 'revoked', 'expired', 'suspicious'])->default('active')->after('revoked');
            }
            if (!Schema::hasColumn('jwt_refresh_tokens', 'revoked_at')) {
                $table->timestamp('revoked_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('jwt_refresh_tokens', 'revoked_by')) {
                $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete()->after('revoked_at');
            }
        });

        // 2. Add manager_pin to users table for quick manager POS overrides
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'manager_pin')) {
                $table->string('manager_pin', 255)->nullable()->after('password');
            }
        });

        // 3. Create enterprise security settings table if not present
        if (!Schema::hasTable('security_settings')) {
            Schema::create('security_settings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
                $table->string('key')->unique();
                $table->json('value')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('security_settings');

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'manager_pin')) {
                $table->dropColumn('manager_pin');
            }
        });

        Schema::table('jwt_refresh_tokens', function (Blueprint $table) {
            $table->dropColumn([
                'device_id',
                'device_name',
                'device_type',
                'platform',
                'app_version',
                'last_active_at',
                'status',
                'revoked_at',
                'revoked_by',
            ]);
        });
    }
};
