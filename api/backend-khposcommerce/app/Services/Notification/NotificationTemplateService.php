<?php

namespace App\Services\Notification;

use App\Models\Notification\NotificationTemplate;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class NotificationTemplateService
{
    public function getPaginatedTemplates(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = NotificationTemplate::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('title_template', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('code', 'asc')->paginate($perPage);
    }

    public function getAllActive(): Collection
    {
        return NotificationTemplate::where('is_active', true)->get();
    }

    public function createTemplate(array $data): NotificationTemplate
    {
        return NotificationTemplate::create($data);
    }

    public function updateTemplate(NotificationTemplate $template, array $data): NotificationTemplate
    {
        $template->update($data);
        return $template->fresh();
    }

    public function deleteTemplate(NotificationTemplate $template): bool
    {
        return $template->delete();
    }

    public function findByCode(string $code): ?NotificationTemplate
    {
        return NotificationTemplate::where('code', $code)->where('is_active', true)->first();
    }
}
