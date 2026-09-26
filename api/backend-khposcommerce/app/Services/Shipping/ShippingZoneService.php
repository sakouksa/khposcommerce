<?php

namespace App\Services\Shipping;

use App\Repositories\Shipping\ShippingZoneRepository;
use App\Models\Shipping\ShippingZone;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ShippingZoneService
{
    public function __construct(private readonly ShippingZoneRepository $repository)
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

    public function getById(int|string $id, array $relations = []): ShippingZone
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): ShippingZone
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): ShippingZone
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
