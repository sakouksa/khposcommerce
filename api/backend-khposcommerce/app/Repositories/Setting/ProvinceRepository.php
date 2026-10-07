<?php

namespace App\Repositories\Setting;

use App\Repositories\BaseRepository;
use App\Models\Setting\Province;

class ProvinceRepository extends BaseRepository
{
    public function __construct(Province $model)
    {
        parent::__construct($model);
    }
}
