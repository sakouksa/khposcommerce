<?php

namespace App\Repositories\Eloquent\Setting;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Setting\Province;

class ProvinceRepository extends BaseRepository
{
    public function __construct(Province $model)
    {
        parent::__construct($model);
    }
}
