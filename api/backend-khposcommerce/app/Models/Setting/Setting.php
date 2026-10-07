<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Company\Company;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = ['company_id', 'key', 'value', 'type'];

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }

    public static function getByKey(string $key, ?int $companyId = null, $default = null)
    {
        $query = self::where('key', $key);
        if ($companyId) {
            $query->where('company_id', $companyId);
        }
        $setting = $query->first();
        if (!$setting) return $default;

        return match ($setting->type) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $setting->value,
            'json'    => json_decode($setting->value, true),
            default   => $setting->value,
        };
    }
}
