<?php

namespace App\Repositories\Contracts\Auth;

use App\Repositories\Contracts\BaseRepositoryInterface;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProfileRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUserId(int $userId): User;
    public function getProfile(int $userId): User;
    public function updateProfile(int $userId, array $data): User;
    public function changePassword(int $userId, string $newPasswordHash): bool;
    public function getPermissions(int $userId): array;
    public function getActivityLogs(int $userId, int $perPage, ?string $search = null): LengthAwarePaginator;
    public function getLoginHistory(int $userId, int $perPage, ?string $search = null): LengthAwarePaginator;
}
