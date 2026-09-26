<?php

namespace App\Services\Log;

use App\Repositories\Log\ActivityLogRepository;
use App\Models\Log\ActivityLog;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ActivityLogService
{
    public function __construct(private readonly ActivityLogRepository $repository)
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

    public function getById(int|string $id, array $relations = []): ActivityLog
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): ActivityLog
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): ActivityLog
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
