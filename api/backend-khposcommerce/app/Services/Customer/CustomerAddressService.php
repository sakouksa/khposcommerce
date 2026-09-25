<?php

namespace App\Services\Customer;

use App\Repositories\Customer\CustomerAddressRepository;
use App\Models\Customer\CustomerAddress;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class CustomerAddressService
{
    public function __construct(private readonly CustomerAddressRepository $repository)
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

    public function getById(int|string $id, array $relations = []): CustomerAddress
    {
        return $this->repository->findById($id, relations: $relations);
    }

    public function create(array $data): CustomerAddress
    {
        if (!empty($data['is_default'])) {
            CustomerAddress::where('customer_id', $data['customer_id'])
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): CustomerAddress
    {
        if (!empty($data['is_default'])) {
            $address = $this->getById($id);
            CustomerAddress::where('customer_id', $address->customer_id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }
        return $this->repository->update($id, $data);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }
}
