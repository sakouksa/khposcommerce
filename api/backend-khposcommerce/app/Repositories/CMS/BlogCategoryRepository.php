<?php

namespace App\Repositories\CMS;

use App\Repositories\BaseRepository;
use App\Models\CMS\BlogCategory;

class BlogCategoryRepository extends BaseRepository
{
    public function __construct(BlogCategory $model)
    {
        parent::__construct($model);
    }
}
