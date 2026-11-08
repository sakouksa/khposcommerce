<?php

namespace App\Traits;

trait HasReferenceNumber
{
    public static function bootHasReferenceNumber(): void
    {
        static::creating(function ($model) {
            if (empty($model->reference_no) && empty($model->reference_number)) {
                $prefix = strtoupper(substr(class_basename($model), 0, 3));
                $ref = $prefix . '-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
                if (array_key_exists('reference_no', $model->getAttributes())) {
                    $model->reference_no = $ref;
                } elseif (array_key_exists('reference_number', $model->getAttributes())) {
                    $model->reference_number = $ref;
                }
            }
        });
    }
}
