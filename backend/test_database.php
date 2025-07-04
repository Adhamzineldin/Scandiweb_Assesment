<?php

require_once __DIR__ . '/vendor/autoload.php';

use src\Database\Database;

echo "Testing Database Connection\n";
echo "==========================\n\n";

try {
    $database = Database::getInstance();
    $connection = $database->getConnection();
    
    echo "✅ Database connection successful!\n";
    
    // Test a simple query
    $stmt = $connection->query("SELECT COUNT(*) as count FROM categories");
    $result = $stmt->fetch();
    
    echo "✅ Categories table accessible. Count: " . $result['count'] . "\n";
    
    // Test products table
    $stmt = $connection->query("SELECT COUNT(*) as count FROM products");
    $result = $stmt->fetch();
    
    echo "✅ Products table accessible. Count: " . $result['count'] . "\n";
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "Please check your .env file and database configuration.\n";
} 