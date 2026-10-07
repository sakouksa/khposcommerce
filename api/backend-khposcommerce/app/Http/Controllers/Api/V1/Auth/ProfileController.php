<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\Auth\ProfileResource;
use App\Services\Auth\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends BaseApiController
{
    public function __construct(
        protected ProfileService $profileService
    ) {}

    /**
     * GET /api/v1/profile
     */
    public function show(Request $request): JsonResponse
    {
        $profile = $this->profileService->getProfile($request->user());

        return $this->successResponse(new ProfileResource($profile));
    }

    /**
     * PUT /api/v1/profile
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $profile = $this->profileService->updateProfile($request->user(), $request->validated());

        return $this->successResponse(new ProfileResource($profile), __('Profile updated successfully.'));
    }

    /**
     * POST /api/v1/profile/avatar
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $url = $this->profileService->uploadAvatar($request->user(), $request->file('avatar'));

        return $this->successResponse(['avatar_url' => $url], __('Avatar uploaded successfully.'));
    }

    /**
     * DELETE /api/v1/profile/avatar
     */
    public function removeAvatar(Request $request): JsonResponse
    {
        $this->profileService->removeAvatar($request->user());

        return $this->successResponse(null, __('Avatar removed successfully.'));
    }

    /**
     * POST /api/v1/profile/change-password
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $success = $this->profileService->changePassword(
            $request->user(),
            $request->current_password,
            $request->new_password
        );

        if (! $success) {
            return $this->errorResponse(__('Incorrect current password.'), null, 422);
        }

        return $this->successResponse(null, __('Password changed successfully.'));
    }

    /**
     * GET /api/v1/profile/permissions
     */
    public function permissions(Request $request): JsonResponse
    {
        $permissions = $this->profileService->getPermissions($request->user());

        return $this->successResponse($permissions, __('Permissions retrieved successfully.'));
    }

    /**
     * GET /api/v1/profile/activity-logs
     */
    public function activityLogs(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->get('search');
        $logs = $this->profileService->getActivityLogs($request->user(), $perPage, $search);

        return $this->paginatedResponse($logs);
    }

    /**
     * GET /api/v1/profile/login-history
     */
    public function loginHistory(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->get('search');
        $history = $this->profileService->getLoginHistory($request->user(), $perPage, $search);

        return $this->paginatedResponse($history);
    }

    /**
     * POST /api/v1/profile/logout-devices
     */
    public function logoutDevices(Request $request): JsonResponse
    {
        $this->profileService->logoutOtherDevices($request->user());

        return $this->successResponse(null, __('Other devices logged out successfully.'));
    }
}
