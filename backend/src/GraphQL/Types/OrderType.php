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
                    'description' => 'Order ID',
                    'resolve' => function ($order) {
                        return $order->getId();
                    }
                ],
                'customerEmail' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Customer email',
                    'resolve' => function ($order) {
                        return $order->getCustomerEmail();
                    }
                ],
                'customerName' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Customer name',
                    'resolve' => function ($order) {
                        return $order->getCustomerName();
                    }
                ],
                'totalAmount' => [
                    'type' => Type::nonNull(Type::float()),
                    'description' => 'Total order amount',
                    'resolve' => function ($order) {
                        return $order->getTotalAmount();
                    }
                ],
                'status' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Order status',
                    'resolve' => function ($order) {
                        return $order->getStatus();
                    }
                ],
                'items' => [
                    'type' => Type::listOf(TypeRegistry::orderItem()),
                    'description' => 'Order items',
                    'resolve' => function ($order) {
                        return $order->getOrderItems();
                    }
                ],
                'createdAt' => [
                    'type' => Type::string(),
                    'description' => 'Order creation date',
                    'resolve' => function ($order) {
                        return $order->getCreatedAt();
                    }
                ],
                'updatedAt' => [
                    'type' => Type::string(),
                    'description' => 'Order last update date',
                    'resolve' => function ($order) {
                        return $order->getUpdatedAt();
                    }
                ]
            ]
        ]);
    }
} 