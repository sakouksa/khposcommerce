<?php

namespace App\Repositories\Eloquent\Setting;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Setting\Country;

class CountryRepository extends BaseRepository
{
    public function __construct(Country $model)
    {
        parent::__construct($model);
    }
}
