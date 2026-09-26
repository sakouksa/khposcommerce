<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('login_histories', function (Blueprint $table) {
            if (!Schema::hasColumn('login_histories', 'country')) {
                $table->string('country')->nullable()->after('platform');
            }
            if (!Schema::hasColumn('login_histories', 'os')) {
                $table->string('os')->nullable()->after('country');
            }
        });
    }

    public function down(): void
    {
        Schema::table('login_histories', function (Blueprint $table) {
            $table->dropColumn(['country', 'os']);
        });
    }
};
