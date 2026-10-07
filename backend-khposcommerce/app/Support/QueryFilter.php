<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

abstract class QueryFilter
{
    protected array $filters = [];

    public function apply(Builder $builder, array $filters): Builder
    {
        $this->filters = $filters;

        foreach ($this->filters as $name => $value) {
            if (method_exists($this, $name) && $value !== null && $value !== '') {
                $this->$name($builder, $value);
            }
        }

        return $builder;
    }
}
