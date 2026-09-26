<?php

namespace App\Services\Sales;

use App\Repositories\Sales\SaleReturnRepository;
use App\Models\Sales\SaleReturn;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class SaleReturnService
{
    public function __construct(private readonly SaleReturnRepository $repository)
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

    public function getById(int|string $id, array $relations = []): SaleReturn
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): SaleReturn
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): SaleReturn
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
