<?php

namespace App\Services\Sales;

use App\Repositories\Sales\SaleItemRepository;
use App\Models\Sales\SaleItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class SaleItemService
{
    public function __construct(private readonly SaleItemRepository $repository)
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

    public function getById(int|string $id, array $relations = []): SaleItem
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): SaleItem
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): SaleItem
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
