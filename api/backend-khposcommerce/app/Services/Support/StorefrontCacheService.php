<?php

namespace App\Services\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Centralized Storefront & Homepage Cache Invalidation Service
 */
class StorefrontCacheService
{
    /**
     * All primary storefront cache keys.
     */
    public const STOREFRONT_KEYS = [
        'storefront_settings_v4',
        'storefront_settings_v5',
        'storefront_homepage_v2',
        'storefront_home_data_v4',
        'storefront_stats_v2',
    ];

    /**
     * Clear all public storefront cached data.
     */
    public static function clearStorefront(): void
    {
        foreach (self::STOREFRONT_KEYS as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Clear homepage catalog and data caches.
     */
    public static function clearHomepage(): void
    {
        Cache::forget('storefront_homepage_v2');
        Cache::forget('storefront_home_data_v4');
    }

    /**
     * Clear announcement-related admin and storefront caches.
     */
    public static function clearAnnouncements(): void
    {
        self::clearStorefront();
        Cache::forget('admin_announcements_list_15');
        Cache::forget('admin_announcements_list_50');
        Cache::forget('admin_announcements_list_100');
    }
}
