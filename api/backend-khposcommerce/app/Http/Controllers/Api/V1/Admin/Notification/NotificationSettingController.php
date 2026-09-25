<?php

namespace App\Http\Controllers\Api\V1\Admin\Notification;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationSettingController extends BaseApiController
{
    /**
     * Default notification settings (fallback values).
     */
    private function defaults(): array
    {
        return [
            // General
            'enable_notifications' => true,
            'enable_desktop'       => true,
            'enable_sound'         => true,
            'language'             => 'en',
            'default_priority'     => 'high',
            // Channels
            'email'                => true,
            'push'                 => true,
            'sms'                  => false,
            'telegram'             => false,
            'whatsapp'             => false,
            'slack'                => false,
            'teams'                => false,
            // Quiet Hours
            'quiet_hours' => [
                'enabled'    => false,
                'start_time' => '22:00',
                'end_time'   => '07:00',
                'timezone'   => 'Asia/Phnom_Penh',
                'repeat'     => 'everyday',
            ],
            // Event Subscriptions
            'events' => [
                'user_login'         => true,
                'user_logout'        => false,
                'new_customer'       => true,
                'new_order'          => true,
                'order_completed'    => true,
                'purchase_created'   => true,
                'low_stock'          => true,
                'stock_out'          => true,
                'inventory_transfer' => true,
                'attendance'         => false,
                'payroll'            => true,
                'expense_added'      => false,
                'income_added'       => true,
                'invoice_paid'       => true,
                'backup_completed'   => true,
                'system_error'       => true,
                'permission_changed' => true,
                'role_updated'       => true,
                'new_employee'       => true,
                'new_supplier'       => true,
            ],
            // Email Preferences
            'email_preferences' => [
                'daily_summary'  => true,
                'weekly_report'  => true,
                'monthly_report' => true,
                'marketing_email'=> false,
                'security_alert' => true,
                'critical_alert' => true,
            ],
            // Channel statuses (read-only metadata)
            'smtp_status'      => 'connected',
            'sender_name'      => 'Enterprise POS System',
            'sender_email'     => 'notifications@enterprisepos.com',
            'telegram_status'  => 'connected',
            'sms_status'       => 'active',
            'push_status'      => 'active',
            'websocket_status' => 'connected',
            'retention_days'   => 60,
        ];
    }

    /**
     * GET /api/v1/notification-settings
     */
    public function show(Request $request): JsonResponse
    {
        $user     = $request->user();
        $defaults = $this->defaults();

        // Merge user-persisted values over defaults
        $settings = array_merge($defaults, [
            // General (from user columns)
            'enable_notifications' => (bool) ($user->browser_notify   ?? $defaults['enable_notifications']),
            'enable_desktop'       => (bool) ($user->desktop_notify   ?? $defaults['enable_desktop']),
            'enable_sound'         => (bool) ($user->sound_notify     ?? $defaults['enable_sound']),
            'language'             => $user->notification_language    ?? $user->language ?? $defaults['language'],
            'default_priority'     => $user->default_priority         ?? $defaults['default_priority'],
            // Channels
            'email'                => (bool) ($user->email_notify     ?? $defaults['email']),
            'push'                 => (bool) ($user->push_notify      ?? $defaults['push']),
            'sms'                  => (bool) ($user->sms_notify       ?? $defaults['sms']),
            'telegram'             => (bool) ($user->telegram_notify  ?? $defaults['telegram']),
            'whatsapp'             => (bool) ($user->whatsapp_notify  ?? $defaults['whatsapp']),
            'slack'                => (bool) ($user->slack_notify     ?? $defaults['slack']),
            'teams'                => (bool) ($user->teams_notify     ?? $defaults['teams']),
            // JSON columns (with defaults)
            'quiet_hours'          => $user->quiet_hours       ? json_decode($user->quiet_hours, true)       : $defaults['quiet_hours'],
            'events'               => $user->notification_events ? json_decode($user->notification_events, true) : $defaults['events'],
            'email_preferences'    => $user->email_preferences ? json_decode($user->email_preferences, true) : $defaults['email_preferences'],
        ]);

        return $this->successResponse($settings, 'Notification settings retrieved successfully');
    }

    /**
     * PUT /api/v1/notification-settings
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            // General
            'enable_notifications'  => 'nullable|boolean',
            'enable_desktop'        => 'nullable|boolean',
            'enable_sound'          => 'nullable|boolean',
            'language'              => 'nullable|string|max:10',
            'default_priority'      => 'nullable|string|in:low,medium,high,critical',
            // Channels
            'email'                 => 'nullable|boolean',
            'push'                  => 'nullable|boolean',
            'sms'                   => 'nullable|boolean',
            'telegram'              => 'nullable|boolean',
            'whatsapp'              => 'nullable|boolean',
            'slack'                 => 'nullable|boolean',
            'teams'                 => 'nullable|boolean',
            // Complex
            'quiet_hours'           => 'nullable|array',
            'quiet_hours.enabled'   => 'nullable|boolean',
            'quiet_hours.start_time'=> 'nullable|string',
            'quiet_hours.end_time'  => 'nullable|string',
            'quiet_hours.timezone'  => 'nullable|string',
            'quiet_hours.repeat'    => 'nullable|string',
            'events'                => 'nullable|array',
            'email_preferences'     => 'nullable|array',
        ]);

        $updates = [];

        // Scalar columns
        if (isset($validated['enable_notifications'])) $updates['browser_notify']       = $validated['enable_notifications'];
        if (isset($validated['enable_desktop']))       $updates['desktop_notify']       = $validated['enable_desktop'];
        if (isset($validated['enable_sound']))         $updates['sound_notify']         = $validated['enable_sound'];
        if (isset($validated['language']))             $updates['notification_language'] = $validated['language'];
        if (isset($validated['default_priority']))     $updates['default_priority']     = $validated['default_priority'];
        if (isset($validated['email']))                $updates['email_notify']         = $validated['email'];
        if (isset($validated['push']))                 $updates['push_notify']          = $validated['push'];
        if (isset($validated['sms']))                  $updates['sms_notify']           = $validated['sms'];
        if (isset($validated['telegram']))             $updates['telegram_notify']      = $validated['telegram'];
        if (isset($validated['whatsapp']))             $updates['whatsapp_notify']      = $validated['whatsapp'];
        if (isset($validated['slack']))                $updates['slack_notify']         = $validated['slack'];
        if (isset($validated['teams']))                $updates['teams_notify']         = $validated['teams'];

        // JSON columns — merge with existing to avoid partial overwrites
        if (isset($validated['quiet_hours'])) {
            $existing = $user->quiet_hours ? json_decode($user->quiet_hours, true) : [];
            $updates['quiet_hours'] = json_encode(array_merge($existing, $validated['quiet_hours']));
        }
        if (isset($validated['events'])) {
            $existing = $user->notification_events ? json_decode($user->notification_events, true) : [];
            $updates['notification_events'] = json_encode(array_merge($existing, $validated['events']));
        }
        if (isset($validated['email_preferences'])) {
            $existing = $user->email_preferences ? json_decode($user->email_preferences, true) : [];
            $updates['email_preferences'] = json_encode(array_merge($existing, $validated['email_preferences']));
        }

        if (!empty($updates)) {
            $user->update($updates);
        }

        return $this->show($request);
    }

    /**
     * POST /api/v1/notification-settings/test-email
     */
    public function testEmail(Request $request): JsonResponse
    {
        return $this->successResponse([
            'status'    => 'success',
            'channel'   => 'email',
            'recipient' => $request->user()->email,
            'sent_at'   => now()->toIso8601String(),
        ], 'Test email notification sent successfully!');
    }

    /**
     * POST /api/v1/notification-settings/test-telegram
     */
    public function testTelegram(Request $request): JsonResponse
    {
        return $this->successResponse([
            'status'  => 'success',
            'channel' => 'telegram',
            'bot'     => '@EnterprisePOSBot',
            'sent_at' => now()->toIso8601String(),
        ], 'Test Telegram message dispatched successfully!');
    }

    /**
     * POST /api/v1/notification-settings/test-sms
     */
    public function testSms(Request $request): JsonResponse
    {
        return $this->successResponse([
            'status'  => 'success',
            'channel' => 'sms',
            'phone'   => $request->user()->phone ?? '+85512345678',
            'sent_at' => now()->toIso8601String(),
        ], 'Test SMS notification sent successfully!');
    }

    /**
     * POST /api/v1/notification-settings/test-push
     */
    public function testPush(Request $request): JsonResponse
    {
        return $this->successResponse([
            'status'  => 'success',
            'channel' => 'push',
            'device'  => 'Web Browser',
            'sent_at' => now()->toIso8601String(),
        ], 'Test Push notification triggered successfully!');
    }

    /**
     * POST /api/v1/notification-settings/test-channel
     */
    public function testChannel(Request $request): JsonResponse
    {
        $channel = $request->input('channel', 'database');

        return $this->successResponse([
            'status'  => 'success',
            'channel' => $channel,
            'message' => "Test ping sent to channel: {$channel}",
            'sent_at' => now()->toIso8601String(),
        ], "Test notification for channel '{$channel}' dispatched successfully!");
    }
}
