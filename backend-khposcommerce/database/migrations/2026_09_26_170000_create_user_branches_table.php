<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('user_branches')) {
            Schema::create('user_branches', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
                $table->boolean('is_active')->default(true);
                $table->boolean('is_default')->default(false);
                $table->timestamps();

                $table->unique(['user_id', 'branch_id']);
                $table->index(['user_id', 'is_active']);
                $table->index(['branch_id', 'is_active']);
            });

            // Backfill existing user assignments from users.branch_id
            $existingUsers = DB::table('users')
                ->whereNotNull('branch_id')
                ->select('id as user_id', 'branch_id')
                ->get();

            $records = [];
            $now = now();
            foreach ($existingUsers as $u) {
                // Verify branch exists before inserting
                $branchExists = DB::table('branches')->where('id', $u->branch_id)->exists();
                if ($branchExists) {
                    $records[] = [
                        'user_id'    => $u->user_id,
                        'branch_id'  => $u->branch_id,
                        'is_active'  => true,
                        'is_default' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            if (!empty($records)) {
                DB::table('user_branches')->insertOrIgnore($records);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_branches');
    }
};
