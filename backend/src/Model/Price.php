<?php

namespace src\Model;

use src\Model\AbstractModel;

class Price extends AbstractModel
{
    public function getTableName(): string
    {
        return 'prices';
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

    public function getAmount(): float
    {
        return (float) $this->get('amount', 0.0);
    }

    public function setAmount(float $amount): void
    {
        $this->set('amount', $amount);
    }

    public function getCurrencyLabel(): string
    {
        return $this->get('currency_label', 'USD');
    }

    public function setCurrencyLabel(string $currencyLabel): void
    {
        $this->set('currency_label', $currencyLabel);
    }

    public function getCurrencySymbol(): string
    {
        return $this->get('currency_symbol', '$');
    }

    public function setCurrencySymbol(string $currencySymbol): void
    {
        $this->set('currency_symbol', $currencySymbol);
    }

    public function getCreatedAt(): string
    {
        return $this->get('created_at', '');
    }

    public function getUpdatedAt(): string
    {
        return $this->get('updated_at', '');
    }

    public function formatPrice(): string
    {
        return $this->getCurrencySymbol() . number_format($this->getAmount(), 2);
    }

    public function toArray(): array
    {
        return [
            'amount' => $this->getAmount(),
            'currency' => [
                'label' => $this->getCurrencyLabel(),
                'symbol' => $this->getCurrencySymbol(),
                '__typename' => 'Currency'
            ],
            '__typename' => 'Price'
        ];
    }
} 