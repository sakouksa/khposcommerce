<?php

namespace App\Format\Traits;

use App\Format\Formatters\EmailFormatter;
use App\Format\Formatters\IdentifierFormatter;
use App\Format\Formatters\PhoneFormatter;

/**
 * Trait to automatically normalize and sanitize model attributes before persistence.
 */
trait NormalizesAttributes
{
    public static function bootNormalizesAttributes(): void
    {
        static::saving(function ($model) {
            // 1. Normalize Phone Numbers
            foreach (['phone', 'phone_number', 'shipping_phone', 'billing_phone', 'hotline', 'mobile'] as $phoneField) {
                if (!empty($model->attributes[$phoneField])) {
                    $model->attributes[$phoneField] = PhoneFormatter::normalize($model->attributes[$phoneField]);
                }
            }

            // 2. Normalize Emails
            foreach (['email', 'support_email', 'billing_email'] as $emailField) {
                if (!empty($model->attributes[$emailField])) {
                    $model->attributes[$emailField] = EmailFormatter::normalize($model->attributes[$emailField]);
                }
            }

            // 3. Normalize SKU, Barcode, IMEI & Tax Number
            if (!empty($model->attributes['sku'])) {
                $model->attributes['sku'] = IdentifierFormatter::sku($model->attributes['sku']) ?? strtoupper(trim((string) $model->attributes['sku']));
            }
            if (!empty($model->attributes['barcode'])) {
                $model->attributes['barcode'] = IdentifierFormatter::barcode($model->attributes['barcode']) ?? trim((string) $model->attributes['barcode']);
            }
            if (!empty($model->attributes['imei'])) {
                $model->attributes['imei'] = IdentifierFormatter::imei($model->attributes['imei']) ?? trim((string) $model->attributes['imei']);
            }
            if (!empty($model->attributes['tax_number'])) {
                $model->attributes['tax_number'] = IdentifierFormatter::taxId($model->attributes['tax_number']) ?? trim((string) $model->attributes['tax_number']);
            }
        });
    }
}
