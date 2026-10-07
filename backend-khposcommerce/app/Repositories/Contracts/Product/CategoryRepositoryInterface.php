<?php

namespace App\Repositories\Contracts\Product;

use App\Repositories\Contracts\BaseRepositoryInterface;

interface CategoryRepositoryInterface extends BaseRepositoryInterface
{
    public function getRootCategories();
    public function getTree();
}
