<?php

if (!function_exists('tenant_company_id')) {
    function tenant_company_id(): ?int
    {
        return \App\Support\TenantScopeHelper::getActiveCompanyId();
    }
}

if (!function_exists('tenant_branch_id')) {
    function tenant_branch_id(): ?int
    {
        return \App\Support\TenantScopeHelper::getActiveBranchId();
    }
}
