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
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Give Super Admin role all permissions
        $superAdmin = Role::where('name', 'Super Admin')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo($permissions);
        }

        // 2. Seed Notification Templates
        $templates = [
            [
                'code' => 'NEW_SALE',
                'name' => 'New Sale Created',
                'title_template' => 'New Sale #{sale_code}',
                'message_template' => 'Sale #{sale_code} completed for {amount}.',
                'icon' => 'shopping-cart',
                'color' => '#3b82f6',
                'type' => 'sales',
                'priority' => 'normal',
            ],
            [
                'code' => 'NEW_PURCHASE',
                'name' => 'New Purchase Order',
                'title_template' => 'New Purchase #{po_code}',
                'message_template' => 'Purchase Order #{po_code} created for supplier {supplier_name}.',
                'icon' => 'shopping-bag',
                'color' => '#10b981',
                'type' => 'purchase',
                'priority' => 'normal',
            ],
            [
                'code' => 'PURCHASE_APPROVED',
                'name' => 'Purchase Approved',
                'title_template' => 'PO #{po_code} Approved',
                'message_template' => 'Purchase order #{po_code} has been approved by manager.',
                'icon' => 'check-circle',
                'color' => '#10b981',
                'type' => 'purchase',
                'priority' => 'normal',
            ],
            [
                'code' => 'STOCK_LOW',
                'name' => 'Low Stock Warning',
                'title_template' => 'Low Stock Alert',
                'message_template' => "Item '{product_name}' is below threshold ({quantity} remaining).",
                'icon' => 'alert-triangle',
                'color' => '#f59e0b',
                'type' => 'inventory',
                'priority' => 'high',
            ],
            [
                'code' => 'STOCK_OUT',
                'name' => 'Out of Stock Critical',
                'title_template' => 'Out of Stock Alert',
                'message_template' => "Item '{product_name}' is completely out of stock!",
                'icon' => 'shield-alert',
                'color' => '#ef4444',
                'type' => 'inventory',
                'priority' => 'critical',
            ],
            [
                'code' => 'STOCK_TRANSFER',
                'name' => 'Stock Transfer',
                'title_template' => 'Stock Transfer #{transfer_code}',
                'message_template' => 'Stock transfer #{transfer_code} initiated from {from_branch} to {to_branch}.',
                'icon' => 'arrow-right-left',
                'color' => '#6366f1',
                'type' => 'inventory',
                'priority' => 'normal',
            ],
            [
                'code' => 'STOCK_ADJUSTMENT',
                'name' => 'Stock Adjustment',
                'title_template' => 'Stock Adjusted',
                'message_template' => "Inventory adjustment of {quantity} applied to '{product_name}'.",
                'icon' => 'sliders',
                'color' => '#8b5cf6',
                'type' => 'inventory',
                'priority' => 'normal',
            ],
            [
                'code' => 'WARRANTY_EXPIRED',
                'name' => 'Warranty Expired',
                'title_template' => 'Warranty Expired',
                'message_template' => "Warranty for '{product_name}' S/N #{serial_number} has expired.",
                'icon' => 'clock',
                'color' => '#f59e0b',
                'type' => 'inventory',
                'priority' => 'low',
            ],
            [
                'code' => 'REPAIR_FINISHED',
                'name' => 'Repair Finished',
                'title_template' => 'Repair Completed',
                'message_template' => 'Repair job #{repair_code} for {customer_name} is finished.',
                'icon' => 'wrench',
                'color' => '#10b981',
                'type' => 'sales',
                'priority' => 'normal',
            ],
            [
                'code' => 'CUSTOMER_REGISTERED',
                'name' => 'Customer Registered',
                'title_template' => 'New Customer Registered',
                'message_template' => "Customer '{customer_name}' registered via web portal.",
                'icon' => 'user-plus',
                'color' => '#ec4899',
                'type' => 'customer',
                'priority' => 'normal',
            ],
            [
                'code' => 'SUPPLIER_REGISTERED',
                'name' => 'Supplier Registered',
                'title_template' => 'New Supplier Registered',
                'message_template' => "Supplier '{supplier_name}' onboarded to system.",
                'icon' => 'truck',
                'color' => '#14b8a6',
                'type' => 'supplier',
                'priority' => 'normal',
            ],
            [
                'code' => 'EMPLOYEE_CREATED',
                'name' => 'Employee Created',
                'title_template' => 'New Employee Onboarded',
                'message_template' => "Employee '{employee_name}' added to {department} department.",
                'icon' => 'briefcase',
                'color' => '#06b6d4',
                'type' => 'employee',
                'priority' => 'normal',
            ],
            [
                'code' => 'ATTENDANCE_LATE',
                'name' => 'Late Attendance',
                'title_template' => 'Late Attendance Alert',
                'message_template' => "Employee '{employee_name}' checked in late at {check_in_time}.",
                'icon' => 'clock',
                'color' => '#f59e0b',
                'type' => 'attendance',
                'priority' => 'normal',
            ],
            [
                'code' => 'PAYROLL_APPROVED',
                'name' => 'Payroll Approved',
                'title_template' => 'Payroll Approved',
                'message_template' => 'Payroll for period {period} has been approved.',
                'icon' => 'dollar-sign',
                'color' => '#10b981',
                'type' => 'payroll',
                'priority' => 'normal',
            ],
            [
                'code' => 'PAYMENT_RECEIVED',
                'name' => 'Payment Received',
                'title_template' => 'Payment Received',
                'message_template' => 'Payment of {amount} received for invoice #{invoice_code}.',
                'icon' => 'credit-card',
                'color' => '#10b981',
                'type' => 'payment',
                'priority' => 'normal',
            ],
            [
                'code' => 'EXPENSE_ADDED',
                'name' => 'Expense Recorded',
                'title_template' => 'New Expense Recorded',
                'message_template' => "Expense '{title}' of {amount} recorded under {category}.",
                'icon' => 'receipt',
                'color' => '#ef4444',
                'type' => 'expense',
                'priority' => 'normal',
            ],
            [
                'code' => 'ROLE_UPDATED',
                'name' => 'User Role Updated',
                'title_template' => 'Role Updated',
                'message_template' => "User '{user_name}' role changed to {role_name}.",
                'icon' => 'shield',
                'color' => '#8b5cf6',
                'type' => 'security',
                'priority' => 'high',
            ],
            [
                'code' => 'PERMISSION_CHANGED',
                'name' => 'Permissions Modified',
                'title_template' => 'Permission Changed',
                'message_template' => "Access permissions updated for '{user_name}'.",
                'icon' => 'lock',
                'color' => '#8b5cf6',
                'type' => 'security',
                'priority' => 'high',
            ],
            [
                'code' => 'LOGIN_FAILED',
                'name' => 'Failed Login Alert',
                'title_template' => 'Login Failed Alert',
                'message_template' => "Multiple failed login attempts detected for '{username}' from IP {ip_address}.",
                'icon' => 'shield-alert',
                'color' => '#ef4444',
                'type' => 'security',
                'priority' => 'critical',
            ],
            [
                'code' => 'PASSWORD_CHANGED',
                'name' => 'Password Changed',
                'title_template' => 'Password Changed',
                'message_template' => 'Your account password was updated successfully.',
                'icon' => 'key',
                'color' => '#3b82f6',
                'type' => 'security',
                'priority' => 'normal',
            ],
            [
                'code' => 'BACKUP_FINISHED',
                'name' => 'Database Backup Complete',
                'title_template' => 'Backup Finished',
                'message_template' => 'System database backup completed and verified in cloud vault.',
                'icon' => 'database',
                'color' => '#10b981',
                'type' => 'system',
                'priority' => 'normal',
            ],
            [
                'code' => 'SYSTEM_ERROR',
                'name' => 'System Error Exception',
                'title_template' => 'System Error Alert',
                'message_template' => 'Critical exception in module {module_name}: {error_message}.',
                'icon' => 'bug',
                'color' => '#ef4444',
                'type' => 'error',
                'priority' => 'critical',
            ],
        ];

        foreach ($templates as $tmpl) {
            NotificationTemplate::updateOrCreate(
                ['code' => $tmpl['code']],
                $tmpl
            );
        }

        // 3. Seed Sample Initial Notifications
        $admin = User::first();
        if ($admin) {
            $samples = [
                [
                    'type' => 'inventory',
                    'title' => 'Low Stock Alert',
                    'message' => 'Apple MacBook Pro 16 M3 Max is below threshold (3 units remaining in Central Warehouse).',
                    'icon' => 'shield-alert',
                    'color' => '#ef4444',
                    'priority' => 'high',
                    'is_global' => false,
                    'status' => 'sent',
                ],
                [
                    'type' => 'purchase',
                    'title' => 'PO Shipment Received',
                    'message' => 'Purchase Order #PO-20260901-0012 has been received and verified from K-Tech Distribution Cambodia.',
                    'icon' => 'shopping-bag',
                    'color' => '#10b981',
                    'priority' => 'normal',
                    'is_global' => false,
                    'status' => 'sent',
                ],
                [
                    'type' => 'sales',
                    'title' => 'New POS Sale Completed',
                    'message' => 'Sale #INV-20260901-000042 completed for $0.85 USD via ABA KHQR.',
                    'icon' => 'shopping-cart',
                    'color' => '#3b82f6',
                    'priority' => 'normal',
                    'is_global' => false,
                    'status' => 'sent',
                ],
                [
                    'type' => 'customer',
                    'title' => 'New Customer Registered',
                    'message' => 'Customer Ly Socheat registered via online customer portal.',
                    'icon' => 'user-plus',
                    'color' => '#8b5cf6',
                    'priority' => 'normal',
                    'is_global' => false,
                    'status' => 'sent',
                ],
                [
                    'type' => 'system',
                    'title' => 'System Backup Completed',
                    'message' => 'Database backup and transaction logs secured to encrypted cloud vault.',
                    'icon' => 'database',
                    'color' => '#10b981',
                    'priority' => 'normal',
                    'is_global' => true,
                    'status' => 'sent',
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
                    'user_id' => $admin->id,
                    'is_read' => $index >= 2,
                    'read_at' => $index >= 2 ? Carbon::now()->subMinutes(10) : null,
                    'is_archived' => false,
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
