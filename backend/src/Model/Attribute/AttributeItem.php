<?php

namespace Scandiweb\Model\Attribute;

use Scandiweb\Model\AbstractModel;

class AttributeItem extends AbstractModel
{
    public function getTableName(): string
    {
        return 'attribute_items';
    }

    public function getPrimaryKey(): string
    {
        return 'id';
    }

    public function getAttributeId(): int
    {
        return (int) $this->get('attribute_id', 0);
    }

    public function setAttributeId(int $attributeId): void
    {
        $this->set('attribute_id', $attributeId);
    }

    public function getDisplayValue(): string
    {
        return $this->get('display_value', '');
    }

    public function setDisplayValue(string $displayValue): void
    {
        $this->set('display_value', $displayValue);
    }

    public function getValue(): string
    {
        return $this->get('value', '');
    }

    public function setValue(string $value): void
    {
        $this->set('value', $value);
    }

    public function getItemId(): string
    {
        return $this->get('item_id', '');
    }

    public function setItemId(string $itemId): void
    {
        $this->set('item_id', $itemId);
    }

    public function getCreatedAt(): string
    {
        return $this->get('created_at', '');
    }

    public function toArray(): array
    {
        return [
            'displayValue' => $this->getDisplayValue(),
            'value' => $this->getValue(),
            'id' => $this->getItemId(),
            '__typename' => 'Attribute'
        ];
    }
} 