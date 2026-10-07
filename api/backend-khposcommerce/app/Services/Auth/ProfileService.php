<?php

namespace App\Services\Auth;

use App\Repositories\Contracts\Auth\ProfileRepositoryInterface;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    public function __construct(
        protected ProfileRepositoryInterface $profileRepository
    ) {}

    public function getProfile(User $user): User
    {
        return $this->profileRepository->getProfile($user->id);
    }

    public function updateProfile(User $user, array $data): User
    {
        return $this->profileRepository->updateProfile($user->id, $data);
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (! Hash::check($currentPassword, $user->password)) {
            return false;
        }

        $this->profileRepository->changePassword($user->id, Hash::make($newPassword));

        return true;
    }

    public function uploadAvatar(User $user, UploadedFile $file): string
    {
        // Delete old avatar from storage via FileService
        if ($user->avatar) {
            app(\App\Services\Support\FileService::class)->delete($user->avatar);
        }

        $path = $file->store('profile', 'public');
        $url = Storage::url($path);

        $this->profileRepository->updateProfile($user->id, ['avatar' => $url]);

        return $url;
    }

    public function removeAvatar(User $user): void
    {
        if ($user->avatar) {
            app(\App\Services\Support\FileService::class)->delete($user->avatar);
            $this->profileRepository->updateProfile($user->id, ['avatar' => null]);
        }
    }

    public function getPermissions(User $user): array
    {
        return $this->profileRepository->getPermissions($user->id);
    }

    public function getActivityLogs(User $user, int $perPage, ?string $search = null): LengthAwarePaginator
    {
        return $this->profileRepository->getActivityLogs($user->id, $perPage, $search);
    }

    public function getLoginHistory(User $user, int $perPage, ?string $search = null): LengthAwarePaginator
    {
        return $this->profileRepository->getLoginHistory($user->id, $perPage, $search);
    }

    public function logoutOtherDevices(User $user): void
    {
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();
    }
}
