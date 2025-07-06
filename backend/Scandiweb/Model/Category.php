<?php

namespace Scandiweb\Model;

class Category extends AbstractModel
{
    public function getTableName(): string
    {
        return 'categories';
    }

    public function getPrimaryKey(): string
    {
        return 'id';
    }

    public function getName(): string
    {
        return $this->get('name', '');
    }

    public function setName(string $name): void
    {
        $this->set('name', $name);
    }

    public function getCreatedAt(): string
    {
        return $this->get('created_at', '');
    }

    public function getProducts(): array
    {
        return Product::findAll(['category_id' => $this->getId()]);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
            'created_at' => $this->getCreatedAt(),
            '__typename' => 'Category'
        ];
    }

    public function getId(): mixed
    {
        // Fallback: generate ID from name if missing
        return $this->data[$this->getPrimaryKey()] ?? crc32($this->getName());
    }
} 