<?php

namespace App\Services\Payment;

use App\Repositories\Payment\TransactionRepository;
use App\Models\Payment\Transaction;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class TransactionService
{
    public function __construct(private readonly TransactionRepository $repository)
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

    public function getById(int|string $id, array $relations = []): Transaction
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Transaction
    {
        if (empty($data['company_id'])) {
            $data['company_id'] = Auth::user()?->company_id ?? 1;
        }
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Transaction
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
