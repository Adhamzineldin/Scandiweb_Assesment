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
                    'description' => 'Order item ID'
                ],
                'productId' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Product ID'
                ],
                'product' => [
                    'type' => TypeRegistry::product(),
                    'description' => 'Product information'
                ],
                'quantity' => [
                    'type' => Type::nonNull(Type::int()),
                    'description' => 'Quantity ordered'
                ],
                'unitPrice' => [
                    'type' => Type::nonNull(Type::float()),
                    'description' => 'Unit price'
                ],
                'subtotal' => [
                    'type' => Type::nonNull(Type::float()),
                    'description' => 'Subtotal for this item'
                ],
                'selectedAttributes' => [
                    'type' => Type::string(),
                    'description' => 'Selected product attributes'
                ]
            ]
        ]);
    }
} 