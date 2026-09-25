<?php

namespace App\Jobs;

use App\Models\Notification\Notification;
use App\Models\Notification\NotificationLog;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Notification $notification;
    public array $userIds;
    public array $channels;

    public function __construct(Notification $notification, array $userIds = [], array $channels = ['database'])
    {
        $this->notification = $notification;
        $this->userIds = $userIds;
        $this->channels = $channels;
    }

    public function handle(): void
    {
        $users = User::whereIn('id', $this->userIds)->get();

        foreach ($this->channels as $channel) {
            foreach ($users as $user) {
                try {
                    $response = $this->dispatchToChannel($channel, $user);

                    NotificationLog::create([
                        'notification_id' => $this->notification->id,
                        'user_id' => $user->id,
                        'channel' => $channel,
                        'status' => 'sent',
                        'response' => json_encode($response),
                        'sent_at' => Carbon::now(),
                    ]);
                } catch (\Exception $e) {
                    Log::error("Failed to send notification channel {$channel} to user {$user->id}: " . $e->getMessage());

                    NotificationLog::create([
                        'notification_id' => $this->notification->id,
                        'user_id' => $user->id,
                        'channel' => $channel,
                        'status' => 'failed',
                        'response' => json_encode(['error' => $e->getMessage()]),
                        'sent_at' => null,
                    ]);
                }
            }
        }
    }

    protected function dispatchToChannel(string $channel, User $user): array
    {
        switch ($channel) {
            case 'email':
                // Email delivery integration mock/handler
                return ['status' => 'success', 'recipient' => $user->email];
            case 'telegram':
                // Telegram bot notification handler
                return ['status' => 'success', 'telegram_id' => $user->telegram_id ?? 'N/A'];
            case 'sms':
                // SMS gateway handler
                return ['status' => 'success', 'phone' => $user->phone ?? 'N/A'];
            case 'push':
                // FCM Push notification handler
                return ['status' => 'success', 'device_token' => $user->fcm_token ?? 'N/A'];
            case 'websocket':
                return ['status' => 'broadcasted'];
            case 'database':
            default:
                return ['status' => 'saved_to_db'];
        }
    }
}
