<?php

namespace App\Repositories\Eloquent\Product;

use App\Repositories\Eloquent\BaseRepository;
use App\Models\Product\Category;

use App\Repositories\Contracts\Product\CategoryRepositoryInterface;

class CategoryRepository extends BaseRepository implements CategoryRepositoryInterface
{
    public function __construct(Category $model)
    {
        parent::__construct($model);
    }

    public function getRootCategories()
    {
        return $this->model->whereNull('parent_id')->with('children')->get();
    }

    public function getTree()
    {
        return $this->model->whereNull('parent_id')->with('children.children')->get();
    }
}
