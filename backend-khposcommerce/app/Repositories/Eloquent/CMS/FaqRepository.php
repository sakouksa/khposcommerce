<?php

namespace App\Repositories\Eloquent\CMS;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\CMS\Faq;

class FaqRepository extends BaseRepository
{
    public function __construct(Faq $model)
    {
        parent::__construct($model);
    }
}
