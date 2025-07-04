<?php

require_once __DIR__ . '/../vendor/autoload.php';

use src\database\Database;
use src\Model\Category;
use src\Model\Product\ProductFactory;
use src\Model\Attribute\AttributeSet;
use src\Model\Attribute\AttributeItem;
use src\Model\Price;

class DataImporter
{
    private $database;
    private $data;

    public function __construct()
    {
        $this->database = Database::getInstance();
        $this->loadData();
    }

    private function loadData()
    {
        $jsonFile = __DIR__ . '/data.json';
        if (!file_exists($jsonFile)) {
            throw new Exception('data.json file not found');
        }

        $jsonContent = file_get_contents($jsonFile);
        $this->data = json_decode($jsonContent, true);

        if (!$this->data || !isset($this->data['data'])) {
            throw new Exception('Invalid JSON data format');
        }
    }

    public function import()
    {
        echo "Starting data import...\n";

        // Import categories
        $this->importCategories();

        // Import products
        $this->importProducts();

        echo "Data import completed successfully!\n";
    }

    private function importCategories()
    {
        echo "Importing categories...\n";
        
        $categories = $this->data['data']['categories'] ?? [];
        
        foreach ($categories as $categoryData) {
            $category = new Category();
            $category->setName($categoryData['name']);
            
            if ($category->save()) {
                echo "Imported category: {$categoryData['name']}\n";
            } else {
                echo "Failed to import category: {$categoryData['name']}\n";
            }
        }
    }

    private function importProducts()
    {
        echo "Importing products...\n";
        
        $products = $this->data['data']['products'] ?? [];
        
        foreach ($products as $productData) {
            $this->importProduct($productData);
        }
    }

    private function importProduct($productData)
    {
        // Get category ID
        $categoryName = $productData['category'] ?? '';
        $category = Category::findAll(['name' => $categoryName]);
        $categoryId = $category[0]->getId() ?? 1; // Default to first category if not found

        // Create product
        $product = ProductFactory::createProduct($productData);
        $product->setName($productData['name']);
        $product->setDescription($productData['description'] ?? '');
        $product->setInStock($productData['inStock'] ?? true);
        $product->setCategoryId($categoryId);
        $product->setBrand($productData['brand'] ?? '');

        if (!$product->save()) {
            echo "Failed to import product: {$productData['name']}\n";
            return;
        }

        echo "Imported product: {$productData['name']}\n";

        // Import product images
        $this->importProductImages($product->getId(), $productData['gallery'] ?? []);

        // Import product attributes
        $this->importProductAttributes($product->getId(), $productData['attributes'] ?? []);

        // Import product prices
        $this->importProductPrices($product->getId(), $productData['prices'] ?? []);
    }

    private function importProductImages($productId, $gallery)
    {
        $conn = $this->database->getConnection();
        
        foreach ($gallery as $index => $imageUrl) {
            $sql = "INSERT INTO product_images (product_id, url, sort_order) VALUES (:product_id, :url, :sort_order)";
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                'product_id' => $productId,
                'url' => $imageUrl,
                'sort_order' => $index
            ]);
        }
    }

    private function importProductAttributes($productId, $attributes)
    {
        foreach ($attributes as $attributeData) {
            // Create attribute set
            $attributeSet = new AttributeSet();
            $attributeSet->setProductId($productId);
            $attributeSet->setName($attributeData['name']);
            $attributeSet->setType($attributeData['type'] ?? 'text');

            if (!$attributeSet->save()) {
                echo "Failed to import attribute set: {$attributeData['name']}\n";
                continue;
            }

            // Import attribute items
            $this->importAttributeItems($attributeSet->getId(), $attributeData['items'] ?? []);
        }
    }

    private function importAttributeItems($attributeId, $items)
    {
        foreach ($items as $itemData) {
            $attributeItem = new AttributeItem();
            $attributeItem->setAttributeId($attributeId);
            $attributeItem->setDisplayValue($itemData['displayValue']);
            $attributeItem->setValue($itemData['value']);
            $attributeItem->setItemId($itemData['id']);

            if (!$attributeItem->save()) {
                echo "Failed to import attribute item: {$itemData['displayValue']}\n";
            }
        }
    }

    private function importProductPrices($productId, $prices)
    {
        foreach ($prices as $priceData) {
            $price = new Price();
            $price->setProductId($productId);
            $price->setAmount($priceData['amount']);
            $price->setCurrencyLabel($priceData['currency']['label'] ?? 'USD');
            $price->setCurrencySymbol($priceData['currency']['symbol'] ?? '$');

            if (!$price->save()) {
                echo "Failed to import price for product: {$productId}\n";
            }
        }
    }
}

// Run the import
try {
    $importer = new DataImporter();
    $importer->import();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
} 