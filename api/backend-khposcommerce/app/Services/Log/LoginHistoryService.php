<?php

namespace App\Services\Log;

use App\Repositories\Log\LoginHistoryRepository;
use App\Models\Log\LoginHistory;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class LoginHistoryService
{
    public function __construct(private readonly LoginHistoryRepository $repository)
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

    public function getById(int|string $id, array $relations = []): LoginHistory
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): LoginHistory
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): LoginHistory
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
