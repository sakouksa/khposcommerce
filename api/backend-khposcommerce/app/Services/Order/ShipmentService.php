<?php

namespace App\Services\Order;

use App\Repositories\Order\ShipmentRepository;
use App\Models\Order\Shipment;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ShipmentService
{
    public function __construct(private readonly ShipmentRepository $repository)
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

    public function getById(int|string $id, array $relations = []): Shipment
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Shipment
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Shipment
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
