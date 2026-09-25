<?php

namespace App\Services\CMS;

use App\Repositories\CMS\BlogRepository;
use App\Models\CMS\Blog;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class BlogService
{
    public function __construct(private readonly BlogRepository $repository)
    {
    }

    public function getAll(array $relations = []): Collection
    {
        return $this->repository->all(relations: $relations);
    }

    public function getPaginated(int $perPage = 15, array $filters = [], array $relations = []): LengthAwarePaginator
    {
        $query = $this->repository->getModel()->newQuery()->with($relations);

        if (isset($filters['status']) && $filters['status'] === 'deleted') {
            $query->onlyTrashed();
        } elseif (isset($filters['status']) && $filters['status'] !== 'deleted') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $query->where('title', 'like', "%{$filters['search']}%");
        }

        return $query->paginate($perPage);
    }

    public function getById(int|string $id, array $relations = []): Blog
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Blog
    {
        $data['company_id'] = $data['company_id'] ?? auth()->user()?->company_id ?? 1;
        $data['user_id'] = $data['user_id'] ?? auth()->id() ?? 1;
        $data['excerpt'] = $data['excerpt'] ?? $data['summary'] ?? null;
        if (($data['status'] ?? 'published') === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Blog
    {
        if (isset($data['summary']) && !isset($data['excerpt'])) {
            $data['excerpt'] = $data['summary'];
        }
        if (isset($data['status']) && $data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }
        if (array_key_exists('remove_featured_image', $data) || (array_key_exists('featured_image', $data) && empty($data['featured_image']))) {
            $data['featured_image'] = null;
        }
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

    public function restore(int|string $id): bool
    {
        return $this->repository->restore($id);
    }

    public function forceDelete(int|string $id): bool
    {
        $blog = $this->repository->getModel()->withTrashed()->findOrFail($id);
        
        // Clean physical featured image file if exists via FileService
        if ($blog->featured_image) {
            app(\App\Services\Support\FileService::class)->delete($blog->featured_image);
        }

        return $this->repository->forceDelete($id);
    }
}
