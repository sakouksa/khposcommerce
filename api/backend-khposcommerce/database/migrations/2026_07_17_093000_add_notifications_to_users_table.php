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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'email_notify')) {
                $table->boolean('email_notify')->default(true)->after('language');
            }
            if (!Schema::hasColumn('users', 'push_notify')) {
                $table->boolean('push_notify')->default(true)->after('email_notify');
            }
            if (!Schema::hasColumn('users', 'sms_notify')) {
                $table->boolean('sms_notify')->default(false)->after('push_notify');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_notify',
                'push_notify',
                'sms_notify'
            ]);
        });
    }
};
