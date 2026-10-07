<?php

namespace App\Http\Resources\Notification;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'notification_id' => $this->notification_id,
            'user_id' => $this->user_id,
            'user_name' => $this->user ? $this->user->name : null,
            'channel' => $this->channel,
            'status' => $this->status,
            'response' => $this->response,
            'sent_at' => $this->sent_at ? $this->sent_at->toIso8601String() : null,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
