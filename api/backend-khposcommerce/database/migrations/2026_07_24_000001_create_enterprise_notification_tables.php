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
        // Drop stub notification_logs if created previously by old migration
        Schema::dropIfExists('notification_logs');

        // 1. notifications table
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('company_id')->nullable()->index();
                $table->unsignedBigInteger('branch_id')->nullable()->index();
                $table->string('type', 50)->default('system')->index();
                $table->string('title');
                $table->text('message');
                $table->string('icon', 100)->nullable();
                $table->string('color', 50)->nullable();
                $table->string('priority', 20)->default('normal')->index(); // low, normal, high, critical
                $table->string('image')->nullable();
                $table->string('action_url')->nullable();
                $table->string('reference_type', 100)->nullable()->index();
                $table->string('reference_id', 100)->nullable()->index();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->boolean('is_global')->default(false);
                $table->string('status', 30)->default('sent')->index(); // pending, sent, failed, cancelled
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                $table->foreign('branch_id')->references('id')->on('branches')->onDelete('set null');
                $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            });
        }

        // 2. notification_users table
        if (!Schema::hasTable('notification_users')) {
            Schema::create('notification_users', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('notification_id')->index();
                $table->unsignedBigInteger('user_id')->index();
                $table->boolean('is_read')->default(false);
                $table->timestamp('read_at')->nullable();
                $table->boolean('is_archived')->default(false);
                $table->timestamps();

                $table->foreign('notification_id')->references('id')->on('notifications')->onDelete('cascade');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

                $table->unique(['notification_id', 'user_id']);
            });
        }

        // 3. notification_templates table
        if (!Schema::hasTable('notification_templates')) {
            Schema::create('notification_templates', function (Blueprint $table) {
                $table->id();
                $table->string('code', 100)->unique()->index();
                $table->string('name');
                $table->string('title_template');
                $table->text('message_template');
                $table->string('icon', 100)->nullable();
                $table->string('color', 50)->nullable();
                $table->string('type', 50)->default('system')->index();
                $table->string('priority', 20)->default('normal');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 4. notification_logs table (enterprise master schema)
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('notification_id')->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('channel', 50)->default('database')->index(); // database, email, telegram, sms, push, websocket
            $table->string('status', 30)->default('pending'); // pending, sent, failed, cancelled
            $table->text('response')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->foreign('notification_id')->references('id')->on('notifications')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_templates');
        Schema::dropIfExists('notification_users');
        Schema::dropIfExists('notifications');
    }
};
