<?php

namespace src\GraphQL\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class PriceType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Price',
            'fields' => [
                'amount' => [
                    'type' => Type::nonNull(Type::float()),
                    'description' => 'Price amount'
                ],
                'currency' => [
                    'type' => TypeRegistry::currency(),
                    'description' => 'Currency information'
                ]
            ]
        ]);
    }
} 