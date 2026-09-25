<?php

namespace App\Models\Auth;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class JwtRefreshToken extends Model
{
    protected $fillable = [
        'user_id',
        'device_id',
        'device_name',
        'device_type',
        'token',
        'device',
        'browser',
        'os',
        'platform',
        'app_version',
        'ip_address',
        'expires_at',
        'last_active_at',
        'revoked',
        'status',
        'revoked_at',
        'revoked_by',
    ];

    protected $casts = [
        'expires_at'     => 'datetime',
        'last_active_at' => 'datetime',
        'revoked_at'     => 'datetime',
        'revoked'        => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function revokedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    public function isValid(): bool
    {
        return !$this->revoked && $this->status === 'active' && $this->expires_at->isFuture();
    }

    public function revoke(?int $revokedById = null): void
    {
        $this->update([
            'revoked'    => true,
            'status'     => 'revoked',
            'revoked_at' => now(),
            'revoked_by' => $revokedById,
        ]);
    }

    public function markSuspicious(): void
    {
        $this->update([
            'status' => 'suspicious',
        ]);
    }

    public function updateLastActive(): void
    {
        $this->update([
            'last_active_at' => now(),
        ]);
    }

    public function scopeActive($query)
    {
        return $query->where('revoked', false)
            ->where('status', 'active')
            ->where('expires_at', '>', now());
    }
}
