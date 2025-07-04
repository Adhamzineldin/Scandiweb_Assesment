<?php

namespace src\GraphQL\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class CategoryType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Category',
            'fields' => [
                'id' => [
                    'type' => Type::nonNull(Type::int()),
                    'description' => 'Category ID',
                    'resolve' => function ($category) {
                        // Custom resolver for ID with fallback
                        $id = $category->get('id');
                        if ($id === null) {
                            return crc32($category->getName());
                        }
                        return (int) $id;
                    }
                ],
                'name' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Category name',
                    'resolve' => function ($category) {
                        return $category->getName();
                    }
                ],
                'products' => [
                    'type' => Type::listOf(TypeRegistry::product()),
                    'description' => 'Products in this category',
                    'resolve' => function ($category) {
                        return $category->getProducts();
                    }
                ]
            ]
        ]);
    }
} 