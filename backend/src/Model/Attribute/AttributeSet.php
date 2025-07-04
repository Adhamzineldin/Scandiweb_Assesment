<?php

namespace src\Model\Attribute;

use src\Model\AbstractModel;

class AttributeSet extends AbstractModel
{
    public function getTableName(): string
    {
        return 'attributes';
    }

    public function getPrimaryKey(): string
    {
        return 'id';
    }

    public function getProductId(): string
    {
        return $this->get('product_id', '');
    }

    public function setProductId(string $productId): void
    {
        $this->set('product_id', $productId);
    }

    public function getName(): string
    {
        return $this->get('name', '');
    }

    public function setName(string $name): void
    {
        $this->set('name', $name);
    }

    public function getType(): string
    {
        return $this->get('type', 'text');
    }

    public function setType(string $type): void
    {
        $this->set('type', $type);
    }

    public function getCreatedAt(): string
    {
        return $this->get('created_at', '');
    }

    public function getItems(): array
    {
        return AttributeItem::findAll(['attribute_id' => $this->getId()]);
    }

    public function createAttribute(): AbstractAttribute
    {
        switch ($this->getType()) {
            case 'swatch':
                return new SwatchAttribute($this->getData());
            case 'select':
                return new SelectAttribute($this->getData());
            case 'text':
            default:
                return new TextAttribute($this->getData());
        }
    }

    public function toArray(): array
    {
        $items = $this->getItems();
        
        return [
            'id' => $this->getName(), // Using name as ID as per data structure
            'name' => $this->getName(),
            'type' => $this->getType(),
            'items' => array_map(fn($item) => $item->toArray(), $items),
            '__typename' => 'AttributeSet'
        ];
    }
} 