<?php

namespace Scandiweb\Model\Attribute;

class SwatchAttribute extends AbstractAttribute
{
    public function getAttributeType(): string
    {
        return 'swatch';
    }

    public function validateValue(string $value): bool
    {
        // Swatch attributes should be valid hex color codes
        return preg_match('/^#[0-9A-F]{6}$/i', $value) || preg_match('/^#[0-9A-F]{3}$/i', $value);
    }

    public function formatDisplayValue(string $value): string
    {
        // For swatch attributes, the value is the hex color code
        return $value;
    }

    public function getColorName(string $hexValue): string
    {
        // Map common hex values to color names
        $colorMap = [
            '#000000' => 'Black',
            '#FFFFFF' => 'White',
            '#44FF03' => 'Green',
            '#03FFF7' => 'Cyan',
            '#030BFF' => 'Blue',
            '#FF0000' => 'Red',
            '#FFFF00' => 'Yellow',
            '#FF00FF' => 'Magenta',
            '#00FF00' => 'Lime',
            '#FFA500' => 'Orange',
            '#800080' => 'Purple',
            '#A52A2A' => 'Brown'
        ];

        return $colorMap[$hexValue] ?? 'Unknown';
    }

    public function toArray(): array
    {
        $baseArray = parent::toArray();
        $baseArray['attributeType'] = $this->getAttributeType();
        return $baseArray;
    }
} 