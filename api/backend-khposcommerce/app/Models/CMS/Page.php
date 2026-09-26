<?php

namespace App\Models\CMS;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Traits\SoftDeletesEnterprise;

class Page extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise;

    protected $fillable = [
        'company_id', 'title', 'slug', 'content',
        'status', 'meta_title', 'meta_description',
    ];
}
