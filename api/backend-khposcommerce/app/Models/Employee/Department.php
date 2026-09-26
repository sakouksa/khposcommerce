<?php

namespace App\Models\Employee;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['company_id', 'branch_id', 'name', 'code', 'description', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Company\Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Company\Branch::class);
    }

    public function positions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\Employee\Position::class);
    }

    public function employees(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\Employee\Employee::class);
    }
}
