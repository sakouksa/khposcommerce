<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserRoleController extends BaseApiController
{
    public function assign(Request $request, int $id): JsonResponse
    {
        $request->validate(['role' => 'required|string|exists:roles,name']);
        $user = User::findOrFail($id);
        $user->assignRole($request->role);
        return $this->successResponse($user, 'Role assigned successfully');
    }

    public function remove(Request $request, int $id): JsonResponse
    {
        $request->validate(['role' => 'required|string|exists:roles,name']);
        $user = User::findOrFail($id);
        $user->removeRole($request->role);
        return $this->successResponse($user, 'Role removed successfully');
    }
}
