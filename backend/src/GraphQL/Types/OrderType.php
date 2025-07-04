<?php

namespace src\GraphQL\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class OrderType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Order',
            'fields' => [
                'id' => [
                    'type' => Type::nonNull(Type::int()),
                    'description' => 'Order ID'
                ],
                'customerEmail' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Customer email'
                ],
                'customerName' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Customer name'
                ],
                'totalAmount' => [
                    'type' => Type::nonNull(Type::float()),
                    'description' => 'Total order amount'
                ],
                'status' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Order status'
                ],
                'items' => [
                    'type' => Type::listOf(TypeRegistry::orderItem()),
                    'description' => 'Order items'
                ],
                'createdAt' => [
                    'type' => Type::string(),
                    'description' => 'Order creation date'
                ],
                'updatedAt' => [
                    'type' => Type::string(),
                    'description' => 'Order last update date'
                ]
            ]
        ]);
    }
} 