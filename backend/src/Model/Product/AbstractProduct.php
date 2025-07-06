<?php

namespace src\Model\Product;

use src\Model\AbstractModel;
use src\Model\Category;
use src\Model\Attribute\AttributeSet;
use src\Model\Price;

abstract class AbstractProduct extends AbstractModel
{
    public function getTableName(): string
    {
        return 'products';
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

    public function getDescription(): string
    {
        return $this->get('description', '');
    }

    public function setDescription(string $description): void
    {
        $this->set('description', $description);
    }

    public function isInStock(): bool
    {
        return (bool) $this->get('in_stock', true);
    }

    public function setInStock(bool $inStock): void
    {
        $this->set('in_stock', $inStock);
    }

    public function getCategoryId(): int
    {
        return (int) $this->get('category_id', 0);
    }

    public function setCategoryId(int $categoryId): void
    {
        $this->set('category_id', $categoryId);
    }

    public function getBrand(): string
    {
        return $this->get('brand', '');
    }

    public function setBrand(string $brand): void
    {
        $this->set('brand', $brand);
    }

    public function getCreatedAt(): string
    {
        return $this->get('created_at', '');
    }

    public function getUpdatedAt(): string
    {
        return $this->get('updated_at', '');
    }

    public function getCategory(): ?Category
    {
        if (!$this->getCategoryId()) {
            return null;
        }
        return Category::findById($this->getCategoryId());
    }

    public function getImages(): array
    {
        $conn = $this->database->getConnection();
        $sql = "SELECT * FROM product_images WHERE product_id = :product_id ORDER BY sort_order ASC";
        $stmt = $conn->prepare($sql);
        $stmt->execute(['product_id' => $this->getId()]);
        
        $images = [];
        while ($data = $stmt->fetch()) {
            $images[] = [
                'id' => $data['id'],
                'url' => $data['url'],
                'sort_order' => $data['sort_order']
            ];
        }
        
        return $images;
    }

    public function getAttributeSets(): array
    {
        return AttributeSet::findAll(['product_id' => $this->getId()]);
    }

    public function getPrices(): array
    {
        return Price::findAll(['product_id' => $this->getId()]);
    }

    abstract public function getProductType(): string;

    public function toArray(): array
    {
        $category = $this->getCategory();
        $images = $this->getImages();
        $attributeSets = $this->getAttributeSets();
        $prices = $this->getPrices();

        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
            'inStock' => $this->isInStock(),
            'gallery' => array_column($images, 'url'),
            'description' => $this->getDescription(),
            'category' => $category ? $category->getName() : '',
            'attributes' => array_map(fn($attrSet) => $attrSet->toArray(), $attributeSets),
            'prices' => array_map(fn($price) => $price->toArray(), $prices),
            'brand' => $this->getBrand(),
            '__typename' => 'Product'
        ];
    }
} 