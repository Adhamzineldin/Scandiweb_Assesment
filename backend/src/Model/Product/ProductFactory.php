<?php

namespace src\Model\Product;

use src\Database\Database;

class ProductFactory
{
    public static function createProduct(array $data = []): AbstractProduct
    {
        $categoryName = $data['category'] ?? '';
        
        switch (strtolower($categoryName)) {
            case 'clothes':
                return new ClothingProduct($data);
            case 'tech':
                return new TechProduct($data);
            default:
                return new GenericProduct($data);
        }
    }

    public static function createProductFromId(string $id): ?AbstractProduct
    {
        $conn = Database::getInstance()->getConnection();
        $sql = "SELECT p.*, c.name as category_name 
                FROM products p 
                JOIN categories c ON p.category_id = c.id 
                WHERE p.id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute(['id' => $id]);
        
        $data = $stmt->fetch();
        if (!$data) {
            return null;
        }
        
        $data['category'] = $data['category_name'];
        return self::createProduct($data);
    }

    public static function findAllProducts(array $conditions = [], array $orderBy = [], int|null $limit = null): array
    {
        $conn = Database::getInstance()->getConnection();
        
        $sql = "SELECT p.*, c.name as category_name 
                FROM products p 
                JOIN categories c ON p.category_id = c.id";
        $params = [];
        
        if (!empty($conditions)) {
            $whereClause = implode(' AND ', array_map(fn($field) => "p.$field = :$field", array_keys($conditions)));
            $sql .= " WHERE $whereClause";
            $params = $conditions;
        }
        
        if (!empty($orderBy)) {
            $orderClause = implode(', ', array_map(fn($field, $direction) => "p.$field $direction", array_keys($orderBy), $orderBy));
            $sql .= " ORDER BY $orderClause";
        }
        
        if ($limit) {
            $sql .= " LIMIT $limit";
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        
        $results = [];
        while ($data = $stmt->fetch()) {
            $data['category'] = $data['category_name'];
            $results[] = self::createProduct($data);
        }
        
        return $results;
    }
} 