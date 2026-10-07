<?php

namespace App\Models\Chatbot;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\Customer\Customer;

class TelegramUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_id',
        'telegram_id',
        'username',
        'first_name',
        'last_name',
        'link_code',
        'link_code_expires_at',
        'linked_at',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'telegram_id'           => 'integer',
        'link_code_expires_at'  => 'datetime',
        'linked_at'             => 'datetime',
        'is_active'             => 'boolean',
        'settings'              => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function isLinked(): bool
    {
        return !is_null($this->customer_id) || !is_null($this->user_id);
    }

    public static function generateLinkCode(int $customerId, ?int $userId = null): string
    {
        $code = (string) random_int(100000, 999999);
        $expiresAt = now()->addMinutes(15);

        $record = static::where('customer_id', $customerId)->first();
        if ($record) {
            $record->link_code = $code;
            $record->link_code_expires_at = $expiresAt;
            $record->save();
        } else {
            static::create([
                'user_id'              => $userId,
                'customer_id'          => $customerId,
                'telegram_id'          => -1 * $customerId,
                'link_code'            => $code,
                'link_code_expires_at' => $expiresAt,
            ]);
        }

        return $code;
    }

    public function getFullNameAttribute(): string
    {
        return trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? '')) ?: ($this->username ?? 'Telegram User');
    }
}
