<?php

namespace App\Repositories\Eloquent\Setting;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Setting\Language;

class LanguageRepository extends BaseRepository
{
    public function __construct(Language $model)
    {
        parent::__construct($model);
    }
}
