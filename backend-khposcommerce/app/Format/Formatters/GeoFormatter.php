<?php

namespace App\Format\Formatters;

use App\Format\ValueObjects\GeoLocation;

class GeoFormatter
{
    /**
     * Format coordinates into standard "lat,lng" string (e.g. "11.5564,104.9282").
     */
    public static function format(mixed $latitude, mixed $longitude = null, int $precision = 6): ?string
    {
        $geo = GeoLocation::tryParse($latitude, $longitude);
        if (!$geo) {
            return null;
        }

        $lat = round($geo->latitude, $precision);
        $lng = round($geo->longitude, $precision);

        return "{$lat},{$lng}";
    }

    /**
     * Parse input to GeoLocation Value Object.
     */
    public static function toObject(mixed $latitude, mixed $longitude = null): ?GeoLocation
    {
        return GeoLocation::tryParse($latitude, $longitude);
    }
}
