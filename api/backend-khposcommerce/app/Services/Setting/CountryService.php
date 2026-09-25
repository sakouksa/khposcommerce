<?php

namespace App\Services\Setting;

use App\Repositories\Setting\CountryRepository;
use App\Models\Setting\Country;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CountryService
{
    public function __construct(private readonly CountryRepository $repository)
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

    public function getById(int|string $id, array $relations = []): Country
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Country
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Country
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
