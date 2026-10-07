<?php

namespace App\Repositories\Eloquent\CMS;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\CMS\Blog;

class BlogRepository extends BaseRepository
{
    public function __construct(Blog $model)
    {
        parent::__construct($model);
    }
}
