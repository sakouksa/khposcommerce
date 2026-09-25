<?php

namespace App\Format\ValueObjects;

use App\Format\Formatters\PhoneFormatter;
use JsonSerializable;
use Stringable;

/**
 * Enterprise Immutable PhoneNumber Value Object
 */
final class PhoneNumber implements JsonSerializable, Stringable
{
    private ?string $raw;
    private ?string $e164;
    private ?string $local;
    private bool $isValid;

    public function __construct(?string $phone)
    {
        $this->raw     = $phone ? trim($phone) : null;
        $this->e164    = PhoneFormatter::normalize($phone);
        $this->local   = PhoneFormatter::toLocal($this->e164);
        $this->isValid = PhoneFormatter::isValid($this->e164);
    }

    public static function from(?string $phone): self
    {
        return new self($phone);
    }

    public function raw(): ?string
    {
        return $this->raw;
    }

    public function e164(): ?string
    {
        return $this->e164;
    }

    public function local(): ?string
    {
        return $this->local;
    }

    public function masked(): ?string
    {
        return PhoneFormatter::mask($this->e164);
    }

    public function isValid(): bool
    {
        return $this->isValid;
    }

    public function toArray(): array
    {
        return [
            'raw'      => $this->raw,
            'e164'     => $this->e164,
            'local'    => $this->local,
            'masked'   => $this->masked(),
            'is_valid' => $this->isValid,
        ];
    }

    public function jsonSerialize(): ?string
    {
        return $this->e164;
    }

    public function __toString(): string
    {
        return $this->e164 ?? '';
    }
}
