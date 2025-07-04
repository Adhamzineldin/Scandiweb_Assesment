<?php

namespace src\GraphQL\Types;

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
                    'description' => 'Attribute set ID'
                ],
                'name' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute set name'
                ],
                'type' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Attribute type (text, swatch, select)'
                ],
                'items' => [
                    'type' => Type::listOf(TypeRegistry::attribute()),
                    'description' => 'List of attribute items'
                ]
            ]
        ]);
    }
} 