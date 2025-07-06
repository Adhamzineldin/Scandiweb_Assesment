<?php

namespace Scandiweb\Model;

use Scandiweb\Model\AbstractModel;

class Order extends AbstractModel
{
    public function getTableName(): string
    {
        return 'orders';
    }

    public function getPrimaryKey(): string
    {
        return 'id';
    }

    public function getCustomerEmail(): string
    {
        return $this->get('customer_email', '');
    }

    public function setCustomerEmail(string $email): void
    {
        $this->set('customer_email', $email);
    }

    public function getCustomerName(): string
    {
        return $this->get('customer_name', '');
    }

    public function setCustomerName(string $name): void
    {
        $this->set('customer_name', $name);
    }

    public function getTotalAmount(): float
    {
        return (float) $this->get('total_amount', 0.0);
    }

    public function setTotalAmount(float $amount): void
    {
        $this->set('total_amount', $amount);
    }

    public function getStatus(): string
    {
        return $this->get('status', 'pending');
    }

    public function setStatus(string $status): void
    {
        $this->set('status', $status);
    }

    public function getCreatedAt(): string
    {
        return $this->get('created_at', '');
    }

    public function getUpdatedAt(): string
    {
        return $this->get('updated_at', '');
    }

    public function getOrderItems(): array
    {
        return OrderItem::findAll(['order_id' => $this->getId()]);
    }

    public function addOrderItem(OrderItem $item): void
    {
        $item->setOrderId($this->getId());
        $item->save();
    }

    public function calculateTotal(): float
    {
        $items = $this->getOrderItems();
        $total = 0.0;
        
        foreach ($items as $item) {
            $total += $item->getSubtotal();
        }
        
        return $total;
    }

    public function toArray(): array
    {
        $items = $this->getOrderItems();
        
        return [
            'id' => $this->getId(),
            'customerEmail' => $this->getCustomerEmail(),
            'customerName' => $this->getCustomerName(),
            'totalAmount' => $this->getTotalAmount(),
            'status' => $this->getStatus(),
            'items' => array_map(fn($item) => $item->toArray(), $items),
            'createdAt' => $this->getCreatedAt(),
            'updatedAt' => $this->getUpdatedAt(),
            '__typename' => 'Order'
        ];
    }
} 