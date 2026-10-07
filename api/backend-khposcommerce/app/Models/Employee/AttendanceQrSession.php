<?php

namespace App\Models\Employee;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Company\Company;
use App\Models\Company\Branch;

class AttendanceQrSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'branch_id',
        'shift_id',
        'qr_token',
        'random_uuid',
        'secret_signature',
        'qr_expired_at',
        'interval_seconds',
        'is_standee',
        'checkpoint_name',
        'radius_meters',
        'wifi_ssid',
        'gps_latitude',
        'gps_longitude',
        'is_active',
        'revoked_at',
    ];

    protected $casts = [
        'qr_expired_at'    => 'datetime',
        'interval_seconds' => 'integer',
        'is_standee'       => 'boolean',
        'radius_meters'    => 'integer',
        'gps_latitude'     => 'decimal:8',
        'gps_longitude'    => 'decimal:8',
        'is_active'        => 'boolean',
        'revoked_at'       => 'datetime',
    ];

    /**
     * Scope for active, unrevoked and unexpired sessions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->whereNull('revoked_at')
            ->where('qr_expired_at', '>', now());
    }

    /**
     * Scope for company entrance standee sessions.
     */
    public function scopeStandee($query)
    {
        return $query->where('is_standee', true);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }
}
