<?php

namespace App\Format\ValueObjects;

use App\Enums\CurrencyCode;
use App\Format\Formatters\MoneyFormatter;
use InvalidArgumentException;
use JsonSerializable;
use Stringable;

/**
 * Enterprise Immutable Money Value Object
 */
final class Money implements JsonSerializable, Stringable
{
    private float $amount;
    private CurrencyCode $currency;

    public function __construct(float|int|string $amount, CurrencyCode|string $currency = CurrencyCode::USD)
    {
        $resolvedCurrency = is_string($currency)
            ? (CurrencyCode::tryFrom(strtoupper($currency)) ?? CurrencyCode::USD)
            : $currency;

        $this->currency = $resolvedCurrency;
        $this->amount   = MoneyFormatter::round((float) $amount, $resolvedCurrency);
    }

    public static function from(float|int|string $amount, CurrencyCode|string $currency = CurrencyCode::USD): self
    {
        return new self($amount, $currency);
    }

    public static function usd(float|int|string $amount): self
    {
        return new self($amount, CurrencyCode::USD);
    }

    public static function khr(float|int|string $amount): self
    {
        return new self($amount, CurrencyCode::KHR);
    }

    public function amount(): float
    {
        return $this->amount;
    }

    public function currency(): CurrencyCode
    {
        return $this->currency;
    }

    public function currencyCode(): string
    {
        return $this->currency->value;
    }

    public function formatted(bool $withSymbol = true): string
    {
        return MoneyFormatter::format($this->amount, $this->currency, $withSymbol);
    }

    public function add(self $other): self
    {
        $this->ensureSameCurrency($other);
        return new self($this->amount + $other->amount(), $this->currency);
    }

    public function subtract(self $other): self
    {
        $this->ensureSameCurrency($other);
        return new self($this->amount - $other->amount(), $this->currency);
    }

    public function multiply(float $multiplier): self
    {
        return new self($this->amount * $multiplier, $this->currency);
    }

    public function isZero(): bool
    {
        return $this->amount === 0.0 || $this->amount === -0.0;
    }

    public function isPositive(): bool
    {
        return $this->amount > 0;
    }

    public function isNegative(): bool
    {
        return $this->amount < 0;
    }

    public function greaterThan(self $other): bool
    {
        $this->ensureSameCurrency($other);
        return $this->amount > $other->amount();
    }

    public function lessThan(self $other): bool
    {
        $this->ensureSameCurrency($other);
        return $this->amount < $other->amount();
    }

    public function equals(self $other): bool
    {
        return $this->currency === $other->currency() && abs($this->amount - $other->amount()) < 0.0001;
    }

    private function ensureSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency()) {
            throw new InvalidArgumentException(
                "Cannot perform arithmetic on differing currencies ({$this->currency->value} vs {$other->currency()->value}). Convert currencies first."
            );
        }
    }

    public function toArray(): array
    {
        return [
            'amount'    => $this->amount,
            'currency'  => $this->currency->value,
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
