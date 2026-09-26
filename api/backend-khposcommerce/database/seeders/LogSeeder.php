<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Str;

class LogSeeder extends Seeder
{
    public function run(): void
    {
        $userId = User::value('id') ?? 1;

        // 1. Login Histories (300 records)
        $loginHistories = [];
        $devices = ['iPhone', 'Android', 'MacBook', 'Windows Desktop', 'iPad'];
        $browsers = ['Safari', 'Chrome', 'Firefox', 'Edge'];
        $platforms = ['iOS', 'Android', 'macOS', 'Windows', 'iPadOS'];

        for ($i = 1; $i <= 300; $i++) {
            $loginHistories[] = [
                'user_id' => $userId,
                'ip_address' => '192.168.1.' . rand(10, 250),
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/' . rand(100, 120) . '.0.0.0',
                'device' => $devices[$i % 5],
                'browser' => $browsers[$i % 4],
                'platform' => $platforms[$i % 5],
                'success' => rand(1, 10) !== 10, // 90% success rate
                'created_at' => now()->subDays(60 - ($i / 5)),
                'updated_at' => now()->subDays(60 - ($i / 5)),
            ];
        }
        foreach (array_chunk($loginHistories, 100) as $chunk) {
            DB::table('login_histories')->insert($chunk);
        }

        // 2. Audit Logs (300 records)
        $auditLogs = [];
        $events = ['created', 'updated', 'deleted'];
        $models = ['App\Models\Product\Product', 'App\Models\Sales\Sale', 'App\Models\Customer\Customer', 'App\Models\Company\Warehouse'];

        for ($i = 1; $i <= 300; $i++) {
            $auditLogs[] = [
                'user_id' => $userId,
                'event' => $events[$i % 3],
                'auditable_type' => $models[$i % 4],
                'auditable_id' => rand(1, 100),
                'old_values' => json_encode(['status' => 'draft', 'price' => 0.50]),
                'new_values' => json_encode(['status' => 'active', 'price' => 0.75]),
                'url' => 'https://enterprise-pos.com/admin/' . strtolower(explode('\\', $models[$i % 4])[3]),
                'ip_address' => '192.168.1.' . rand(10, 250),
                'user_agent' => 'AuditLogAgent/1.0',
                'created_at' => now()->subDays(60 - ($i / 5)),
                'updated_at' => now()->subDays(60 - ($i / 5)),
            ];
        }
        foreach (array_chunk($auditLogs, 100) as $chunk) {
            DB::table('audit_logs')->insert($chunk);
        }

        // 3. Spatie Activity Logs (300 records)
        $activityLogs = [];
        for ($i = 1; $i <= 300; $i++) {
            $activityLogs[] = [
                'log_name' => 'default',
                'description' => $i % 3 === 0 ? 'Product stock adjusted' : ($i % 3 === 1 ? 'New sale invoiced' : 'User profile settings updated'),
                'subject_type' => $models[$i % 4],
                'subject_id' => rand(1, 100),
                'causer_type' => 'App\Models\User',
                'causer_id' => $userId,
                'properties' => json_encode(['attributes' => ['is_active' => true]]),
                'event' => $events[$i % 3],
                'batch_uuid' => Str::uuid(),
                'created_at' => now()->subDays(60 - ($i / 5)),
                'updated_at' => now()->subDays(60 - ($i / 5)),
            ];
        }
        foreach (array_chunk($activityLogs, 100) as $chunk) {
            DB::table('activity_log')->insert($chunk);
        }
    }
}
