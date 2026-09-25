<?php

namespace App\Format;

use App\Enums\CurrencyCode;
use App\Format\Formatters\DateFormatter;
use App\Format\Formatters\EmailFormatter;
use App\Format\Formatters\GeoFormatter;
use App\Format\Formatters\IdentifierFormatter;
use App\Format\Formatters\MoneyFormatter;
use App\Format\Formatters\NumberFormatter;
use App\Format\Formatters\PhoneFormatter;
use App\Format\Formatters\SecurityFormatter;
use App\Format\Formatters\StateFormatter;
use App\Format\Formatters\StorageFormatter;
use App\Format\ValueObjects\Dimension;
use App\Format\ValueObjects\GeoLocation;
use App\Format\ValueObjects\Money;
use App\Format\ValueObjects\PhoneNumber;
use App\Services\Support\ReferenceNumberService;
use Carbon\Carbon;

/**
 * Global Unified Formatting Facade for Laravel Enterprise
 * Single Source of Truth covering all 38 enterprise formatting & normalization standards.
 */
class GlobalFormat
{
    // ─── 1. DATE, TIME & TIMEZONE ──────────────────────────────────────
    public static function date(mixed $date): ?string
    {
        return DateFormatter::toApi($date);
    }

    public static function dateOnly(mixed $date): ?string
    {
        return DateFormatter::toDate($date);
    }

    public static function dateTime(mixed $date): ?string
    {
        return DateFormatter::toDateTime($date);
    }

    public static function dateHuman(mixed $date): ?string
    {
        return DateFormatter::toHuman($date);
    }

    public static function timezone(): string
    {
        return DateFormatter::timezone();
    }

    public static function dateToUtc(mixed $date): ?Carbon
    {
        return DateFormatter::parseToUtc($date);
    }

    // ─── 2. CONTACT: PHONE & EMAIL ────────────────────────────────────
    public static function phone(?string $phone): ?string
    {
        return PhoneFormatter::normalize($phone);
    }

    public static function phoneLocal(?string $phone): ?string
    {
        return PhoneFormatter::toLocal($phone);
    }

    public static function phoneMask(?string $phone): ?string
    {
        return PhoneFormatter::mask($phone);
    }

    public static function phoneValid(?string $phone): bool
    {
        return PhoneFormatter::isValid($phone);
    }

    public static function phoneObject(?string $phone): PhoneNumber
    {
        return PhoneNumber::from($phone);
    }

    public static function email(?string $email): ?string
    {
        return EmailFormatter::normalize($email);
    }

    public static function emailMask(?string $email): ?string
    {
        return EmailFormatter::mask($email);
    }

    // ─── 3. MONEY, CURRENCY & NUMBERS ─────────────────────────────────
    public static function money(float|int|string $amount, string|CurrencyCode $currency = 'USD', bool $withSymbol = true): string
    {
        return MoneyFormatter::format($amount, $currency, $withSymbol);
    }

    public static function moneyRound(float|int $amount, string|CurrencyCode $currency = 'USD'): float
    {
        return MoneyFormatter::round($amount, $currency);
    }

    public static function moneyObject(float|int|string $amount, string|CurrencyCode $currency = 'USD'): Money
    {
        return Money::from($amount, $currency);
    }

    public static function currencySymbol(string|CurrencyCode $currency = 'USD'): string
    {
        if ($currency instanceof CurrencyCode) {
            return $currency->symbol();
        }
        return CurrencyCode::tryFrom(strtoupper($currency))?->symbol() ?? '$';
    }

    public static function decimal(mixed $val, int $precision = 2): float
    {
        return NumberFormatter::decimal($val, $precision);
    }

    public static function percentage(mixed $val, int $precision = 2): float
    {
        return NumberFormatter::percentage($val, $precision);
    }

    public static function integer(mixed $val): int
    {
        return NumberFormatter::integer($val);
    }

    public static function quantity(mixed $val, int $precision = 3): float
    {
        return NumberFormatter::quantity($val, $precision);
    }

    public static function weight(mixed $val, int $precision = 3): float
    {
        return NumberFormatter::weight($val, $precision);
    }

    public static function exchangeRate(mixed $val, int $precision = 4): float
    {
        return NumberFormatter::exchangeRate($val, $precision);
    }

    public static function dimension(float $length, float $width, float $height, string $unit = 'cm'): Dimension
    {
        return Dimension::from($length, $width, $height, $unit);
    }

    // ─── 4. IDENTIFIERS & PRODUCT METRICS ─────────────────────────────
    public static function sku(?string $sku = null, ?string $prefix = null): string
    {
        return $sku !== null
            ? (IdentifierFormatter::sku($sku, $prefix) ?? ReferenceNumberService::sku($prefix ?? 'SKU'))
            : ReferenceNumberService::sku($prefix ?? 'SKU');
    }

    public static function barcode(?string $barcode): ?string
    {
        return IdentifierFormatter::barcode($barcode);
    }

    public static function isBarcodeValid(?string $barcode): bool
    {
        return IdentifierFormatter::isValidBarcode($barcode);
    }

    public static function imei(?string $imei): ?string
    {
        return IdentifierFormatter::imei($imei);
    }

    public static function isImeiValid(?string $imei): bool
    {
        return IdentifierFormatter::isValidImei($imei);
    }

    public static function imeiMask(?string $imei): ?string
    {
        return IdentifierFormatter::maskImei($imei);
    }

    public static function uuid(): string
    {
        return IdentifierFormatter::uuid();
    }

    public static function isUuid(?string $uuid): bool
    {
        return IdentifierFormatter::isValidUuid($uuid);
    }

    public static function unit(?string $unit): string
    {
        return IdentifierFormatter::unit($unit);
    }

    public static function taxId(?string $taxId, ?string $prefix = null): ?string
    {
        return IdentifierFormatter::taxId($taxId, $prefix);
    }

    // ─── 5. BUSINESS CODES & REFERENCE NUMBERS ────────────────────────
    public static function invoice(string $prefix = 'INV-'): string
    {
        return ReferenceNumberService::invoice($prefix);
    }

    public static function order(string $prefix = 'ORD-'): string
    {
        return ReferenceNumberService::order($prefix);
    }

    public static function purchaseOrder(string $prefix = 'PO-'): string
    {
        return ReferenceNumberService::purchaseOrder($prefix);
    }

    public static function payment(string $prefix = 'PAY-'): string
    {
        return ReferenceNumberService::payment($prefix);
    }

    public static function companyCode(string $prefix = 'CMP-'): string
    {
        return ReferenceNumberService::company($prefix);
    }

    public static function branchCode(string $prefix = 'BR-'): string
    {
        return ReferenceNumberService::branch($prefix);
    }

    public static function warehouseCode(string $prefix = 'WH-'): string
    {
        return ReferenceNumberService::warehouse($prefix);
    }

    public static function customerCode(string $prefix = 'CUS-'): string
    {
        return ReferenceNumberService::customer($prefix);
    }

    public static function employeeCode(string $prefix = 'EMP-'): string
    {
        return ReferenceNumberService::employee($prefix);
    }

    public static function trackingNumber(string $prefix = 'KH'): string
    {
        return ReferenceNumberService::trackingNumber($prefix);
    }

    // ─── 6. SECURITY, AUDIT & LOCATION ────────────────────────────────
    public static function bankAccountMask(?string $account): ?string
    {
        return SecurityFormatter::maskBankAccount($account);
    }

    public static function ip(?string $ip): ?string
    {
        return SecurityFormatter::normalizeIp($ip);
    }

    public static function ipAnonymize(?string $ip): ?string
    {
        return SecurityFormatter::anonymizeIp($ip);
    }

    public static function userAgent(?string $ua): string
    {
        return SecurityFormatter::summarizeUserAgent($ua);
    }

    public static function coordinates(mixed $lat, mixed $lng = null): ?string
    {
        return GeoFormatter::format($lat, $lng);
    }

    public static function geoLocation(mixed $lat, mixed $lng = null): ?GeoLocation
    {
        return GeoFormatter::toObject($lat, $lng);
    }

    // ─── 7. STORAGE, FILES & METADATA ─────────────────────────────────
    public static function filePath(?string $path): ?string
    {
        return StorageFormatter::normalizePath($path);
    }

    public static function datedFilePath(string $folder, string $filename): string
    {
        return StorageFormatter::datedPath($folder, $filename);
    }

    public static function fileSizeHuman(int|float|null $bytes): string
    {
        return StorageFormatter::humanSize($bytes);
    }

    public static function bytes(int|float|null $bytes): string
    {
        return StorageFormatter::humanSize($bytes);
    }

    public static function fileSizeBytes(string $formatted): int
    {
        return StorageFormatter::parseToBytes($formatted);
    }

    // ─── 8. APPLICATION STATE, ENUMS & JSON ───────────────────────────
    public static function boolean(mixed $val): bool
    {
        return StateFormatter::boolean($val);
    }

    public static function pagination(mixed $paginator, ?int $page = null, ?int $perPage = null, ?int $total = null): array
    {
        return StateFormatter::paginationMeta($paginator, $page, $perPage, $total);
    }

    public static function statusBadge(mixed $status): array
    {
        return StateFormatter::statusBadge($status);
    }

    public static function json(mixed $data): array
    {
        return StateFormatter::cleanJson($data);
    }

    public static function toJson(mixed $data, bool $pretty = false): string
    {
        return StateFormatter::toJson($data, $pretty);
    }
}
