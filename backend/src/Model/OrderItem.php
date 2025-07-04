<?php

namespace src\Model;

use src\Model\AbstractModel;

class OrderItem extends AbstractModel
{
    public function getTableName(): string
    {
        return 'order_items';
    }

    public function getPrimaryKey(): string
    {
        return 'id';
    }

    public function getOrderId(): int
    {
        return (int) $this->get('order_id', 0);
    }

    public function setOrderId(int $orderId): void
    {
        $this->set('order_id', $orderId);
    }

    public function getProductId(): string
    {
        return $this->get('product_id', '');
    }

    public function setProductId(string $productId): void
    {
        $this->set('product_id', $productId);
    }

    public function getQuantity(): int
    {
        return (int) $this->get('quantity', 1);
    }

    public function setQuantity(int $quantity): void
    {
        $this->set('quantity', $quantity);
    }

    public function getUnitPrice(): float
    {
        return (float) $this->get('unit_price', 0.0);
    }

    public function setUnitPrice(float $price): void
    {
        $this->set('unit_price', $price);
    }

    public function getSelectedAttributes(): string
    {
        return $this->get('selected_attributes', '');
    }

    public function setSelectedAttributes(string $attributes): void
    {
        $this->set('selected_attributes', $attributes);
    }

    public function getCreatedAt(): string
    {
        return $this->get('created_at', '');
    }

    public function getSubtotal(): float
    {
        return $this->getUnitPrice() * $this->getQuantity();
    }

    public function getProduct(): ?Product\AbstractProduct
    {
        if (!$this->getProductId()) {
            return null;
        }
        return Product\ProductFactory::createProductFromId($this->getProductId());
    }

    public function toArray(): array
    {
        $product = $this->getProduct();
        
        return [
            'id' => $this->getId(),
            'productId' => $this->getProductId(),
            'product' => $product ? $product->toArray() : null,
            'quantity' => $this->getQuantity(),
            'unitPrice' => $this->getUnitPrice(),
            'subtotal' => $this->getSubtotal(),
            'selectedAttributes' => $this->getSelectedAttributes(),
            'createdAt' => $this->getCreatedAt(),
            '__typename' => 'OrderItem'
        ];
    }
} 