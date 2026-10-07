<?php

namespace App\Services\POS;

use App\Repositories\POS\CashRegisterRepository;
use App\Models\POS\CashRegister;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CashRegisterService
{
    public function __construct(private readonly CashRegisterRepository $repository)
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

    public function getById(int|string $id, array $relations = []): CashRegister
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): CashRegister
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): CashRegister
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
