<?php

namespace App\Services\Purchase;

use App\Repositories\Purchase\PurchaseReturnItemRepository;
use App\Models\Purchase\PurchaseReturnItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PurchaseReturnItemService
{
    public function __construct(private readonly PurchaseReturnItemRepository $repository)
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

    public function getById(int|string $id, array $relations = []): PurchaseReturnItem
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): PurchaseReturnItem
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): PurchaseReturnItem
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
