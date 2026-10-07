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
        Schema::table('banners', function (Blueprint $table) {
            $table->string('badge')->nullable()->after('subtitle');
            $table->string('discount_tag')->nullable()->after('badge');
            $table->string('button_text')->nullable()->after('discount_tag');
            $table->string('theme_gradient')->nullable()->after('button_text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['badge', 'discount_tag', 'button_text', 'theme_gradient']);
        });
    }
};
