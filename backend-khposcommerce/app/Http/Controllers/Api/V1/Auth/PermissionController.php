<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Auth\StorePermissionRequest;
use App\Http\Requests\Auth\UpdatePermissionRequest;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends BaseApiController
{
    /**
     * GET /api/v1/permissions
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizePermission('permission.view');

        $query = Permission::query()
            ->where('guard_name', 'api')
            ->withCount('roles')
            ->when($request->search, function ($q, $v) {
                $q->where('name', 'like', "%{$v}%");
            })
            ->when($request->module && $request->module !== 'all', function ($q, $module) {
                $q->where('name', 'like', "{$module}.%");
            })
            ->when($request->action && $request->action !== 'all', function ($q, $action) {
                $q->where('name', 'like', "%.{$action}");
            })
            ->orderBy($request->get('sort', 'name'), $request->get('order', 'asc'));

        // Return all permissions for dropdowns/selects
        if ($request->boolean('all') || $request->get('per_page') === 'all') {
            $permissions = $query->get()->map(fn($p) => $this->formatPermission($p));
            return $this->successResponse($permissions);
        }

        $paginated = $query->paginate($request->integer('per_page', 20));

        // Format items with module, action_type, and risk_level
        $paginated->getCollection()->transform(fn($p) => $this->formatPermission($p));

        return $this->paginatedResponse($paginated);
    }

    /**
     * GET /api/v1/permissions/{id}
     */
    public function show(int $id): JsonResponse
    {
        $this->authorizePermission('permission.view');

        $permission = Permission::with('roles')->withCount('roles')->findOrFail($id);
        return $this->successResponse($this->formatPermission($permission, true));
    }

    /**
     * POST /api/v1/permissions
     */
    public function store(StorePermissionRequest $request): JsonResponse
    {
        $data = $request->validated();

        $permission = Permission::create([
            'name'       => $data['name'],
            'guard_name' => $data['guard_name'] ?? 'api',
        ]);

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return $this->createdResponse(
            $this->formatPermission($permission->loadCount('roles')),
            __('Permission created successfully.')
        );
    }

    /**
     * PUT /api/v1/permissions/{id}
     */
    public function update(UpdatePermissionRequest $request, int $id): JsonResponse
    {
        $permission = Permission::findOrFail($id);
        $data = $request->validated();

        $permission->update($data);

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return $this->successResponse(
            $this->formatPermission($permission->loadCount('roles')),
            __('Permission updated successfully.')
        );
    }

    /**
     * DELETE /api/v1/permissions/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $this->authorizePermission('permission.delete');

        $permission = Permission::findOrFail($id);

        $assignedRolesCount = DB::table('role_has_permissions')->where('permission_id', $permission->id)->count();
        if ($assignedRolesCount > 0) {
            return $this->errorResponse(__('Cannot delete permission that is currently assigned to :count roles.', ['count' => $assignedRolesCount]), null, 422);
        }

        $permission->delete();
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return $this->successResponse(null, __('Permission deleted successfully.'));
    }

    /**
     * GET /api/v1/permissions/modules
     */
    public function modules(): JsonResponse
    {
        $this->authorizePermission('permission.view');

        $modules = Permission::where('guard_name', 'api')
            ->pluck('name')
            ->map(function ($name) {
                $parts = explode('.', $name);
                return $parts[0] ?? 'general';
            })
            ->unique()
            ->sort()
            ->values();

        return $this->successResponse($modules);
    }

    /**
     * GET /api/v1/permissions/stats
     * GET /api/v1/permissions/dashboard
     */
    public function stats(): JsonResponse
    {
        $this->authorizePermission('permission.view');

        $totalPermissions = Permission::where('guard_name', 'api')->count();
        $totalRoles = Role::count();

        $assignedPermissionsCount = DB::table('role_has_permissions')->count();
        $distinctAssigned = DB::table('role_has_permissions')->distinct('permission_id')->count('permission_id');
        $unusedPermissions = max(0, $totalPermissions - $distinctAssigned);
        $avgPermissionsRole = $totalRoles > 0 ? round($assignedPermissionsCount / $totalRoles, 1) : 0;

        $usersCount = DB::table('users')->count();
        $usersWithAccess = DB::table('model_has_roles')->distinct('model_id')->count('model_id');
        $usersWithoutPermission = max(0, $usersCount - $usersWithAccess);

        // Accurate High Risk permissions count based on enterprise standard
        $highRiskPermissions = Permission::where('guard_name', 'api')
            ->where(function ($q) {
                $q->where('name', 'like', '%.delete')
                  ->orWhere('name', 'like', '%.approve')
                  ->orWhere('name', 'like', '%.refund')
                  ->orWhere('name', 'like', '%.return')
                  ->orWhere('name', 'like', 'company.%')
                  ->orWhere('name', 'like', 'role.%')
                  ->orWhere('name', 'like', 'user.%')
                  ->orWhere('name', 'like', 'permission.%')
                  ->orWhere('name', 'like', 'setting.%')
                  ->orWhere('name', 'like', 'audit_log.%');
            })->count();

        $distinctModules = Permission::where('guard_name', 'api')
            ->pluck('name')
            ->map(fn($name) => explode('.', $name)[0] ?? 'general')
            ->unique()
            ->count();

        return $this->successResponse([
            'total_permissions'          => $totalPermissions,
            'active_permissions'         => $totalPermissions,
            'disabled_permissions'       => 0,

            'total_roles'                => $totalRoles,
            'avg_permissions_role'       => $avgPermissionsRole,
            'unused_permissions'         => $unusedPermissions,

            'users_with_access'          => $usersWithAccess,
            'users_without_permission'   => $usersWithoutPermission,

            'high_risk_permissions'      => $highRiskPermissions,
            'unused_access'              => $unusedPermissions,
            'duplicate_rules'            => 0,

            'protected_modules'          => $distinctModules,
            'security_score'             => 100,
        ]);
    }

    /**
     * Format permission model with metadata
     */
    protected function formatPermission(Permission $permission, bool $includeRoles = false): array
    {
        $parts = explode('.', $permission->name);
        $module = $parts[0] ?? 'general';
        $action = count($parts) > 1 ? implode('.', array_slice($parts, 1)) : 'view';

        // Risk classification matching Section 4 specification
        $riskLevel = $this->classifyRisk($module, $action, $permission->name);

        $result = [
            'id'          => $permission->id,
            'name'        => $permission->name,
            'guard_name'  => $permission->guard_name,
            'module'      => $module,
            'action_type' => $action,
            'risk_level'  => $riskLevel,
            'roles_count' => $permission->roles_count ?? $permission->roles()->count(),
            'created_at'  => $permission->created_at?->toISOString(),
            'updated_at'  => $permission->updated_at?->toISOString(),
        ];

        if ($includeRoles && $permission->relationLoaded('roles')) {
            $result['roles'] = $permission->roles->pluck('name');
        }

        return $result;
    }

    /**
     * Standard enterprise risk classification
     */
    protected function classifyRisk(string $module, string $action, string $fullName): string
    {
        $highRiskActions = ['delete', 'force_delete', 'restore', 'approve', 'refund', 'return'];
        $highRiskModules = ['company', 'role', 'user', 'permission', 'setting', 'audit_log'];

        if (in_array($action, $highRiskActions) || in_array($module, $highRiskModules)) {
            return 'high';
        }

        $mediumRiskActions = ['create', 'update', 'edit', 'export', 'import', 'manage', 'process', 'adjust', 'transfer', 'opname'];
        if (in_array($action, $mediumRiskActions)) {
            return 'medium';
        }

        return 'low';
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
