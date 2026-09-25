<?php

namespace App\Services\Employee;

use App\Repositories\Employee\PositionRepository;
use App\Models\Employee\Position;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PositionService
{
    public function __construct(private readonly PositionRepository $repository)
    {
    }

    public function getAll(array $relations = []): Collection
    {
        return $this->repository->all(relations: $relations);
    }

    public function getPaginated(int $perPage = 15, array $filters = [], string $sort = 'created_at', string $order = 'desc'): LengthAwarePaginator
    {
        return $this->repository->paginateWithFilters($filters, $perPage, $sort, $order);
    }

    public function getById(int|string $id, array $relations = []): Position
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Position
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Position
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function restore(int|string $id): bool
    {
        return $this->repository->restore($id);
    }

    public function forceDelete(int|string $id): bool
    {
        return $this->repository->forceDelete($id);
    }

    public function bulkDelete(array $ids): int
    {
        return $this->repository->bulkDelete($ids);
    }

    public function bulkRestore(array $ids): int
    {
        return $this->repository->bulkRestore($ids);
    }
}
