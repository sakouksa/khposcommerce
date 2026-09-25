<?php

namespace App\Services\Inventory;

use App\Repositories\Inventory\StockOpnameItemRepository;
use App\Models\Inventory\StockOpnameItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class StockOpnameItemService
{
    public function __construct(private readonly StockOpnameItemRepository $repository)
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

    public function getById(int|string $id, array $relations = []): StockOpnameItem
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): StockOpnameItem
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): StockOpnameItem
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
