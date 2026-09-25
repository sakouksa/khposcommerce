<?php

namespace App\Services\Product;

use App\Repositories\Product\TaxRepository;
use App\Services\BaseService;
use Illuminate\Database\Eloquent\Model;

class TaxService extends BaseService
{
    public function __construct(TaxRepository $repository)
    {
        parent::__construct($repository);
    }

    public function create(array $data): Model
    {
        if (empty($data['company_id'])) {
            $data['company_id'] = auth()->user()?->company_id ?? 1;
        }
        return parent::create($data);
    }
}
