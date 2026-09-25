<?php

namespace App\Services\Setting;

use App\Repositories\Setting\CityRepository;
use App\Models\Setting\City;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CityService
{
    public function __construct(private readonly CityRepository $repository)
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

    public function getById(int|string $id, array $relations = []): City
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): City
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): City
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
