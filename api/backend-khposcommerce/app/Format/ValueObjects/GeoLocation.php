<?php

namespace App\Format\ValueObjects;

use InvalidArgumentException;
use JsonSerializable;
use Stringable;

class GeoLocation implements JsonSerializable, Stringable
{
    public function __construct(
        public readonly float $latitude,
        public readonly float $longitude
    ) {
        if ($latitude < -90.0 || $latitude > 90.0) {
            throw new InvalidArgumentException("Latitude must be between -90 and 90 degrees: {$latitude}");
        }

        if ($longitude < -180.0 || $longitude > 180.0) {
            throw new InvalidArgumentException("Longitude must be between -180 and 180 degrees: {$longitude}");
        }
    }

    /**
     * Create from coordinates or combined string (e.g. "11.5564, 104.9282").
     */
    public static function from(float|string $latitude, float|string|null $longitude = null): self
    {
        if ($longitude === null && is_string($latitude) && str_contains($latitude, ',')) {
            $parts = explode(',', $latitude);
            return new self((float) trim($parts[0]), (float) trim($parts[1]));
        }

        return new self((float) $latitude, (float) ($longitude ?? 0));
    }

    /**
     * Safely parse coordinates or return null.
     */
    public static function tryParse(mixed $lat, mixed $lng = null): ?self
    {
        try {
            if (empty($lat)) {
                return null;
            }
            return self::from($lat, $lng);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Calculate distance to another location using the Haversine formula (km).
     */
    public function distanceTo(self $other): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $latFrom = deg2rad($this->latitude);
        $lonFrom = deg2rad($this->longitude);
        $latTo   = deg2rad($other->latitude);
        $lonTo   = deg2rad($other->longitude);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return round($angle * $earthRadius, 2);
    }

    public function toArray(): array
    {
        return [
            'latitude'  => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function __toString(): string
    {
        return "{$this->latitude},{$this->longitude}";
    }
}
