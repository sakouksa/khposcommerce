<?php

namespace App\Services\Review;

use App\Repositories\Review\ProductReviewRepository;
use App\Models\Review\ProductReview;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ProductReviewService
{
    public function __construct(private readonly ProductReviewRepository $repository)
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

    public function getById(int|string $id, array $relations = []): ProductReview
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): ProductReview
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): ProductReview
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
