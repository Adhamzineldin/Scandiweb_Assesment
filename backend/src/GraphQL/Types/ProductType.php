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
                    'description' => 'Product ID',
                    'resolve' => function ($product) {
                        return $product->getId();
                    }
                ],
                'name' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'Product name',
                    'resolve' => function ($product) {
                        return $product->getName();
                    }
                ],
                'inStock' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => 'Whether the product is in stock',
                    'resolve' => function ($product) {
                        return $product->isInStock();
                    }
                ],
                'gallery' => [
                    'type' => Type::listOf(Type::string()),
                    'description' => 'Product image gallery URLs',
                    'resolve' => function ($product) {
                        $images = $product->getImages();
                        return array_column($images, 'url');
                    }
                ],
                'description' => [
                    'type' => Type::string(),
                    'description' => 'Product description',
                    'resolve' => function ($product) {
                        return $product->getDescription();
                    }
                ],
                'category' => [
                    'type' => Type::string(),
                    'description' => 'Product category name',
                    'resolve' => function ($product) {
                        $category = $product->getCategory();
                        return $category ? $category->getName() : '';
                    }
                ],
                'attributes' => [
                    'type' => Type::listOf(TypeRegistry::attributeSet()),
                    'description' => 'Product attributes',
                    'resolve' => function ($product) {
                        return $product->getAttributeSets();
                    }
                ],
                'prices' => [
                    'type' => Type::listOf(TypeRegistry::price()),
                    'description' => 'Product prices',
                    'resolve' => function ($product) {
                        return $product->getPrices();
                    }
                ],
                'brand' => [
                    'type' => Type::string(),
                    'description' => 'Product brand',
                    'resolve' => function ($product) {
                        return $product->getBrand();
                    }
                ],
                'productType' => [
                    'type' => Type::string(),
                    'description' => 'Product type (clothing, tech, generic)',
                    'resolve' => function ($product) {
                        return $product->getProductType();
                    }
                ]
            ]
        ]);
    }
} 