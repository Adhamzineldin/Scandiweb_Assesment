<?php

namespace Scandiweb\GraphQL\Types;

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
                    'description' => 'Price amount',
                    'resolve' => function ($price) {
                        return $price->getAmount();
                    }
                ],
                'currency' => [
                    'type' => TypeRegistry::currency(),
                    'description' => 'Currency information',
                    'resolve' => function ($price) {
                        return [
                            'label' => $price->getCurrencyLabel(),
                            'symbol' => $price->getCurrencySymbol()
                        ];
                    }
                ]
            ]
        ]);
    }
} 