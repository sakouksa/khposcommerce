<?php

namespace App\Repositories\Eloquent\Setting;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Setting\City;

class CityRepository extends BaseRepository
{
    public function __construct(City $model)
    {
        parent::__construct($model);
    }
}
