<?php

namespace App\Models\CMS;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\SoftDeletes;

class Faq extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['company_id', 'question', 'answer', 'category', 'is_active', 'sort_order'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
