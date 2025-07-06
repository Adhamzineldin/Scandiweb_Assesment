<?php

namespace Scandiweb\GraphQL\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class AttributeSetType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'AttributeSet',
            'fields' => [
                'id' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute set ID',
                    'resolve' => function ($attributeSet) {
                        return $attributeSet->getName(); // Using name as ID as per data structure
                    }
                ],
                'name' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute set name',
                    'resolve' => function ($attributeSet) {
                        return $attributeSet->getName();
                    }
                ],
                'type' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute type (text, swatch, select)',
                    'resolve' => function ($attributeSet) {
                        return $attributeSet->getType();
                    }
                ],
                'items' => [
                    'type' => Type::listOf(TypeRegistry::attribute()),
                    'description' => 'List of attribute items',
                    'resolve' => function ($attributeSet) {
                        return $attributeSet->getItems();
                    }
                ]
            ]
        ]);
    }
} 