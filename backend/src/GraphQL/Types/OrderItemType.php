<?php

namespace src\GraphQL\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class OrderItemType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'OrderItem',
            'fields' => [
                'id' => [
                    'type' => Type::nonNull(Type::int()),
                    'description' => 'Order item ID',
                    'resolve' => function ($orderItem) {
                        return $orderItem->getId();
                    }
                ],
                'productId' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Product ID',
                    'resolve' => function ($orderItem) {
                        return $orderItem->getProductId();
                    }
                ],
                'product' => [
                    'type' => TypeRegistry::product(),
                    'description' => 'Product information',
                    'resolve' => function ($orderItem) {
                        return $orderItem->getProduct();
                    }
                ],
                'quantity' => [
                    'type' => Type::nonNull(Type::int()),
                    'description' => 'Quantity ordered',
                    'resolve' => function ($orderItem) {
                        return $orderItem->getQuantity();
                    }
                ],
                'unitPrice' => [
                    'type' => Type::nonNull(Type::float()),
                    'description' => 'Unit price',
                    'resolve' => function ($orderItem) {
                        return $orderItem->getUnitPrice();
                    }
                ],
                'subtotal' => [
                    'type' => Type::nonNull(Type::float()),
                    'description' => 'Subtotal for this item',
                    'resolve' => function ($orderItem) {
                        return $orderItem->getSubtotal();
                    }
                ],
                'selectedAttributes' => [
                    'type' => Type::string(),
                    'description' => 'Selected product attributes',
                    'resolve' => function ($orderItem) {
                        return $orderItem->getSelectedAttributes();
                    }
                ]
            ]
        ]);
    }
} 