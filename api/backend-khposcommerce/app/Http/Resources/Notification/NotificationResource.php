<?php

namespace App\Http\Resources\Notification;

use App\Http\Resources\Traits\FormatsMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        $userId = auth()->id();
        $pivot = $this->notificationUsers->firstWhere('user_id', $userId);

        $isRead = $pivot ? (bool) $pivot->is_read : false;
        $readAt = $pivot ? $pivot->read_at : null;
        $isArchived = $pivot ? (bool) $pivot->is_archived : false;
        $readCount = $this->notificationUsers ? $this->notificationUsers->where('is_read', true)->count() : 0;

        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'company_name' => $this->company ? $this->company->name : null,
            'branch_id' => $this->branch_id,
            'branch_name' => $this->branch ? $this->branch->name : null,
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'icon' => $this->icon,
            'color' => $this->color,
            'priority' => $this->priority,
            'image' => $this->formatMediaUrl($this->image),
            'action_url' => $this->action_url,
            'reference_type' => $this->reference_type,
            'reference_id' => $this->reference_id,
            'created_by' => $this->created_by,
            'creator_name' => $this->creator ? $this->creator->name : 'System',
            'expires_at' => $this->expires_at ? $this->expires_at->toIso8601String() : null,
            'is_global' => (bool) $this->is_global,
            'status' => $this->status,
            'is_read' => $isRead,
            'read_at' => $readAt ? $readAt->toIso8601String() : null,
            'is_archived' => $isArchived,
            'read_count' => $readCount,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
