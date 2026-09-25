<?php

namespace App\Services\Order;

use App\Repositories\Order\CartItemRepository;
use App\Models\Order\CartItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CartItemService
{
    public function __construct(private readonly CartItemRepository $repository)
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

    public function getById(int|string $id, array $relations = []): CartItem
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): CartItem
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): CartItem
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
