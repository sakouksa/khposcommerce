<?php

namespace App\Services;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Enterprise BaseService
 *
 * Provides standardized delegating methods to repository layers,
 * eliminating boilerplate across standard CRUD resource services.
 */
abstract class BaseService
{
    public function __construct(
        protected BaseRepositoryInterface $repository
    ) {}

    public function getAll(array $relations = []): Collection
    {
        return $this->repository->all(relations: $relations);
    }

    public function getPaginated(int $perPage = 15, array $relations = []): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage, relations: $relations);
    }

    public function getById(int|string $id, array $relations = []): ?Model
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function findByField(string $field, mixed $value, array $columns = ['*']): ?Model
    {
        return $this->repository->findByField($field, $value, $columns);
    }

    public function create(array $data): Model
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Model
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function bulkDelete(array $ids): int
    {
        return $this->repository->bulkDelete($ids);
    }

    public function restore(int|string $id): bool
    {
        return $this->repository->restore($id);
    }

    public function bulkRestore(array $ids): int
    {
        return $this->repository->bulkRestore($ids);
    }

    public function forceDelete(int|string $id): bool
    {
        return $this->repository->forceDelete($id);
    }

    public function bulkForceDelete(array $ids): int
    {
        return $this->repository->bulkForceDelete($ids);
    }
}
