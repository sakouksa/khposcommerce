<?php

namespace App\Models\Notification;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Company\Company;
use App\Models\Company\Branch;
use App\Models\User;

class Notification extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'notifications';

    protected $fillable = [
        'company_id',
        'branch_id',
        'type',
        'title',
        'message',
        'icon',
        'color',
        'priority',
        'image',
        'action_url',
        'reference_type',
        'reference_id',
        'created_by',
        'expires_at',
        'is_global',
        'status',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_global' => 'boolean',
    ];

    public function notificationUsers(): HasMany
    {
        return $this->hasMany(NotificationUser::class, 'notification_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(NotificationLog::class, 'notification_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'notification_users', 'notification_id', 'user_id')
                    ->withPivot(['is_read', 'read_at', 'is_archived'])
                    ->withTimestamps();
    }

    // ─── Scopes ─────────────────────────────────────────────────────────────

    public function scopeForCompany($query, $companyId)
    {
        if (!$companyId) return $query;
        return $query->where(function ($q) use ($companyId) {
            $q->where('company_id', $companyId)
              ->orWhereNull('company_id')
              ->orWhere('is_global', true);
        });
    }

    public function scopeForBranch($query, $branchId)
    {
        if (!$branchId) return $query;
        return $query->where(function ($q) use ($branchId) {
            $q->where('branch_id', $branchId)
              ->orWhereNull('branch_id')
              ->orWhere('is_global', true);
        });
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('is_global', true)
              ->orWhereHas('notificationUsers', function ($nu) use ($userId) {
                  $nu->where('user_id', $userId);
              });
        });
    }
}
