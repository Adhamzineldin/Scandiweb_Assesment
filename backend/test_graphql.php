<?php

require_once __DIR__ . '/vendor/autoload.php';

use src\Controller\GraphQL;

// Test GraphQL queries
function testGraphQL()
{
    echo "Testing GraphQL Implementation\n";
    echo "===============================\n\n";

    // Test 1: Query Categories
    echo "Test 1: Query Categories\n";
    $query1 = '{"query": "query { categories { id name } }"}';
    
    // Simulate HTTP request
    $GLOBALS['HTTP_RAW_POST_DATA'] = $query1;
    $result1 = GraphQL::handle();
    echo "Response: " . $result1 . "\n\n";

    // Test 2: Query Products
    echo "Test 2: Query Products\n";
    $query2 = '{"query": "query { products { id name inStock brand category } }"}';
    
    $GLOBALS['HTTP_RAW_POST_DATA'] = $query2;
    $result2 = GraphQL::handle();
    echo "Response: " . $result2 . "\n\n";

    // Test 3: Query Single Product
    echo "Test 3: Query Single Product\n";
    $query3 = '{"query": "query { product(id: \"huarache-x-stussy-le\") { id name inStock brand category prices { amount currency { label symbol } } } }"}';
    
    $GLOBALS['HTTP_RAW_POST_DATA'] = $query3;
    $result3 = GraphQL::handle();
    echo "Response: " . $result3 . "\n\n";

    // Test 4: Create Order
    echo "Test 4: Create Order\n";
    $query4 = '{"query": "mutation { createOrder(input: { customerEmail: \"test@example.com\", customerName: \"Test User\", items: [{ productId: \"huarache-x-stussy-le\", quantity: 1 }] }) { success message order { id customerEmail totalAmount } } }"}';
    
    $GLOBALS['HTTP_RAW_POST_DATA'] = $query4;
    $result4 = GraphQL::handle();
    echo "Response: " . $result4 . "\n\n";

    echo "Testing completed!\n";
}

// Run tests
try {
    testGraphQL();
} catch (Exception $e) {
    echo "Error during testing: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
} 