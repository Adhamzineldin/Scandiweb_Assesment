<?php

namespace src\GraphQL\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class ProductType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Product',
            'fields' => [
                'id' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Product ID'
                ],
                'name' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Product name'
                ],
                'inStock' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => 'Whether the product is in stock'
                ],
                'gallery' => [
                    'type' => Type::listOf(Type::string()),
                    'description' => 'Product image gallery URLs'
                ],
                'description' => [
                    'type' => Type::string(),
                    'description' => 'Product description'
                ],
                'category' => [
                    'type' => Type::string(),
                    'description' => 'Product category name'
                ],
                'attributes' => [
                    'type' => Type::listOf(TypeRegistry::attributeSet()),
                    'description' => 'Product attributes'
                ],
                'prices' => [
                    'type' => Type::listOf(TypeRegistry::price()),
                    'description' => 'Product prices'
                ],
                'brand' => [
                    'type' => Type::string(),
                    'description' => 'Product brand'
                ],
                'productType' => [
                    'type' => Type::string(),
                    'description' => 'Product type (clothing, tech, generic)'
                ]
            ]
        ]);
    }
} 