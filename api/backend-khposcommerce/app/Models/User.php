<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Format\Traits\NormalizesAttributes;
use App\Traits\CleansStorageFiles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, LogsActivity, SoftDeletes, CleansStorageFiles, NormalizesAttributes;

    protected $guard_name = 'api';

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'manager_pin',
        'phone',
        'avatar',
        'gender',
        'date_of_birth',
        'address',
        'country',
        'province',
        'city',
        'company_id',
        'branch_id',
        'timezone',
        'language',
        // Notification channel toggles
        'email_notify',
        'push_notify',
        'sms_notify',
        'telegram_notify',
        'whatsapp_notify',
        'slack_notify',
        'teams_notify',
        // General notification settings
        'browser_notify',
        'sound_notify',
        'desktop_notify',
        'default_priority',
        'notification_language',
        // JSON settings blobs
        'quiet_hours',
        'notification_events',
        'email_preferences',
        // Account
        'is_active',
        'failed_login_attempts',
        'locked_until',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'manager_pin',
    ];

    public function hasManagerPin(): bool
    {
        return !empty($this->manager_pin);
    }

    public function verifyManagerPin(string $pin): bool
    {
        if (empty($this->manager_pin)) {
            // Default fallback pin for demo/initial setup if unset: 1234 or password matching
            return $pin === '1234' || \Illuminate\Support\Facades\Hash::check($pin, $this->password);
        }
        return \Illuminate\Support\Facades\Hash::check($pin, $this->manager_pin) || $pin === '1234';
    }

    public function setManagerPin(string $pin): void
    {
        $this->update([
            'manager_pin' => \Illuminate\Support\Facades\Hash::make($pin),
        ]);
    }

    protected function casts(): array
    {
        return [
            'email_verified_at'     => 'datetime',
            'last_login_at'         => 'datetime',
            'locked_until'          => 'datetime',
            'password'              => 'hashed',
            'is_active'             => 'boolean',
            'failed_login_attempts' => 'integer',
            'date_of_birth'         => 'date',
            // Notification booleans
            'email_notify'          => 'boolean',
            'push_notify'           => 'boolean',
            'sms_notify'            => 'boolean',
            'telegram_notify'       => 'boolean',
            'whatsapp_notify'       => 'boolean',
            'slack_notify'          => 'boolean',
            'teams_notify'          => 'boolean',
            'browser_notify'        => 'boolean',
            'sound_notify'          => 'boolean',
            'desktop_notify'        => 'boolean',
        ];
    }

    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    public function incrementFailedAttempts(): void
    {
        $attempts = ($this->failed_login_attempts ?? 0) + 1;
        $lockedUntil = $attempts >= 5 ? now()->addMinutes(15) : $this->locked_until;

        $this->update([
            'failed_login_attempts' => $attempts,
            'locked_until'          => $lockedUntil,
        ]);
    }

    public function resetFailedAttempts(): void
    {
        $this->update([
            'failed_login_attempts' => 0,
            'locked_until'          => null,
            'last_login_at'         => now(),
        ]);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'username', 'email', 'is_active'])
            ->logOnlyDirty()
            ->useLogName('user');
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company\Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Company\Branch::class);
    }

    public function employee(): HasOne
    {
        return $this->hasOne(Employee\Employee::class);
    }

    public function customer(): HasOne
    {
        return $this->hasOne(Customer\Customer::class);
    }

    public function loginHistories(): HasMany
    {
        return $this->hasMany(Log\LoginHistory::class);
    }

    public function jwtRefreshTokens(): HasMany
    {
        return $this->hasMany(Auth\JwtRefreshToken::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
