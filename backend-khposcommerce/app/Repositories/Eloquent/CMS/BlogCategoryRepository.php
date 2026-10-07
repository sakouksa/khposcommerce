<?php

namespace App\Repositories\Eloquent\CMS;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\CMS\BlogCategory;

class BlogCategoryRepository extends BaseRepository
{
    public function __construct(BlogCategory $model)
    {
        parent::__construct($model);
    }
}
