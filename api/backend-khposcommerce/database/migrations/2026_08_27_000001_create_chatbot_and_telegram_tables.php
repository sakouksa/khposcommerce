<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── CHAT SESSIONS ───────────────────────────────────────────────────
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('channel')->default('web'); // web, telegram, mobile
            $table->string('session_token')->index(); // unique token for session
            $table->string('title')->nullable();
            $table->string('status')->default('active'); // active, closed, escalated
            $table->json('metadata')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->index(['channel', 'session_token']);
            $table->index(['customer_id', 'status']);
        });

        // ─── CHAT MESSAGES ───────────────────────────────────────────────────
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_session_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['user', 'assistant', 'system', 'tool'])->default('user');
            $table->text('content')->nullable();
            $table->string('tool_name')->nullable();
            $table->string('tool_call_id')->nullable();
            $table->json('tool_arguments')->nullable();
            $table->json('metadata')->nullable(); // structured UI cards: products, orders, quick_replies
            $table->timestamps();

            $table->index(['chat_session_id', 'created_at']);
        });

        // ─── TELEGRAM USERS ──────────────────────────────────────────────────
        Schema::create('telegram_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->bigInteger('telegram_id')->unique();
            $table->string('username')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('link_code')->nullable()->index();
            $table->timestamp('link_code_expires_at')->nullable();
            $table->timestamp('linked_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'is_active']);
        });

        // ─── CHAT SUPPORT REQUESTS ───────────────────────────────────────────
        Schema::create('chat_support_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_session_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('channel')->default('web'); // web, telegram
            $table->string('customer_name')->nullable();
            $table->string('customer_contact')->nullable();
            $table->string('subject')->nullable();
            $table->text('message');
            $table->enum('status', ['pending', 'in_progress', 'resolved', 'cancelled'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_support_requests');
        Schema::dropIfExists('telegram_users');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_sessions');
    }
};
