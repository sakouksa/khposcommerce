<?php

namespace App\Services\CMS;

use App\Repositories\CMS\BlogTagRepository;
use App\Models\CMS\BlogTag;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class BlogTagService
{
    public function __construct(private readonly BlogTagRepository $repository)
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

    public function getById(int|string $id, array $relations = []): BlogTag
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): BlogTag
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): BlogTag
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
