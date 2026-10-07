<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\Notification\NotificationTemplate;
use App\Models\Notification\Notification;
use App\Models\Notification\NotificationUser;
use App\Models\User;
use Carbon\Carbon;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Permissions
        $permissions = [
            'notification.view',
            'notification.create',
            'notification.update',
            'notification.delete',
            'notification.send',
            'notification.read',
            'notification.archive',
            'notification.template.view',
            'notification.template.create',
            'notification.template.update',
            'notification.template.delete',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'api']);
        }

        // Give Super Admin role all permissions
        $superAdmin = Role::where('name', 'super_admin')->where('guard_name', 'api')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo($permissions);
        }

        // 2. Seed Notification Templates
        $saasCodes = [
            'SYSTEM_MAINTENANCE', 'NEW_FEATURE_RELEASE', 'PRICING_POLICY_UPDATE', 'URGENT_SECURITY_BULLETIN',
            'NEW_TENANT_REGISTERED', 'PLAN_UPGRADE_REQUEST', 'TENANT_STORAGE_WARNING', 'TENANT_ACCOUNT_SUSPENDED',
            'SAAS_PAYMENT_RECEIVED', 'SUBSCRIPTION_EXPIRING_SOON', 'SUBSCRIPTION_OVERDUE', 'PLAN_RENEWAL_CONFIRMATION',
            'CLOUD_BACKUP_COMPLETED', 'SERVER_HIGH_LOAD', 'DATABASE_REPLICATION_ALERT',
            'FAILED_ADMIN_LOGIN', 'ADMIN_ROLE_MODIFIED', 'API_KEY_ROTATED',
        ];
        NotificationTemplate::whereNotIn('code', $saasCodes)->delete();

        $templates = [
            // ─── A. BROADCAST ANNOUNCEMENTS (To Tenants/Shops) ─────────────
            [
                'code' => 'SYSTEM_MAINTENANCE',
                'name' => 'System Maintenance Broadcast',
                'title_template' => '📢 Scheduled Platform Maintenance Notice',
                'message_template' => 'KHPosCommerce Core will undergo scheduled maintenance on {maintenance_date} from {start_time} to {end_time}. Service may experience brief downtime.',
                'icon' => 'radio',
                'color' => '#6366f1',
                'type' => 'broadcast',
                'priority' => 'high',
            ],
            [
                'code' => 'NEW_FEATURE_RELEASE',
                'name' => 'New Feature Release',
                'title_template' => '🚀 New Platform Feature: {feature_name}',
                'message_template' => 'We have rolled out {feature_name} (v{version}) across all tenant shops. Check documentation for setup instructions.',
                'icon' => 'sparkles',
                'color' => '#3b82f6',
                'type' => 'broadcast',
                'priority' => 'normal',
            ],
            [
                'code' => 'PRICING_POLICY_UPDATE',
                'name' => 'Pricing & Policy Notice',
                'title_template' => '💡 Platform Subscription & Policy Update',
                'message_template' => 'Updated terms for annual subscription plans and transaction processing fees effective {effective_date}.',
                'icon' => 'tag',
                'color' => '#f59e0b',
                'type' => 'broadcast',
                'priority' => 'normal',
            ],
            [
                'code' => 'URGENT_SECURITY_BULLETIN',
                'name' => 'Urgent Security Bulletin',
                'title_template' => '⚠️ Urgent Platform Security Notice',
                'message_template' => 'Critical security patch deployed. Please ensure all store administrators re-authenticate their active sessions.',
                'icon' => 'alert-triangle',
                'color' => '#ef4444',
                'type' => 'broadcast',
                'priority' => 'critical',
            ],

            // ─── B. SHOPS & TENANTS ALERTS ──────────────────────────────────
            [
                'code' => 'NEW_TENANT_REGISTERED',
                'name' => 'New Tenant Registration',
                'title_template' => '🏢 New Shop Onboarded: {company_name}',
                'message_template' => "Tenant '{company_name}' registered with Starter Plan ({trial_days}-day trial). Owner: {owner_email}.",
                'icon' => 'building',
                'color' => '#8b5cf6',
                'type' => 'shops',
                'priority' => 'normal',
            ],
            [
                'code' => 'PLAN_UPGRADE_REQUEST',
                'name' => 'Plan Upgrade Requested',
                'title_template' => '⭐ Plan Upgrade Request: {company_name}',
                'message_template' => "Shop '{company_name}' submitted request to upgrade from {current_plan} to {requested_plan} ({branches_count} branches).",
                'icon' => 'trending-up',
                'color' => '#3b82f6',
                'type' => 'shops',
                'priority' => 'high',
            ],
            [
                'code' => 'TENANT_STORAGE_WARNING',
                'name' => 'Tenant Storage Threshold Warning',
                'title_template' => '💾 Storage Limit Warning: {company_name}',
                'message_template' => "Tenant '{company_name}' has reached {usage_percent}% of allocated cloud storage quota.",
                'icon' => 'hard-drive',
                'color' => '#f59e0b',
                'type' => 'shops',
                'priority' => 'high',
            ],
            [
                'code' => 'TENANT_ACCOUNT_SUSPENDED',
                'name' => 'Tenant Account Suspended',
                'title_template' => '🚫 Account Suspended: {company_name}',
                'message_template' => "Tenant '{company_name}' access has been suspended due to: {suspension_reason}.",
                'icon' => 'ban',
                'color' => '#ef4444',
                'type' => 'shops',
                'priority' => 'critical',
            ],

            // ─── C. SAAS BILLING & SUBSCRIPTIONS ────────────────────────────
            [
                'code' => 'SAAS_PAYMENT_RECEIVED',
                'name' => 'SaaS Subscription Payment Received',
                'title_template' => '💳 Payment Received via {gateway}: {amount}',
                'message_template' => "Received subscription payment of {amount} from '{company_name}' for invoice #{invoice_code}.",
                'icon' => 'credit-card',
                'color' => '#10b981',
                'type' => 'billing',
                'priority' => 'normal',
            ],
            [
                'code' => 'SUBSCRIPTION_EXPIRING_SOON',
                'name' => 'Subscription Expiring Notice',
                'title_template' => '⏳ Subscription Expiring in {days_left} Days',
                'message_template' => "Plan for '{company_name}' will expire on {expiry_date}. Automated Bakong KHQR renewal invoice sent.",
                'icon' => 'clock',
                'color' => '#f59e0b',
                'type' => 'billing',
                'priority' => 'high',
            ],
            [
                'code' => 'SUBSCRIPTION_OVERDUE',
                'name' => 'Subscription Overdue Alert',
                'title_template' => '⚠️ Subscription Overdue: {company_name}',
                'message_template' => "Payment for '{company_name}' is {days_overdue} days overdue. Service entering grace period.",
                'icon' => 'alert-circle',
                'color' => '#ef4444',
                'type' => 'billing',
                'priority' => 'high',
            ],
            [
                'code' => 'PLAN_RENEWAL_CONFIRMATION',
                'name' => 'Plan Renewal Confirmed',
                'title_template' => '✅ Plan Renewed: {company_name}',
                'message_template' => "Annual subscription for '{company_name}' successfully renewed until {next_renewal_date}.",
                'icon' => 'check-circle',
                'color' => '#10b981',
                'type' => 'billing',
                'priority' => 'normal',
            ],

            // ─── D. SYSTEM & CLOUD INFRASTRUCTURE ───────────────────────────
            [
                'code' => 'CLOUD_BACKUP_COMPLETED',
                'name' => 'Automated Cloud Backup Complete',
                'title_template' => '🛡️ Cloud Vault Backup Succeeded',
                'message_template' => 'Platform database and encrypted assets snapshot backed up successfully ({backup_size} in {duration_sec}s).',
                'icon' => 'database',
                'color' => '#10b981',
                'type' => 'system',
                'priority' => 'normal',
            ],
            [
                'code' => 'SERVER_HIGH_LOAD',
                'name' => 'Server Resource Alert',
                'title_template' => '⚡ High Server Resource Usage ({resource_name})',
                'message_template' => "Server node '{node_id}' exceeded {threshold}% {resource_name} load for 10 consecutive minutes.",
                'icon' => 'activity',
                'color' => '#ef4444',
                'type' => 'system',
                'priority' => 'critical',
            ],
            [
                'code' => 'DATABASE_REPLICATION_ALERT',
                'name' => 'Database Replication Sync Alert',
                'title_template' => '🔄 Database Replication Lag Alert',
                'message_template' => 'Replica database lag exceeded {lag_seconds}s on cluster node {cluster_node}.',
                'icon' => 'refresh-cw',
                'color' => '#f59e0b',
                'type' => 'system',
                'priority' => 'high',
            ],

            // ─── E. PLATFORM SECURITY & ACCESS ──────────────────────────────
            [
                'code' => 'FAILED_ADMIN_LOGIN',
                'name' => 'Failed Super Admin Login Attempt',
                'title_template' => '🚨 Security Alert: Failed Admin Logins',
                'message_template' => 'Multiple failed super admin login attempts ({attempts_count}) detected from IP {ip_address}.',
                'icon' => 'shield-alert',
                'color' => '#ef4444',
                'type' => 'security',
                'priority' => 'critical',
            ],
            [
                'code' => 'ADMIN_ROLE_MODIFIED',
                'name' => 'Super Admin Role / Permission Changed',
                'title_template' => '🔐 Admin Role Changed: {user_name}',
                'message_template' => "Administrative role for '{user_name}' updated to '{role_name}' by {modifier_name}.",
                'icon' => 'shield',
                'color' => '#8b5cf6',
                'type' => 'security',
                'priority' => 'high',
            ],
            [
                'code' => 'API_KEY_ROTATED',
                'name' => 'Platform API Key / Secret Rotated',
                'title_template' => '🔑 Master API Secret Rotated',
                'message_template' => 'Platform API gateway secret credentials rotated successfully by {admin_name}.',
                'icon' => 'key',
                'color' => '#3b82f6',
                'type' => 'security',
                'priority' => 'normal',
            ],
        ];

        foreach ($templates as $tmpl) {
            NotificationTemplate::updateOrCreate(
                ['code' => $tmpl['code']],
                $tmpl
            );
        }

        // 3. Seed Sample Initial Notifications (Platform Broadcast & SaaS Alerts)
        $admin = User::first();
        if ($admin) {
            // Remove previous retail store sample notifications if any
            Notification::whereIn('title', [
                'Low Stock Alert (Branch A)',
                'PO Shipment Received (Branch A)',
                'New POS Sale Completed (Branch A)',
                'New POS Sale Completed (Branch B)',
                'Stock Transfer Received (Branch C)',
                'System Backup Completed',
            ])->delete();

            $samples = [
                [
                    'branch_id' => null,
                    'type'      => 'broadcast',
                    'title'     => '📢 ដំណឹងផ្អាកប្រព័ន្ធធ្វើបច្ចុប្បន្នភាព (Scheduled Maintenance)',
                    'message'   => 'ប្រព័ន្ធ KHPosCommerce នឹងផ្អាកដំណើរការរយៈពេល ៣០ នាទី នៅយប់ថ្ងៃអាទិត្យ វេលាម៉ោង ០២:០០ យប់ ដើម្បី Update Database & Performance Server។',
                    'icon'      => 'radio',
                    'color'     => '#6366f1',
                    'priority'  => 'high',
                    'is_global' => true,
                    'status'    => 'sent',
                ],
                [
                    'branch_id' => null,
                    'type'      => 'broadcast',
                    'title'     => '🚀 ដាក់ឱ្យដំណើរការមុខងារថ្មី Bakong KHQR v2 (New Feature Live)',
                    'message'   => 'មុខងារទទួលការទូទាត់ស្វ័យប្រវត្តិតាម Bakong KHQR v2 ត្រូវបានបើកដំណើរការសម្រាប់គ្រប់ហាងទាំងអស់ ចាប់ពីថ្ងៃនេះតទៅ។',
                    'icon'      => 'sparkles',
                    'color'     => '#3b82f6',
                    'priority'  => 'normal',
                    'is_global' => true,
                    'status'    => 'sent',
                ],
                [
                    'branch_id' => null,
                    'type'      => 'shops',
                    'title'     => '🏢 ហាងថ្មីបានចុះឈ្មោះក្នុងប្រព័ន្ធ (New Shop Registered)',
                    'message'   => "ហាង 'Angkor Mart Siem Reap' បានចុះឈ្មោះបង្កើតគណនីថ្មី ជាមួយនឹងកញ្ចប់សាកល្បង Professional 14 ថ្ងៃ។",
                    'icon'      => 'building',
                    'color'     => '#8b5cf6',
                    'priority'  => 'normal',
                    'is_global' => false,
                    'status'    => 'sent',
                ],
                [
                    'branch_id' => null,
                    'type'      => 'shops',
                    'title'     => '⭐ ស្នើសុំ Upgrade ទៅកញ្ចប់ Enterprise (Plan Upgrade Requested)',
                    'message'   => "ក្រុមហ៊ុន 'Lucky Express Co., Ltd' បានផ្ញើសំណើសុំ Upgrade គម្រោងសេវាកម្មទៅ Enterprise Plan (50 Branches)។",
                    'icon'      => 'trending-up',
                    'color'     => '#3b82f6',
                    'priority'  => 'high',
                    'is_global' => false,
                    'status'    => 'sent',
                ],
                [
                    'branch_id' => null,
                    'type'      => 'billing',
                    'title'     => '💳 ទទួលបានការទូទាត់វិក្កយបត្រ SaaS (Payment Received via Bakong)',
                    'message'   => "ទទួលបានការបង់ថ្លៃសេវាប្រចាំឆ្នាំ $360.00 ពីហាង 'Mega Store Phnom Penh' តាមរយៈ Bakong KHQR (Invoice #INV-2026-0891)។",
                    'icon'      => 'credit-card',
                    'color'     => '#10b981',
                    'priority'  => 'normal',
                    'is_global' => false,
                    'status'    => 'sent',
                ],
                [
                    'branch_id' => null,
                    'type'      => 'billing',
                    'title'     => '⚠️ ហាងជិតផុតកំណត់កញ្ចប់សេវា (Subscription Expiring Soon)',
                    'message'   => "កញ្ចប់សេវាកម្មរបស់ហាង 'Phnom Penh Tech Store' នឹងផុតកំណត់ក្នុងរយៈពេល ៣ ថ្ងៃទៀត។ ប្រព័ន្ធបានផ្ញើវិក្កយបត្ររំលឹកដោយស្វ័យប្រវត្តិ។",
                    'icon'      => 'clock',
                    'color'     => '#f59e0b',
                    'priority'  => 'high',
                    'is_global' => false,
                    'status'    => 'sent',
                ],
                [
                    'branch_id' => null,
                    'type'      => 'system',
                    'title'     => '🛡️ ការចម្លងទុកទិន្នន័យប្រព័ន្ធជោគជ័យ (Automated Cloud Backup)',
                    'message'   => 'ប្រព័ន្ធបានធ្វើការ Backup មូលដ្ឋានទិន្នន័យ Platform និងឯកសារទាំងអស់ទៅកាន់ Cloud Encrypted Vault ដោយជោគជ័យ (ទំហំ: 4.2 GB)។',
                    'icon'      => 'database',
                    'color'     => '#10b981',
                    'priority'  => 'normal',
                    'is_global' => true,
                    'status'    => 'sent',
                ],
                [
                    'branch_id' => null,
                    'type'      => 'security',
                    'title'     => '🚨 ការព្យាយាម Login ចូល Super Admin មិនត្រឹមត្រូវ (Failed Admin Login)',
                    'message'   => 'មានការព្យាយាម Login ចូលគណនី Super Admin មិនត្រឹមត្រូវចំនួន ៥ ដង ពីអាសយដ្ឋាន IP 103.216.42.18។ ប្រព័ន្ធបាន Lock IP បណ្តោះអាសន្ន។',
                    'icon'      => 'shield-alert',
                    'color'     => '#ef4444',
                    'priority'  => 'critical',
                    'is_global' => true,
                    'status'    => 'sent',
                ],
            ];

            foreach ($samples as $index => $sample) {
                $notification = Notification::create(array_merge($sample, [
                    'company_id' => $admin->company_id,
                    'created_by' => $admin->id,
                    'created_at' => Carbon::now()->subMinutes(($index + 1) * 15),
                ]));

                NotificationUser::create([
                    'notification_id' => $notification->id,
                    'user_id'         => $admin->id,
                    'is_read'         => $index >= 2,
                    'read_at'         => $index >= 2 ? Carbon::now()->subMinutes(10) : null,
                    'is_archived'     => false,
                ]);
            }
        }

        if (\Illuminate\Support\Facades\DB::getDriverName() === 'pgsql') {
            $tables = ['notification_templates', 'notifications', 'notification_users'];
            foreach ($tables as $table) {
                try {
                    \Illuminate\Support\Facades\DB::statement("SELECT setval('{$table}_id_seq', COALESCE((SELECT MAX(id) FROM {$table}), 0) + 1, false);");
                } catch (\Throwable $e) {}
            }
        }
    }
}
