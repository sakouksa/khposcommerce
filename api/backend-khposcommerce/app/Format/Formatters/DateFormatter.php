<?php

namespace App\Format\Formatters;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use DateTimeInterface;

class DateFormatter
{
    public const APP_TIMEZONE = 'Asia/Phnom_Penh';
    public const DB_TIMEZONE  = 'UTC';

    /**
     * Get standard application timezone.
     */
    public static function timezone(): string
    {
        return self::APP_TIMEZONE;
    }

    /**
     * Convert date to standard ISO 8601 string in application timezone for API output.
     * Example: 2026-09-13T14:30:00+07:00
     */
    public static function toApi(mixed $date): ?string
    {
        $carbon = self::toCarbon($date);
        if (!$carbon) {
            return null;
        }

        return $carbon->setTimezone(self::APP_TIMEZONE)->toIso8601String();
    }

    /**
     * Convert date to standard date-only string (Y-m-d).
     * Example: 2026-09-13
     */
    public static function toDate(mixed $date): ?string
    {
        $carbon = self::toCarbon($date);
        if (!$carbon) {
            return null;
        }

        return $carbon->setTimezone(self::APP_TIMEZONE)->format('Y-m-d');
    }

    /**
     * Convert date to standard date-time string (Y-m-d H:i:s).
     * Example: 2026-09-13 14:30:00
     */
    public static function toDateTime(mixed $date): ?string
    {
        $carbon = self::toCarbon($date);
        if (!$carbon) {
            return null;
        }

        return $carbon->setTimezone(self::APP_TIMEZONE)->format('Y-m-d H:i:s');
    }

    /**
     * Format into human-readable date & time.
     * Example: 13 Sep 2026, 02:30 PM
     */
    public static function toHuman(mixed $date): ?string
    {
        $carbon = self::toCarbon($date);
        if (!$carbon) {
            return null;
        }

        return $carbon->setTimezone(self::APP_TIMEZONE)->format('d M Y, h:i A');
    }

    /**
     * Parse any input string or timestamp to UTC Carbon for canonical database storage.
     */
    public static function parseToUtc(mixed $input): ?Carbon
    {
        if (empty($input)) {
            return null;
        }

        if ($input instanceof Carbon) {
            return $input->copy()->setTimezone(self::DB_TIMEZONE);
        }

        if ($input instanceof DateTimeInterface) {
            return Carbon::instance($input)->setTimezone(self::DB_TIMEZONE);
        }

        try {
            return Carbon::parse($input, self::APP_TIMEZONE)->setTimezone(self::DB_TIMEZONE);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Safe conversion to Carbon instance.
     */
    protected static function toCarbon(mixed $date): ?Carbon
    {
        if (empty($date)) {
            return null;
        }

        if ($date instanceof Carbon) {
            return $date->copy();
        }

        if ($date instanceof DateTimeInterface) {
            return Carbon::instance($date);
        }

        try {
            return Carbon::parse($date);
        } catch (\Throwable) {
            return null;
        }
    }
}
