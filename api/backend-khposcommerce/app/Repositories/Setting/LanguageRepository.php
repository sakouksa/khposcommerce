<?php

namespace App\Repositories\Setting;

use App\Repositories\BaseRepository;
use App\Models\Setting\Language;

class LanguageRepository extends BaseRepository
{
    public function __construct(Language $model)
    {
        parent::__construct($model);
    }
}
