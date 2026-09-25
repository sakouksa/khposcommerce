<?php

namespace App\Models\Log;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class LoginHistory extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'ip_address', 'user_agent', 'device', 'browser', 'platform', 'success'];

    protected $casts = [
        'success' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($history) {
            $parsed = self::parseUserAgent($history->user_agent);
            $history->device = $history->device ?? $parsed['device'];
            $history->browser = $history->browser ?? $parsed['browser'];
            $history->platform = $history->platform ?? $parsed['platform'];
        });
    }

    public static function parseUserAgent(?string $userAgent): array
    {
        if (empty($userAgent)) {
            return ['device' => 'Unknown', 'browser' => 'Unknown', 'platform' => 'Unknown'];
        }

        // Platform
        $platform = 'Unknown';
        if (preg_match('/linux/i', $userAgent)) {
            $platform = 'Linux';
        } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
            $platform = 'macOS';
        } elseif (preg_match('/windows|win32/i', $userAgent)) {
            $platform = 'Windows';
        } elseif (preg_match('/android/i', $userAgent)) {
            $platform = 'Android';
        } elseif (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
            $platform = 'iOS';
        }

        // Browser
        $browser = 'Unknown';
        if (preg_match('/chrome/i', $userAgent) && !preg_match('/edge|edg/i', $userAgent) && !preg_match('/opr/i', $userAgent)) {
            $browser = 'Chrome';
        } elseif (preg_match('/safari/i', $userAgent) && !preg_match('/chrome/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/firefox/i', $userAgent)) {
            $browser = 'Firefox';
        } elseif (preg_match('/edge|edg/i', $userAgent)) {
            $browser = 'Edge';
        } elseif (preg_match('/opr|opera/i', $userAgent)) {
            $browser = 'Opera';
        }

        // Device
        $device = 'Desktop';
        if (preg_match('/mobile|phone/i', $userAgent)) {
            $device = 'Mobile';
        } elseif (preg_match('/tablet|ipad/i', $userAgent)) {
            $device = 'Tablet';
        }

        return compact('device', 'browser', 'platform');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
