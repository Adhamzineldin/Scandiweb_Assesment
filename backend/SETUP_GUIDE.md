# Setup Guide for Scandiweb Assessment Backend

## Prerequisites

- PHP 8.0 or higher
- MySQL 5.7 or higher
- Composer

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
composer install
```

### 2. Configure Environment

Create a `.env` file in the backend directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=scandiweb
DB_USER=your_username
DB_PASS=your_password

# Application Configuration
APP_ENV=development
APP_DEBUG=true
```

### 3. Create Database

```bash
mysql -u your_username -p -e "CREATE DATABASE IF NOT EXISTS scandiweb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Import Database Schema

```bash
mysql -u your_username -p scandiweb < src/database/schema.sql
```

### 5. Import Sample Data

```bash
php src/database/import_data.php
```

### 6. Test Database Connection

```bash
php test_database.php
```

### 7. Test GraphQL API

```bash
php test_graphql.php
```

### 8. Start Development Server

```bash
php -S localhost:8000 -t public
```

## Troubleshooting

### Database Connection Issues

1. **Check .env file**: Ensure all database credentials are correct
2. **Verify MySQL service**: Make sure MySQL is running
3. **Test connection**: Run `php test_database.php`

### GraphQL Issues

1. **Check data import**: Ensure sample data was imported successfully
2. **Verify schema**: Make sure all tables exist
3. **Test individual queries**: Use the test script to isolate issues

### Common Errors

#### "Headers already sent"
- This is expected in the test environment
- The test script simulates HTTP requests

#### "No input data provided"
- Check that the test script is properly formatted
- Ensure GraphQL queries are valid JSON

#### "Database connection failed"
- Verify .env file exists and has correct credentials
- Check MySQL service is running
- Ensure database exists

## Testing the API

### Using the Test Script

The `test_graphql.php` script tests:
1. Querying categories
2. Querying products
3. Querying a single product
4. Creating an order

### Manual Testing

You can also test manually using curl:

```bash
# Query categories
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { categories { id name } }"}'

# Query products
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { products { id name inStock brand } }"}'

# Create order
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { createOrder(input: { customerEmail: \"test@example.com\", customerName: \"Test User\", items: [{ productId: \"huarache-x-stussy-le\", quantity: 1 }] }) { success message } }"}'
```

## File Structure

```
backend/
├── src/
│   ├── Controller/
│   │   └── GraphQL.php          # Main GraphQL controller
│   ├── Database/
│   │   ├── Database.php         # Database connection
│   │   ├── schema.sql          # Database schema
│   │   ├── data.json           # Sample data
│   │   └── import_data.php     # Data import script
│   ├── GraphQL/
│   │   ├── Types/              # GraphQL type definitions
│   │   └── Resolvers/          # Query and mutation resolvers
│   └── Model/                  # Polymorphic models
├── vendor/                     # Composer dependencies
├── public/                     # Web server directory
├── .env                        # Environment configuration
├── composer.json              # PHP dependencies
├── test_database.php          # Database connection test
├── test_graphql.php           # GraphQL API test
└── setup.php                  # Setup assistance script
```

## Expected Output

### Database Test
```
Testing Database Connection
==========================

✅ Database connection successful!
✅ Categories table accessible. Count: 3
✅ Products table accessible. Count: 8
```

### GraphQL Test
```
Testing GraphQL Implementation
===============================

Test 1: Query Categories
Response: {"data":{"categories":[{"id":1,"name":"all"},{"id":2,"name":"clothes"},{"id":3,"name":"tech"}]}}

Test 2: Query Products
Response: {"data":{"products":[{"id":"huarache-x-stussy-le","name":"Nike Air Huarache Le",...}]}}

Test 3: Query Single Product
Response: {"data":{"product":{"id":"huarache-x-stussy-le","name":"Nike Air Huarache Le",...}}}

Test 4: Create Order
Response: {"data":{"createOrder":{"success":true,"message":"Order created successfully",...}}}

Testing completed!
```

## Next Steps

Once the backend is working:

1. **Frontend Integration**: Connect your frontend to the GraphQL API
2. **Additional Features**: Extend the API with more mutations and queries
3. **Production Deployment**: Configure for production environment
4. **Testing**: Add comprehensive unit and integration tests 