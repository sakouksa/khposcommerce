<?php

namespace App\Actions\Company;

use App\Models\Company\Company;
use Illuminate\Support\Facades\DB;

class CreateCompanyAction
{
    public function execute(array $data): Company
    {
        return DB::transaction(function () use ($data) {
            return Company::create($data);
        });
    }
}
