<?php

// Autoload
if (!file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    echo "❌ Composer autoload not found!\n";
    echo "Run: composer require vlucas/phpdotenv\n";
    exit(1);
}

require_once __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;

// Load .env
try {
    $envPath = dirname(__DIR__, 2);
    $dotenv = Dotenv::createImmutable($envPath);
    $dotenv->load();
    $dotenv->required(['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS']);
    echo "✅ Environment variables loaded\n";
} catch (Exception $e) {
    echo "❌ Env error: " . $e->getMessage() . "\n";
    exit(1);
}

// DB Connect
try {
    $dsn = sprintf(
        "mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4",
        $_ENV['DB_HOST'],
        $_ENV['DB_PORT'],
        $_ENV['DB_NAME']
    );

    $pdo = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    echo "✅ Connected to DB: {$_ENV['DB_NAME']} @ {$_ENV['DB_HOST']}\n";
} catch (PDOException $e) {
    echo "❌ DB connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Load JSON
$jsonFile = __DIR__ . '/data.json';
if (!file_exists($jsonFile)) {
    echo "❌ data.json not found in: " . __DIR__ . "\n";
    exit(1);
}

$json = file_get_contents($jsonFile);
$data = json_decode($json, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo "❌ JSON error: " . json_last_error_msg() . "\n";
    exit(1);
}

$importData = $data['data'] ?? null;
if (!is_array($importData) || !isset($importData['categories'], $importData['products'])) {
    echo "❌ Invalid JSON structure\n";
    exit(1);
}

echo "✅ JSON loaded\n";
echo "📊 Categories: " . count($importData['categories']) . "\n";
echo "📦 Products: " . count($importData['products']) . "\n";

// Confirm
echo "\n⚠️  This will delete existing data. Continue? (y/N): ";
$handle = fopen("php://stdin", "r");
$confirm = strtolower(trim(fgets($handle)));
fclose($handle);
if ($confirm !== 'y') {
    echo "❌ Cancelled\n";
    exit(0);
}

// Clear data (DELETE instead of TRUNCATE)
echo "\n🧹 Clearing old data...\n";
try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("DELETE FROM attribute_items");
    $pdo->exec("DELETE FROM attributes");
    $pdo->exec("DELETE FROM prices");
    $pdo->exec("DELETE FROM product_images");
    $pdo->exec("DELETE FROM products");
    $pdo->exec("DELETE FROM categories");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "✅ Old data deleted\n";
} catch (Exception $e) {
    echo "❌ Deletion error: " . $e->getMessage() . "\n";
    exit(1);
}

// Import
try {
    $pdo->beginTransaction();

    // Categories
    echo "\n📁 Inserting categories...\n";
    $categoryMap = [];
    $catInsert = $pdo->prepare("INSERT INTO categories (name) VALUES (?)");
    $catSelect = $pdo->prepare("SELECT id FROM categories WHERE name = ?");

    foreach ($importData['categories'] as $cat) {
        $catInsert->execute([$cat['name']]);
        $catSelect->execute([$cat['name']]);
        $id = $catSelect->fetchColumn();
        $categoryMap[$cat['name']] = $id;
        echo "  ✓ {$cat['name']} (ID: $id)\n";
    }

    // Prepare statements
    $productStmt = $pdo->prepare("
        INSERT INTO products (id, name, description, in_stock, category_id, brand) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $imageStmt = $pdo->prepare("
        INSERT INTO product_images (product_id, url, sort_order) 
        VALUES (?, ?, ?)
    ");
    $attributeStmt = $pdo->prepare("
        INSERT INTO attributes (product_id, name, type) 
        VALUES (?, ?, ?)
    ");
    $attributeItemStmt = $pdo->prepare("
        INSERT INTO attribute_items (attribute_id, display_value, value, item_id) 
        VALUES (?, ?, ?, ?)
    ");
    $priceStmt = $pdo->prepare("
        INSERT INTO prices (product_id, amount, currency_label, currency_symbol) 
        VALUES (?, ?, ?, ?)
    ");

    // Products
    echo "\n📦 Inserting products...\n";
    foreach ($importData['products'] as $product) {
        $catId = $categoryMap[$product['category']] ?? null;
        if (!$catId) throw new Exception("Category not found: " . $product['category']);

        $productStmt->execute([
            $product['id'],
            $product['name'],
            $product['description'],
            $product['inStock'] ? 1 : 0,
            $catId,
            $product['brand']
        ]);
        echo "  ✓ {$product['name']} (ID: {$product['id']})\n";

        foreach ($product['gallery'] as $i => $url) {
            $imageStmt->execute([$product['id'], $url, $i]);
        }

        foreach ($product['attributes'] as $attr) {
            $attributeStmt->execute([$product['id'], $attr['name'], $attr['type']]);
            $attrId = $pdo->lastInsertId();

            foreach ($attr['items'] as $item) {
                $attributeItemStmt->execute([
                    $attrId,
                    $item['displayValue'],
                    $item['value'],
                    $item['id']
                ]);
            }
        }

        foreach ($product['prices'] as $price) {
            $priceStmt->execute([
                $product['id'],
                $price['amount'],
                $price['currency']['label'],
                $price['currency']['symbol']
            ]);
        }
    }

    $pdo->commit();
    echo "\n✅ Import complete\n";
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo "❌ Import error: " . $e->getMessage() . "\n";
    exit(1);
}

// Summary
echo "\n📊 Import Stats:\n";
try {
    $tables = ['categories', 'products', 'product_images', 'attributes', 'attribute_items', 'prices'];
    foreach ($tables as $t) {
        $count = $pdo->query("SELECT COUNT(*) FROM $t")->fetchColumn();
        echo "  - $t: $count\n";
    }

    echo "\n📋 Sample Products:\n";
    $samples = $pdo->query("
        SELECT p.name, p.brand, c.name as category, p.in_stock 
        FROM products p 
        JOIN categories c ON p.category_id = c.id 
        LIMIT 3
    ")->fetchAll();

    foreach ($samples as $p) {
        $status = $p['in_stock'] ? '✅ In Stock' : '❌ Out';
        echo "  - {$p['name']} by {$p['brand']} ({$p['category']}) $status\n";
    }
} catch (Exception $e) {
    echo "❌ Stats error: " . $e->getMessage() . "\n";
}

echo "\n🎉 Done!\n";
