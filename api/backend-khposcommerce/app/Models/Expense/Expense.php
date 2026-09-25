<?php

namespace App\Models\Expense;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\User;

use App\Traits\SoftDeletesEnterprise;
use App\Traits\CleansStorageFiles;

class Expense extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise, CleansStorageFiles;

    protected $fillable = [
        'company_id', 'branch_id', 'expense_category_id', 'user_id',
        'reference_number', 'title', 'description', 'amount', 'date',
        'receipt', 'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date'   => 'date:Y-m-d',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
