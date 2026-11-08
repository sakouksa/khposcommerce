<?php

namespace App\Support;

use Illuminate\Support\Facades\Auth;

class TenantScopeHelper
{
    public static function getActiveCompanyId(): ?int
    {
        return Auth::user()?->company_id;
    }

    public static function getActiveBranchId(): ?int
    {
        return Auth::user()?->branch_id;
    }
}
