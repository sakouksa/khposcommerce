<?php

namespace App\Enums;

enum QuantityUnit: string
{
    case PCS = 'pcs';
    case KG = 'kg';
    case G = 'g';
    case L = 'l';
    case ML = 'ml';
    case BOX = 'box';
    case PACK = 'pack';
    case SET = 'set';
    case PAIR = 'pair';
    case CARTON = 'carton';
    case DOZEN = 'dozen';
    case ROLL = 'roll';

    public function label(): string
    {
        return match ($this) {
            self::PCS => 'Piece',
            self::KG => 'Kilogram',
            self::G => 'Gram',
            self::L => 'Liter',
            self::ML => 'Milliliter',
            self::BOX => 'Box',
            self::PACK => 'Pack',
            self::SET => 'Set',
            self::PAIR => 'Pair',
            self::CARTON => 'Carton',
            self::DOZEN => 'Dozen',
            self::ROLL => 'Roll',
        };
    }

    public function labelKhmer(): string
    {
        return match ($this) {
            self::PCS => 'ដុំ/គ្រាប់',
            self::KG => 'គីឡូក្រាម',
            self::G => 'ក្រាម',
            self::L => 'លីត្រ',
            self::ML => 'មីលីលីត្រ',
            self::BOX => 'ប្រអប់',
            self::PACK => 'កញ្ចប់',
            self::SET => 'ឈុត',
            self::PAIR => 'គូ',
            self::CARTON => 'កេះ',
            self::DOZEN => 'ឡូត៍',
            self::ROLL => 'ដុំរមូរ',
        };
    }

    /**
     * Parse string to QuantityUnit enum with fallback.
     */
    public static function tryFromString(?string $value, self $default = self::PCS): self
    {
        if (!$value) {
            return $default;
        }

        $clean = strtolower(trim($value));
        return self::tryFrom($clean) ?? $default;
    }
}
