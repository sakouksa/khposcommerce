<?php

namespace App\Services\Purchase;

use App\Repositories\Purchase\PurchaseItemRepository;
use App\Models\Purchase\PurchaseItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PurchaseItemService
{
    public function __construct(private readonly PurchaseItemRepository $repository)
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

    public function getById(int|string $id, array $relations = []): PurchaseItem
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): PurchaseItem
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): PurchaseItem
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
