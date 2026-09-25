<?php

namespace App\Services\Log;

use App\Repositories\Log\AuditLogRepository;
use App\Models\Log\AuditLog;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class AuditLogService
{
    public function __construct(private readonly AuditLogRepository $repository)
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

    public function getById(int|string $id, array $relations = []): AuditLog
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): AuditLog
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): AuditLog
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
