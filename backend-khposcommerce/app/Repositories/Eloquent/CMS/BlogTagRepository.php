<?php

namespace App\Repositories\Eloquent\CMS;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\CMS\BlogTag;

class BlogTagRepository extends BaseRepository
{
    public function __construct(BlogTag $model)
    {
        parent::__construct($model);
    }
}
