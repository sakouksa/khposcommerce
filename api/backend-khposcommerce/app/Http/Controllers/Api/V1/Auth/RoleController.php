<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Auth\StoreRoleRequest;
use App\Http\Requests\Auth\UpdateRoleRequest;
use App\Http\Requests\Auth\AssignRolePermissionsRequest;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends BaseApiController
{
    /**
     * GET /api/v1/roles
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizePermission('role.view');

        $roles = Role::query()
            ->withCount(['permissions', 'users'])
            ->when($request->search, fn($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->orderBy($request->get('sort', 'id'), $request->get('order', 'asc'))
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse($roles);
    }

    /**
     * GET /api/v1/roles/{id}
     */
    public function show(int $id): JsonResponse
    {
        $this->authorizePermission('role.view');

        $role = Role::with(['permissions', 'users'])->withCount(['permissions', 'users'])->findOrFail($id);
        return $this->successResponse($role);
    }

    /**
     * POST /api/v1/roles
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $data = $request->validated();

        $role = Role::create([
            'name'       => $data['name'],
            'guard_name' => $data['guard_name'] ?? 'api',
        ]);

        if (!empty($data['permissions'])) {
            $permissions = Permission::where('guard_name', 'api')
                ->whereIn('name', $data['permissions'])
                ->get();
            $role->syncPermissions($permissions);
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return $this->createdResponse(
            $role->load('permissions')->loadCount(['permissions', 'users']),
            __('Role created successfully.')
        );
    }

    /**
     * PUT /api/v1/roles/{id}
     */
    public function update(UpdateRoleRequest $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        $data = $request->validated();

        if ($role->name === 'super_admin' && isset($data['name']) && $data['name'] !== 'super_admin') {
            return $this->errorResponse(__('Cannot rename super_admin role.'), null, 422);
        }

        if (isset($data['name'])) {
            $role->name = $data['name'];
            $role->save();
        }

        if (isset($data['permissions'])) {
            if ($role->name === 'super_admin') {
                $role->syncPermissions(Permission::where('guard_name', 'api')->get());
            } else {
                $permissions = Permission::where('guard_name', 'api')
                    ->whereIn('name', $data['permissions'])
                    ->get();
                $role->syncPermissions($permissions);
            }
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return $this->successResponse(
            $role->load('permissions')->loadCount(['permissions', 'users']),
            __('Role updated successfully.')
        );
    }

    /**
     * DELETE /api/v1/roles/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $this->authorizePermission('role.delete');

        $role = Role::findOrFail($id);

        $presetRoles = ['super_admin', 'admin', 'manager', 'cashier', 'warehouse_staff', 'customer'];
        if (in_array($role->name, $presetRoles)) {
            return $this->errorResponse(__('Cannot delete protected system role :role.', ['role' => $role->name]), null, 422);
        }

        $assignedUsers = DB::table('model_has_roles')->where('role_id', $role->id)->count();
        if ($assignedUsers > 0) {
            return $this->errorResponse(__('Cannot delete role that is currently assigned to :count users.', ['count' => $assignedUsers]), null, 422);
        }

        $role->delete();
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return $this->successResponse(null, __('Role deleted successfully.'));
    }

    /**
     * GET /api/v1/roles/{id}/permissions
     */
    public function permissions(int $id): JsonResponse
    {
        $this->authorizePermission('role.view');

        $role = Role::with('permissions')->findOrFail($id);
        return $this->successResponse($role->permissions->pluck('name'));
    }

    /**
     * POST /api/v1/roles/{id}/permissions
     */
    public function assignPermissions(AssignRolePermissionsRequest $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        $permissions = $request->validated()['permissions'] ?? [];

        if ($role->name === 'super_admin') {
            $role->syncPermissions(Permission::where('guard_name', 'api')->get());
        } else {
            $permissionModels = Permission::where('guard_name', 'api')
                ->whereIn('name', $permissions)
                ->get();
            $role->syncPermissions($permissionModels);
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return $this->successResponse(
            $role->load('permissions')->loadCount(['permissions', 'users']),
            __('Role permissions synchronized successfully.')
        );
    }

    /**
     * GET /api/v1/roles/stats
     * GET /api/v1/roles/dashboard
     */
    public function stats(): JsonResponse
    {
        $this->authorizePermission('role.view');

        $totalRoles = Role::count();
        $totalPermissions = Permission::where('guard_name', 'api')->count();

        $assignedPermissionsCount = DB::table('role_has_permissions')->count();
        $distinctAssignedPermissions = DB::table('role_has_permissions')->distinct('permission_id')->count('permission_id');
        $unusedPermissions = max(0, $totalPermissions - $distinctAssignedPermissions);
        $permissionCoverage = $totalPermissions > 0 ? round(($distinctAssignedPermissions / $totalPermissions) * 100, 1) : 100;

        $usersAssigned = DB::table('model_has_roles')->distinct('model_id')->count('model_id');
        $avgPermissions = $totalRoles > 0 ? round($assignedPermissionsCount / $totalRoles, 1) : 0;

        return $this->successResponse([
            'total_roles'           => $totalRoles,
            'active_roles'          => $totalRoles,
            'inactive_roles'        => 0,
            'system_roles'          => 6,

            'total_permissions'     => $totalPermissions,
            'assigned_permissions'  => $assignedPermissionsCount,
            'distinct_assigned'     => $distinctAssignedPermissions,
            'unused_permissions'    => $unusedPermissions,
            'permission_coverage'   => $permissionCoverage,

            'users_assigned'        => $usersAssigned,
            'average_permissions'   => $avgPermissions,
        ]);
    }

    /**
     * Helper to verify authorization
     */
    protected function authorizePermission(string $permission): void
    {
        $user = request()->user();
        if (!$user) {
            abort(401, __('Unauthenticated.'));
        }
        if (!$user->can($permission)) {
            abort(403, __('You do not have permission to perform this action.'));
        }
    }
}
