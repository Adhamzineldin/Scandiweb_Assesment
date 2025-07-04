<?php

namespace src\GraphQL\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class AttributeType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Attribute',
            'fields' => [
                'id' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute item ID',
                    'resolve' => function ($attributeItem) {
                        return $attributeItem->getItemId();
                    }
                ],
                'displayValue' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Display value for the attribute',
                    'resolve' => function ($attributeItem) {
                        return $attributeItem->getDisplayValue();
                    }
                ],
                'value' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Actual value of the attribute',
                    'resolve' => function ($attributeItem) {
                        return $attributeItem->getValue();
                    }
                ]
            ]
        ]);
    }
} 