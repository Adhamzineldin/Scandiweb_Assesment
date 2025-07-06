<?php

namespace src\GraphQL\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class CreateOrderResponseType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'CreateOrderResponse',
            'fields' => [
                'success' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => 'Whether the operation was successful'
                ],
                'order' => [
                    'type' => TypeRegistry::order(),
                    'description' => 'The created order (if successful)'
                ],
                'message' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Response message'
                ]
            ]
        ]);
    }
} 