<?php

namespace App\Repositories\CMS;

use App\Repositories\BaseRepository;
use App\Models\CMS\BlogTag;

class BlogTagRepository extends BaseRepository
{
    public function __construct(BlogTag $model)
    {
        parent::__construct($model);
    }
}
