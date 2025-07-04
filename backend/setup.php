<?php

/**
 * Setup script for Scandiweb Assessment Backend
 * This script helps with initial configuration and data import
 */

echo "Scandiweb Assessment Backend Setup\n";
echo "==================================\n\n";

// Check if .env file exists
if (!file_exists(__DIR__ . '/.env')) {
    echo "Creating .env file...\n";
    $envContent = "# Database Configuration\n";
    $envContent .= "DB_HOST=localhost\n";
    $envContent .= "DB_PORT=3306\n";
    $envContent .= "DB_NAME=scandiweb\n";
    $envContent .= "DB_USER=root\n";
    $envContent .= "DB_PASS=\n\n";
    $envContent .= "# Application Configuration\n";
    $envContent .= "APP_ENV=development\n";
    $envContent .= "APP_DEBUG=true\n";

    file_put_contents(__DIR__ . '/.env', $envContent);
    echo "Created .env file. Please update the database credentials.\n\n";
} else {
    echo ".env file already exists.\n\n";
}

// Check if vendor directory exists
if (!is_dir(__DIR__ . '/vendor')) {
    echo "Installing Composer dependencies...\n";
    echo "Please run: composer install\n\n";
} else {
    echo "Composer dependencies are installed.\n\n";
}

// Check if data.json exists
if (!file_exists(__DIR__ . '/src/database/data.json')) {
    echo "ERROR: data.json file not found in src/database/\n";
    echo "Please ensure the data.json file is present.\n\n";
} else {
    echo "data.json file found.\n\n";
}

echo "Setup Instructions:\n";
echo "1. Update database credentials in .env file\n";
echo "2. Run: composer install (if not already done)\n";
echo "3. Create database and import schema:\n";
echo "   mysql -u your_user -p < src/database/schema.sql\n";
echo "4. Import sample data:\n";
echo "   php src/database/import_data.php\n";
echo "5. Start the server:\n";
echo "   php -S localhost:8000 -t public\n";
echo "6. Test the API:\n";
echo "   php test_graphql.php\n\n";

echo "Setup completed!\n"; 