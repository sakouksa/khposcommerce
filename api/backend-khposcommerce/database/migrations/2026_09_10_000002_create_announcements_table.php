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
        if (!Schema::hasTable('announcements')) {
            Schema::create('announcements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
                $table->string('title')->nullable();
                $table->text('message_km');
                $table->text('message_en')->nullable();
                $table->string('badge_text')->default('SPECIAL PROMO');
                $table->string('coupon_code')->nullable();
                $table->string('link_url')->default('/promotions');
                $table->string('bg_gradient')->default('from-indigo-600 to-purple-700');
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('ends_at')->nullable();
                $table->timestamps();

                $table->index(['company_id', 'is_active', 'sort_order']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
