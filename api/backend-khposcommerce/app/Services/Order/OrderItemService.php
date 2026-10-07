<?php

namespace App\Services\Order;

use App\Repositories\Order\OrderItemRepository;
use App\Models\Order\OrderItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class OrderItemService
{
    public function __construct(private readonly OrderItemRepository $repository)
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

    public function getById(int|string $id, array $relations = []): OrderItem
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): OrderItem
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): OrderItem
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
