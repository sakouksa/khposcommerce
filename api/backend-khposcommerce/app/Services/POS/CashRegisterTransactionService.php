<?php

namespace App\Services\POS;

use App\Repositories\POS\CashRegisterTransactionRepository;
use App\Models\POS\CashRegisterTransaction;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CashRegisterTransactionService
{
    public function __construct(private readonly CashRegisterTransactionRepository $repository)
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

    public function getById(int|string $id, array $relations = []): CashRegisterTransaction
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): CashRegisterTransaction
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): CashRegisterTransaction
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
