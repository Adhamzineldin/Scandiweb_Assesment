<?php

namespace Scandiweb\Model\Attribute;

class SelectAttribute extends AbstractAttribute
{
    public function getAttributeType(): string
    {
        return 'select';
    }

    public function validateValue(string $value): bool
    {
        // Select attributes should have a value that exists in the items list
        $items = $this->getItems();
        foreach ($items as $item) {
            if ($item->getValue() === $value) {
                return true;
            }
        }
        return false;
    }

    public function formatDisplayValue(string $value): string
    {
        // For select attributes, find the display value for the given value
        $items = $this->getItems();
        foreach ($items as $item) {
            if ($item->getValue() === $value) {
                return $item->getDisplayValue();
            }
        }
        return $value;
    }

    public function getAvailableOptions(): array
    {
        $items = $this->getItems();
        return array_map(fn($item) => [
            'value' => $item->getValue(),
            'displayValue' => $item->getDisplayValue()
        ], $items);
    }

    public function toArray(): array
    {
        $baseArray = parent::toArray();
        $baseArray['attributeType'] = $this->getAttributeType();
        return $baseArray;
    }
} 