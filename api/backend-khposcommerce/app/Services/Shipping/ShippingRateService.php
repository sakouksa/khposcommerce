<?php

namespace App\Services\Shipping;

use App\Repositories\Shipping\ShippingRateRepository;
use App\Models\Shipping\ShippingRate;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ShippingRateService
{
    public function __construct(private readonly ShippingRateRepository $repository)
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

    public function getById(int|string $id, array $relations = []): ShippingRate
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): ShippingRate
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): ShippingRate
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
