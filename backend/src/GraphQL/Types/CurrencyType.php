<?php

namespace src\GraphQL\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class CurrencyType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Currency',
            'fields' => [
                'label' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Currency label (e.g., USD, EUR)',
                    'resolve' => function ($currency) {
                        return is_array($currency) ? $currency['label'] : $currency->getCurrencyLabel();
                    }
                ],
                'symbol' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Currency symbol (e.g., $, €)',
                    'resolve' => function ($currency) {
                        return is_array($currency) ? $currency['symbol'] : $currency->getCurrencySymbol();
                    }
                ]
            ]
        ]);
    }
} 