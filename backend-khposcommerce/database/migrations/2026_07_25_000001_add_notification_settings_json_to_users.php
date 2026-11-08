<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'telegram_notify')) {
                $table->boolean('telegram_notify')->default(false)->after('sms_notify');
            }
            if (!Schema::hasColumn('users', 'browser_notify')) {
                $table->boolean('browser_notify')->default(true)->after('telegram_notify');
            }
            if (!Schema::hasColumn('users', 'sound_notify')) {
                $table->boolean('sound_notify')->default(true)->after('browser_notify');
            }
            if (!Schema::hasColumn('users', 'desktop_notify')) {
                $table->boolean('desktop_notify')->default(true)->after('sound_notify');
            }
            if (!Schema::hasColumn('users', 'slack_notify')) {
                $table->boolean('slack_notify')->default(false)->after('desktop_notify');
            }
            if (!Schema::hasColumn('users', 'teams_notify')) {
                $table->boolean('teams_notify')->default(false)->after('slack_notify');
            }
            if (!Schema::hasColumn('users', 'whatsapp_notify')) {
                $table->boolean('whatsapp_notify')->default(false)->after('teams_notify');
            }
            if (!Schema::hasColumn('users', 'default_priority')) {
                $table->string('default_priority', 20)->default('high')->after('whatsapp_notify');
            }
            if (!Schema::hasColumn('users', 'notification_language')) {
                $table->string('notification_language', 10)->default('en')->after('default_priority');
            }
            if (!Schema::hasColumn('users', 'quiet_hours')) {
                $table->json('quiet_hours')->nullable()->after('notification_language');
            }
            if (!Schema::hasColumn('users', 'notification_events')) {
                $table->json('notification_events')->nullable()->after('quiet_hours');
            }
            if (!Schema::hasColumn('users', 'email_preferences')) {
                $table->json('email_preferences')->nullable()->after('notification_events');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [
                'telegram_notify', 'browser_notify', 'sound_notify', 'desktop_notify',
                'slack_notify', 'teams_notify', 'whatsapp_notify', 'default_priority',
                'notification_language', 'quiet_hours', 'notification_events', 'email_preferences',
            ];
            foreach ($columns as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
