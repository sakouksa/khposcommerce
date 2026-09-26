<?php

namespace App\Repositories\Auth;

use App\Repositories\Contracts\Auth\ProfileRepositoryInterface;
use App\Repositories\BaseRepository;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;
use App\Models\Log\LoginHistory;
use Illuminate\Pagination\LengthAwarePaginator;

class ProfileRepository extends BaseRepository implements ProfileRepositoryInterface
{
    public function __construct(User $user)
    {
        parent::__construct($user);
    }

    public function findByUserId(int $userId): User
    {
        return $this->getProfile($userId);
    }

    public function getProfile(int $userId): User
    {
        return $this->model->with(['company', 'branch', 'employee', 'roles', 'permissions'])->findOrFail($userId);
    }

    public function updateProfile(int $userId, array $data): User
    {
        $user = $this->findById($userId);
        $user->update($data);
        return $this->getProfile($userId);
    }

    public function changePassword(int $userId, string $newPasswordHash): bool
    {
        $user = $this->findById($userId);
        $user->update(['password' => $newPasswordHash]);
        return true;
    }

    public function getPermissions(int $userId): array
    {
        $user = $this->getProfile($userId);
        
        $roles = $user->getRoleNames()->toArray();
        
        $permissions = $user->getAllPermissions()->map(function ($perm) {
            $parts = explode('.', $perm->name);
            return [
                'name'       => $perm->name,
                'module'     => count($parts) > 0 ? $parts[0] : 'general',
                'action'     => count($parts) > 1 ? $parts[1] : 'view',
                'guard_name' => $perm->guard_name
            ];
        })->toArray();

        return compact('roles', 'permissions');
    }

    public function getActivityLogs(int $userId, int $perPage, ?string $search = null): LengthAwarePaginator
    {
        return Activity::with('causer', 'subject')
            ->where('causer_id', $userId)
            ->where('causer_type', User::class)
            ->when($search, function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage);
    }

    public function getLoginHistory(int $userId, int $perPage, ?string $search = null): LengthAwarePaginator
    {
        return LoginHistory::where('user_id', $userId)
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('ip_address', 'like', "%{$search}%")
                      ->orWhere('browser', 'like', "%{$search}%")
                      ->orWhere('device', 'like', "%{$search}%")
                      ->orWhere('platform', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage);
    }
}
