<?php

namespace App\Repositories\Setting;

use App\Repositories\BaseRepository;
use App\Models\Setting\City;

class CityRepository extends BaseRepository
{
    public function __construct(City $model)
    {
        parent::__construct($model);
    }
}
