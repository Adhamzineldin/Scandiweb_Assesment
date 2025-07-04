<?php

namespace src\GraphQL\Resolvers;

use src\Model\Category;
use src\Model\Product\ProductFactory;

class QueryResolver
{
    public static function categories()
    {
        return Category::findAll();
    }

    public static function category($root, $args)
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

    public static function products($root, $args)
    {
        $conditions = [];
        
        if (isset($args['categoryId'])) {
            $conditions['category_id'] = $args['categoryId'];
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
    }

    public static function product($root, $args)
    {
        $id = $args['id'] ?? null;
        if ($id) {
            return ProductFactory::createProductFromId($id);
        }
        
        return null;
    }
} 