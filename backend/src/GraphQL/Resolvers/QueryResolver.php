<?php

namespace src\GraphQL\Resolvers;

use src\Model\Category;
use src\Model\Product\ProductFactory;

class QueryResolver
{
    public static function categories(): array
    {
        try {
            $categories = Category::findAll();
            if (empty($categories)) {
                // Return hardcoded categories if none found in database
                return [
                    new Category(['name' => 'all']),
                    new Category(['name' => 'clothes']),
                    new Category(['name' => 'tech'])
                ];
            }
            return $categories;
        } catch (\Exception $e) {
            // Fallback to hardcoded categories if database error
            return [
                new Category(['name' => 'all']),
                new Category(['name' => 'clothes']),
                new Category(['name' => 'tech'])
            ];
        }
    }

    public static function category(mixed $root, array $args): ?Category
    {
        $id = $args['id'] ?? null;
        if ($id) {
            return Category::findById($id);
        }
        
        $name = $args['name'] ?? null;
        if ($name) {
            $categories = Category::findAll(['name' => $name]);
            return $categories[0] ?? null;
        }
        
        return null;
    }

    public static function products(mixed $root, array $args): array
    {
        try {
            $conditions = [];
            
            // Handle category filtering - if categoryName is "all", don't add category filter
            if (isset($args['categoryId'])) {
                $conditions['category_id'] = $args['categoryId'];
            }
            
            if (isset($args['categoryName']) && $args['categoryName'] !== 'all') {
                // Find category ID by name for filtering
                $categories = Category::findAll(['name' => $args['categoryName']]);
                if (!empty($categories)) {
                    $conditions['category_id'] = $categories[0]->getId();
                }
            }
            
            if (isset($args['inStock'])) {
                $conditions['in_stock'] = $args['inStock'];
            }
            
            if (isset($args['brand'])) {
                $conditions['brand'] = $args['brand'];
            }
            
            $orderBy = [];
            if (isset($args['sortBy'])) {
                $orderBy[$args['sortBy']] = $args['sortOrder'] ?? 'ASC';
            }
            
            $limit = $args['limit'] ?? null;
            
            return ProductFactory::findAllProducts($conditions, $orderBy, $limit);
        } catch (\Exception $e) {
            error_log('Error in products resolver: ' . $e->getMessage());
            throw new \Exception('Failed to fetch products: ' . $e->getMessage());
        }
    }

    public static function product(mixed $root, array $args): mixed
    {
        $id = $args['id'] ?? null;
        if ($id) {
            return ProductFactory::createProductFromId($id);
        }
        
        return null;
    }
} 