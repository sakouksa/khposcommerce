<?php

namespace App\Services\Marketing;

use App\Repositories\Marketing\PromotionRepository;
use App\Models\Marketing\Promotion;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PromotionService
{
    public function __construct(private readonly PromotionRepository $repository)
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

    public function getById(int|string $id, array $relations = []): Promotion
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Promotion
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Promotion
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
