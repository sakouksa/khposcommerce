<?php

namespace App\Http\Resources;

use App\Format\GlobalFormat;
use App\Http\Resources\Traits\FormatsMediaUrl;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;
use UnitEnum;

/**
 * Base Enterprise JSON Resource providing unified serialization helpers.
 */
class BaseJsonResource extends JsonResource
{
    use FormatsMediaUrl;

    /**
     * Format a date into ISO-8601 string in Asia/Phnom_Penh.
     */
    protected function formatDate(mixed $date): ?string
    {
        return GlobalFormat::date($date);
    }

    /**
     * Format a date into Y-m-d.
     */
    protected function formatDateOnly(mixed $date): ?string
    {
        return GlobalFormat::dateOnly($date);
    }

    /**
     * Format a monetary amount into a structured API response object.
     */
    protected function formatMoney(float|int|string|null $amount, string $currency = 'USD'): ?array
    {
        if ($amount === null) {
            return null;
        }

        return GlobalFormat::moneyObject($amount, $currency)->toArray();
    }

    /**
     * Format a phone number into structured E.164 and local representation.
     */
    protected function formatPhone(?string $phone): ?array
    {
        if (!$phone) {
            return null;
        }

        return GlobalFormat::phoneObject($phone)->toArray();
    }

    /**
     * Format a BackedEnum into a structured status object with Khmer and badge support.
     */
    protected function formatEnum(mixed $enum): ?array
    {
        if (!$enum) {
            return null;
        }

        if ($enum instanceof UnitEnum) {
            return [
                'value'    => $enum->value ?? $enum->name,
                'label'    => method_exists($enum, 'label') ? $enum->label() : ($enum->value ?? $enum->name),
                'label_kh' => method_exists($enum, 'labelKhmer') ? $enum->labelKhmer() : null,
                'badge'    => method_exists($enum, 'badgeColor') ? $enum->badgeColor() : null,
            ];
        }

        return [
            'value'    => (string) $enum,
            'label'    => ucfirst((string) $enum),
            'label_kh' => null,
            'badge'    => null,
        ];
    }
}
