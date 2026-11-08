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
            if (!Schema::hasColumn('users', 'gender')) {
                $table->string('gender')->nullable()->after('avatar');
            }
            if (!Schema::hasColumn('users', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable()->after('date_of_birth');
            }
            if (!Schema::hasColumn('users', 'country')) {
                $table->string('country')->nullable()->after('address');
            }
            if (!Schema::hasColumn('users', 'province')) {
                $table->string('province')->nullable()->after('country');
            }
            if (!Schema::hasColumn('users', 'city')) {
                $table->string('city')->nullable()->after('province');
            }
            if (!Schema::hasColumn('users', 'timezone')) {
                $table->string('timezone')->default('UTC')->after('city');
            }
            if (!Schema::hasColumn('users', 'language')) {
                $table->string('language', 10)->default('en')->after('timezone');
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
                'gender',
                'date_of_birth',
                'address',
                'country',
                'province',
                'city',
                'timezone',
                'language'
            ]);
        });
    }
};
