<?php

namespace App\Http\Middleware;

use App\Models\Company\Branch;
use App\Models\Company\Company;
use App\Services\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enterprise Multi-Tenant & Multi-Branch Scope Enforcement Middleware
 *
 * Guarantees that every authenticated request is verified against the user's
 * authorized Company and Branch boundaries before reaching controllers.
 *
 * Authorization Protocol:
 *   - Permission = WHAT can do (checked by Spatie RBAC)
 *   - Scope      = WHERE can do (enforced by this middleware & TenantContext)
 *   - Policy     = WHICH record can do (enforced by Model Policies)
 */
class EnforceTenantScope
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Pass through for unauthenticated routes (let auth middleware handle authentication)
        if (!$user) {
            return $next($request);
        }

        // ─── 1. Enforce Company Scope ──────────────────────────────────────────
        $requestedCompany = $request->header('X-Company-Id') ?? $request->input('company_id');
        $activeCompanyId = (int) ($user->company_id ?? 1);

        if ($user->hasRole('super_admin')) {
            if ($requestedCompany !== null && $requestedCompany !== '') {
                $compExists = Company::where('id', (int) $requestedCompany)->where('is_active', true)->exists();
                if (!$compExists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Requested company not found or inactive.',
                        'error'   => 'COMPANY_NOT_FOUND',
                    ], 404);
                }
                $activeCompanyId = (int) $requestedCompany;
            }
        } else {
            // All non-super_admin users are strictly pinned to their company
            if ($requestedCompany !== null && $requestedCompany !== '' && (int) $requestedCompany !== $activeCompanyId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cross-company access denied. You are only authorized for your assigned company.',
                    'error'   => 'COMPANY_SCOPE_DENIED',
                ], 403);
            }
        }

        // ─── 2. Enforce Branch Scope ───────────────────────────────────────────
        $requestedBranch = $request->header('X-Branch-Id') ?? $request->input('branch_id');
        $activeBranchId = null;

        if ($user->hasRole('super_admin')) {
            if ($requestedBranch !== null && $requestedBranch !== '') {
                $branchValid = Branch::where('id', (int) $requestedBranch)
                    ->where('company_id', $activeCompanyId)
                    ->where('is_active', true)
                    ->exists();

                if (!$branchValid) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Requested branch does not belong to active company or is inactive.',
                        'error'   => 'BRANCH_NOT_FOUND',
                    ], 404);
                }
                $activeBranchId = (int) $requestedBranch;
            }
        } elseif ($user->hasRole('owner')) {
            if ($requestedBranch !== null && $requestedBranch !== '') {
                $branchValid = Branch::where('id', (int) $requestedBranch)
                    ->where('company_id', $activeCompanyId)
                    ->where('is_active', true)
                    ->exists();

                if (!$branchValid) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Requested branch does not belong to your company.',
                        'error'   => 'BRANCH_SCOPE_DENIED',
                    ], 403);
                }
                $activeBranchId = (int) $requestedBranch;
            }
        } else {
            // Manager, Cashier, Warehouse Staff, Staff
            $accessibleBranches = $user->accessibleBranchIds();

            if (empty($accessibleBranches)) {
                return response()->json([
                    'success' => false,
                    'message' => 'User has no accessible branches assigned in this company.',
                    'error'   => 'NO_ACCESSIBLE_BRANCH',
                ], 403);
            }

            if ($requestedBranch !== null && $requestedBranch !== '') {
                $requestedId = (int) $requestedBranch;
                if (!in_array($requestedId, $accessibleBranches, true)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Branch scope access denied. You are not authorized for this branch.',
                        'error'   => 'BRANCH_SCOPE_DENIED',
                    ], 403);
                }
                $activeBranchId = $requestedId;
            } else {
                $activeBranchId = $user->getActiveBranchId($request);
            }
        }

        // ─── 3. Enforce Warehouse Scope (if supplied in header or input) ─────────
        $requestedWarehouse = $request->header('X-Warehouse-Id') ?? $request->input('warehouse_id');
        $activeWarehouseId = null;

        if ($requestedWarehouse !== null && $requestedWarehouse !== '') {
            $reqWhId = (int) $requestedWarehouse;

            // 1. Warehouse must exist in the active company
            $warehouse = \App\Models\Company\Warehouse::where('id', $reqWhId)
                ->where('company_id', $activeCompanyId)
                ->where('is_active', true)
                ->first();

            if (!$warehouse) {
                return response()->json([
                    'success' => false,
                    'message' => 'Requested warehouse does not belong to the active company or is inactive.',
                    'error'   => 'WAREHOUSE_SCOPE_DENIED',
                ], 403);
            }

            // 2. If branch is pinned, warehouse must belong to the active branch
            if ($activeBranchId !== null && (int) $warehouse->branch_id !== (int) $activeBranchId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Requested warehouse does not belong to the active branch.',
                    'error'   => 'WAREHOUSE_BRANCH_MISMATCH',
                ], 403);
            }

            // 3. For non-super_admin / non-owner, user must have access to this warehouse
            if (!$user->hasRole(['super_admin', 'owner']) && !$user->canAccessWarehouse($reqWhId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Warehouse scope access denied. You are not authorized for this warehouse.',
                    'error'   => 'WAREHOUSE_ACCESS_DENIED',
                ], 403);
            }

            $activeWarehouseId = $reqWhId;
        }

        // ─── 4. Set Request-Scoped Tenant Context ──────────────────────────────
        TenantContext::setContext($activeCompanyId, $activeBranchId, $activeWarehouseId);

        $request->attributes->set('tenant_company_id', $activeCompanyId);
        $request->attributes->set('tenant_branch_id', $activeBranchId);
        $request->attributes->set('tenant_warehouse_id', $activeWarehouseId);

        return $next($request);
    }
}
