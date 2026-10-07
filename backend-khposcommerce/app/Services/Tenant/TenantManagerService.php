<?php

namespace App\Services\Tenant;

use App\Models\Company\Company;
use App\Models\Company\Branch;

class TenantManagerService
{
    protected ?Company $currentCompany = null;
    protected ?Branch $currentBranch = null;

    public function setCompany(?Company $company): self
    {
        $this->currentCompany = $company;
        return $this;
    }

    public function getCompany(): ?Company
    {
        return $this->currentCompany;
    }

    public function setBranch(?Branch $branch): self
    {
        $this->currentBranch = $branch;
        return $this;
    }

    public function getBranch(): ?Branch
    {
        return $this->currentBranch;
    }

    public function getCompanyId(): ?int
    {
        return $this->currentCompany?->id;
    }

    public function getBranchId(): ?int
    {
        return $this->currentBranch?->id;
    }
}
