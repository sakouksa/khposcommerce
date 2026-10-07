<?php

namespace App\Repositories;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

abstract class BaseRepository implements BaseRepositoryInterface
{
    protected Model $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function getModel(): Model
    {
        return $this->model;
    }

    public function all(array $columns = ['*'], array $relations = []): Collection
    {
        return $this->model->with($relations)->get($columns);
    }

    public function paginate(int $perPage = 10, array $columns = ['*'], array $relations = []): LengthAwarePaginator
    {
        return $this->model->with($relations)->paginate($perPage, $columns);
    }

    public function findById(int|string $id, array $columns = ['*'], array $relations = [], array $appends = []): ?Model
    {
        $model = $this->model->select($columns)->with($relations)->findOrFail($id);
        if ($appends) {
            $model->append($appends);
        }
        return $model;
    }

    public function findByField(string $field, mixed $value, array $columns = ['*']): ?Model
    {
        return $this->model->select($columns)->where($field, $value)->first();
    }

    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    public function update(int|string $id, array $data): Model
    {
        $record = $this->findById($id);
        $record->update($data);
        return $record->fresh();
    }

    public function delete(int|string $id): bool
    {
        return $this->findById($id)->delete();
    }

    public function restore(int|string $id): bool
    {
        return $this->model->withTrashed()->findOrFail($id)->restore();
    }

    public function forceDelete(int|string $id): bool
    {
        return $this->model->withTrashed()->findOrFail($id)->forceDelete();
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn($this->model->getKeyName(), $ids)->delete();
    }

    public function bulkRestore(array $ids): int
    {
        return $this->model->onlyTrashed()->whereIn($this->model->getKeyName(), $ids)->restore();
    }

    public function bulkForceDelete(array $ids): int
    {
        return $this->model->onlyTrashed()->whereIn($this->model->getKeyName(), $ids)->forceDelete();
    }
}
