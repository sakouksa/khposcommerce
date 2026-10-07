<?php

namespace App\Services\CMS;

use App\Repositories\CMS\FaqRepository;
use App\Models\CMS\Faq;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class FaqService
{
    public function __construct(private readonly FaqRepository $repository)
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

    public function getById(int|string $id, array $relations = []): Faq
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Faq
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Faq
    {
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function bulkDelete(array $ids): int
    {
        return $this->repository->bulkDelete($ids);
    }
}
