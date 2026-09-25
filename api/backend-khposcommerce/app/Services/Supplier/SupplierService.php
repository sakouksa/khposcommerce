<?php

namespace App\Services\Supplier;

use App\Repositories\Supplier\SupplierRepository;
use App\Models\Supplier\Supplier;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SupplierService
{
    public function __construct(private readonly SupplierRepository $repository)
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

    public function getById(int|string $id, array $relations = []): Supplier
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): Supplier
    {
        return DB::transaction(function () use ($data) {
            $contacts = $data['contacts'] ?? [];
            unset($data['contacts']);

            $supplier = $this->repository->create($data);

            foreach ($contacts as $contactData) {
                $supplier->contacts()->create([
                    'name'       => $contactData['name'],
                    'title'      => $contactData['title'] ?? null,
                    'email'      => $contactData['email'] ?? null,
                    'phone'      => $contactData['phone'] ?? null,
                    'is_primary' => (bool) ($contactData['is_primary'] ?? false),
                ]);
            }

            return $supplier->load('contacts');
        });
    }

    public function update(int|string $id, array $data): Supplier
    {
        return DB::transaction(function () use ($id, $data) {
            $contacts = $data['contacts'] ?? null;
            unset($data['contacts']);

            $supplier = $this->repository->update($id, $data);

            if ($contacts !== null) {
                $supplier->contacts()->delete();
                foreach ($contacts as $contactData) {
                    $supplier->contacts()->create([
                        'name'       => $contactData['name'],
                        'title'      => $contactData['title'] ?? null,
                        'email'      => $contactData['email'] ?? null,
                        'phone'      => $contactData['phone'] ?? null,
                        'is_primary' => (bool) ($contactData['is_primary'] ?? false),
                    ]);
                }
            }

            return $supplier->load('contacts');
        });
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function bulkDelete(array $ids): int
    {
        return Supplier::whereIn('id', $ids)->delete();
    }
}
