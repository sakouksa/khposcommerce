<?php

namespace App\Actions\Company;

use App\Models\Company\Company;
use Illuminate\Support\Facades\DB;

class UpdateCompanyAction
{
    public function execute(Company|int|string $company, array $data): Company
    {
        return DB::transaction(function () use ($company, $data) {
            $companyModel = $company instanceof Company ? $company : Company::findOrFail($company);
            $companyModel->update($data);
            return $companyModel;
        });
    }
}
