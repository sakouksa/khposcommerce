<?php

namespace App\Services\POS;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BakongKHQRService
{
    /**
     * Calculate CRC-16/CCITT-FALSE (poly: 0x1021, init: 0xFFFF)
     */
    public static function crc16(string $data): string
    {
        $crc = 0xFFFF;
        $length = strlen($data);
        for ($i = 0; $i < $length; $i++) {
            $x = (($crc >> 8) ^ ord($data[$i])) & 0xFF;
            $x ^= $x >> 4;
            $crc = (($crc << 8) ^ ($x << 12) ^ ($x << 5) ^ $x) & 0xFFFF;
        }
        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }

    /**
     * Format an EMVCo TLV data object (Tag, Length, Value)
     */
    public static function formatTLV(string $tag, string $value): string
    {
        $len = str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT);
        return "{$tag}{$len}{$value}";
    }

    /**
     * Generate standard NBC Bakong KHQR dynamic payload
     */
    public function generate(
        float $amount,
        string $currency = 'USD',
        ?string $billNumber = null,
        ?string $accountId = null,
        ?string $merchantName = null,
        ?string $merchantCity = null,
        ?string $accountInformation = null,
        ?string $acquiringBank = null,
        ?string $mobileNumber = null
    ): array {
        $dbSettings = \App\Models\Setting\Setting::getByKey('bakong_payment_settings');
        if (is_string($dbSettings)) {
            $dbSettings = json_decode($dbSettings, true);
        }
        if (!is_array($dbSettings)) {
            $dbSettings = [];
        }

        $accountId          = $accountId ?: ($dbSettings['account_id'] ?? config('services.bakong.account_id', 'khqr@aclb'));
        $merchantName       = $merchantName ?: ($dbSettings['merchant_name'] ?? config('services.bakong.merchant_name', 'SAK OUSA'));
        $merchantCity       = $merchantCity ?: ($dbSettings['merchant_city'] ?? config('services.bakong.merchant_city', 'Phnom Penh'));
        $accountInformation = $accountInformation ?: ($dbSettings['account_information'] ?? config('services.bakong.account_information', '85520019493'));
        $acquiringBank      = $acquiringBank ?: ($dbSettings['acquiring_bank'] ?? config('services.bakong.acquiring_bank', 'ACLEDA'));
        $mobileNumber       = $mobileNumber ?: ($dbSettings['mobile_number'] ?? config('services.bakong.mobile_number', '0762825595'));
        $billNumber         = $billNumber ?: 'KHQR-' . strtoupper(substr(uniqid(), -6));
        $isUSD              = strtoupper($currency) === 'USD';
        $currencyCode       = $isUSD ? '840' : '116';
        $amountFormatted    = $isUSD ? number_format($amount, 2, '.', '') : (string) round($amount);

        // Tag 29: Individual / Bakong Account Information Sub-tags
        $tag29Value = self::formatTLV('00', $accountId);
        if ($accountInformation) {
            $tag29Value .= self::formatTLV('01', $accountInformation);
        }
        if ($acquiringBank) {
            $tag29Value .= self::formatTLV('02', $acquiringBank);
        }
        $tag29 = self::formatTLV('29', $tag29Value);

        // Tag 62: Additional Data Sub-tags
        $tag62Value  = self::formatTLV('01', $billNumber);
        if ($mobileNumber) {
            $tag62Value .= self::formatTLV('02', $mobileNumber);
        }
        $tag62Value .= self::formatTLV('03', 'OptaPOS Store');
        $tag62Value .= self::formatTLV('07', 'POS-01');
        $tag62 = self::formatTLV('62', $tag62Value);

        // Tag 99: Expiration Timestamp (5 minutes)
        $nowMs = round(microtime(true) * 1000);
        $expMs = $nowMs + (5 * 60 * 1000);
        $tag99Value  = self::formatTLV('00', (string) $nowMs);
        $tag99Value .= self::formatTLV('01', (string) $expMs);
        $tag99 = self::formatTLV('99', $tag99Value);

        // Build Payload
        $payload  = self::formatTLV('00', '01');          // Payload Format Indicator
        $payload .= self::formatTLV('01', '12');          // Dynamic QR
        $payload .= $tag29;                               // Merchant / Account Tag
        $payload .= self::formatTLV('52', '5999');        // MCC
        $payload .= self::formatTLV('53', $currencyCode); // Currency
        $payload .= self::formatTLV('54', $amountFormatted); // Amount
        $payload .= self::formatTLV('58', 'KH');          // Country Code
        $payload .= self::formatTLV('59', $merchantName); // Merchant Name
        $payload .= self::formatTLV('60', $merchantCity); // Merchant City
        $payload .= $tag62;                               // Additional Data
        $payload .= $tag99;                               // Timestamp

        // CRC16 Calculation
        $payloadWithTag63 = $payload . '6304';
        $crc = self::crc16($payloadWithTag63);
        $finalQRString = $payloadWithTag63 . $crc;

        $md5 = md5($finalQRString);

        return [
            'qr'            => $finalQRString,
            'md5'           => $md5,
            'amount'        => (float) $amountFormatted,
            'currency'      => $isUSD ? 'USD' : 'KHR',
            'bill_number'   => $billNumber,
            'account_id'    => $accountId,
            'bank_name'     => config('services.bakong.bank_name', 'ACLEDA Bank'),
            'merchant_name' => $merchantName,
            'merchant_city' => $merchantCity,
            'expires_at'    => date('Y-m-d H:i:s', ($expMs / 1000)),
        ];
    }

    /**
     * Check transaction status by MD5 on official NBC Bakong Open API
     */
    public function checkTransactionByMd5(string $md5): array
    {
        $dbSettings = \App\Models\Setting\Setting::getByKey('bakong_payment_settings');
        if (is_string($dbSettings)) {
            $dbSettings = json_decode($dbSettings, true);
        }
        $dbToken = is_array($dbSettings) ? ($dbSettings['token'] ?? null) : null;
        $dbUrl   = is_array($dbSettings) ? ($dbSettings['api_url'] ?? $dbSettings['url'] ?? null) : null;

        $apiUrl = rtrim($dbUrl ?: config('services.bakong.url', 'https://api-bakong.nbc.gov.kh/v1'), '/');
        $token  = $dbToken ?: config('services.bakong.token');

        if (empty($token)) {
            Log::warning('Bakong API Token not configured in settings or services.bakong.token');
            return [
                'is_paid'         => false,
                'response_code'   => 1,
                'response_message'=> 'Bakong API Token not configured',
                'data'            => null,
            ];
        }

        try {
            $response = Http::timeout(6)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type'  => 'application/json',
                    'Accept'        => 'application/json',
                ])
                ->post("{$apiUrl}/check_transaction_by_md5", [
                    'md5' => $md5,
                ]);

            if ($response->successful()) {
                $body = $response->json();
                $isPaid = isset($body['responseCode']) && (int) $body['responseCode'] === 0 && !empty($body['data']);

                return [
                    'is_paid'          => $isPaid,
                    'response_code'    => $body['responseCode'] ?? 1,
                    'response_message' => $body['responseMessage'] ?? 'Unknown response from Bakong',
                    'data'             => $body['data'] ?? null,
                ];
            }

            Log::warning('Bakong check_transaction_by_md5 HTTP error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return [
                'is_paid'          => false,
                'response_code'    => $response->status(),
                'response_message' => 'Bakong Gateway temporarily unavailable',
                'data'             => null,
            ];
        } catch (\Throwable $e) {
            Log::error('Bakong API Exception: ' . $e->getMessage());
            return [
                'is_paid'          => false,
                'response_code'    => 500,
                'response_message' => $e->getMessage(),
                'data'             => null,
            ];
        }
    }
}
