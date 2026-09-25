<?php

namespace App\Repositories\Setting;

use App\Repositories\BaseRepository;
use App\Models\Setting\Country;

class CountryRepository extends BaseRepository
{
    public function __construct(Country $model)
    {
        parent::__construct($model);
    }
}
