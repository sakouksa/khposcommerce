<?php

namespace App\Services\CMS;

use App\Repositories\CMS\PageRepository;
use App\Models\CMS\Page;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PageService
{
    public function __construct(private readonly PageRepository $repository)
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

    public function getById(int|string $id, array $relations = []): Page
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Page
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Page
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
