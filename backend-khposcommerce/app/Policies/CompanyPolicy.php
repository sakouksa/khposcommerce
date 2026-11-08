<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Company\Company;

class CompanyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('company.view') || $user->hasRole('super_admin');
    }

    public function view(User $user, Company $company): bool
    {
        return $user->hasRole('super_admin') || (int) $user->company_id === (int) $company->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    public function update(User $user, Company $company): bool
    {
        return $user->hasRole('super_admin') || ((int) $user->company_id === (int) $company->id && $user->can('company.update'));
    }

    public function delete(User $user, Company $company): bool
    {
        return $user->hasRole('super_admin');
    }
}
