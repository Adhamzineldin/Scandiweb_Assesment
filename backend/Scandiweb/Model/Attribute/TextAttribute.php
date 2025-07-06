<?php

namespace Scandiweb\Model\Attribute;

class TextAttribute extends AbstractAttribute
{
    public function getAttributeType(): string
    {
        return 'text';
    }

    public function validateValue(string $value): bool
    {
        // Text attributes can have any string value
        return !empty(trim($value));
    }

    public function formatDisplayValue(string $value): string
    {
        // For text attributes, display value is the same as the value
        return $value;
    }

    public function toArray(): array
    {
        $baseArray = parent::toArray();
        $baseArray['attributeType'] = $this->getAttributeType();
        return $baseArray;
    }
} 