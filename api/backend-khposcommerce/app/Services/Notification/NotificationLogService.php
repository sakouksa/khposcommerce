<?php

namespace App\Services\Notification;

use App\Repositories\Notification\NotificationLogRepository;
use App\Models\Notification\NotificationLog;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class NotificationLogService
{
    public function __construct(private readonly NotificationLogRepository $repository)
    {
    }

    public function getAll(array $relations = []): Collection
    {
        return $this->repository->all(relations: $relations);
    }

    public function getPaginated(int $perPage = 15, array $relations = []): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage, relations: $relations);
    }

    public function getById(int|string $id, array $relations = []): NotificationLog
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): NotificationLog
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): NotificationLog
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
