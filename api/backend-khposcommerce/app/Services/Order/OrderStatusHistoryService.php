<?php

namespace App\Services\Order;

use App\Repositories\Order\OrderStatusHistoryRepository;
use App\Models\Order\OrderStatusHistory;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class OrderStatusHistoryService
{
    public function __construct(private readonly OrderStatusHistoryRepository $repository)
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

    public function getById(int|string $id, array $relations = []): OrderStatusHistory
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): OrderStatusHistory
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): OrderStatusHistory
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
