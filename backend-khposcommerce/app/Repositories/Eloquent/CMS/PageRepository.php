<?php

namespace App\Repositories\Eloquent\CMS;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\CMS\Page;

class PageRepository extends BaseRepository
{
    public function __construct(Page $model)
    {
        parent::__construct($model);
    }
}
