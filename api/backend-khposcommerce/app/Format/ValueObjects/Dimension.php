<?php

namespace App\Format\ValueObjects;

use JsonSerializable;
use Stringable;

/**
 * Enterprise Immutable Product Dimension Value Object
 */
final class Dimension implements JsonSerializable, Stringable
{
    private float $length;
    private float $width;
    private float $height;
    private string $unit;

    public function __construct(float $length, float $width, float $height, string $unit = 'cm')
    {
        $this->length = round($length, 2);
        $this->width  = round($width, 2);
        $this->height = round($height, 2);
        $this->unit   = strtolower(trim($unit));
    }

    public static function from(float $length, float $width, float $height, string $unit = 'cm'): self
    {
        return new self($length, $width, $height, $unit);
    }

    public function length(): float
    {
        return $this->length;
    }

    public function width(): float
    {
        return $this->width;
    }

    public function height(): float
    {
        return $this->height;
    }

    public function unit(): string
    {
        return $this->unit;
    }

    public function volume(): float
    {
        return round($this->length * $this->width * $this->height, 3);
    }

    public function formatted(): string
    {
        return "{$this->length} × {$this->width} × {$this->height} {$this->unit}";
    }

    public function toArray(): array
    {
        return [
            'length'    => $this->length,
            'width'     => $this->width,
            'height'    => $this->height,
            'unit'      => $this->unit,
            'volume'    => $this->volume(),
            'formatted' => $this->formatted(),
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function __toString(): string
    {
        return $this->formatted();
    }
}
