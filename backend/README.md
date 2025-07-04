# Scandiweb Assessment Backend

This is the backend implementation for the Scandiweb assessment, featuring a GraphQL API with polymorphic models for categories, products, and attributes.

## Features

### Models with Polymorphism

#### Abstract Models
- **AbstractModel**: Base model with common CRUD operations
- **AbstractProduct**: Base product model with common product functionality
- **AbstractAttribute**: Base attribute model for different attribute types

#### Product Types
- **ClothingProduct**: Specialized for clothing items with size, color, and material attributes
- **TechProduct**: Specialized for technology items with capacity, color, and feature attributes
- **GenericProduct**: General product type for other categories

#### Attribute Types
- **TextAttribute**: For text-based attributes (Size, Capacity, etc.)
- **SwatchAttribute**: For color swatch attributes with hex color validation
- **SelectAttribute**: For select/dropdown attributes with predefined options

#### Supporting Models
- **Category**: Product categories
- **AttributeSet**: Collections of attributes for products
- **AttributeItem**: Individual attribute values
- **Price**: Product pricing information
- **Order**: Order management
- **OrderItem**: Individual items within orders

### GraphQL Schema

#### Queries
- `categories`: Get all categories
- `category(id, name)`: Get a specific category
- `products(categoryId, inStock, brand, sortBy, sortOrder, limit)`: Get products with filtering
- `product(id)`: Get a specific product

#### Mutations
- `createOrder(input)`: Create a new order with items

#### Types
- **Category**: Category information
- **Product**: Product information with attributes and prices
- **AttributeSet**: Attribute collections
- **Attribute**: Individual attribute items
- **Price**: Pricing information with currency
- **Currency**: Currency details
- **Order**: Order information
- **OrderItem**: Order item details

## Database Schema

The database includes tables for:
- `categories`: Product categories
- `products`: Product information
- `product_images`: Product image galleries
- `attributes`: Product attribute sets
- `attribute_items`: Individual attribute values
- `prices`: Product pricing
- `orders`: Customer orders
- `order_items`: Items within orders

## Setup Instructions

1. **Install Dependencies**
   ```bash
   composer install
   ```

2. **Configure Database**
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`

3. **Create Database**
   ```bash
   mysql -u your_user -p < src/database/schema.sql
   ```

4. **Import Sample Data**
   ```bash
   php src/database/import_data.php
   ```

5. **Start Server**
   ```bash
   php -S localhost:8000 -t public
   ```

## GraphQL Examples

### Query Categories
```graphql
query {
  categories {
    id
    name
  }
}
```

### Query Products
```graphql
query {
  products(categoryId: 2, inStock: true) {
    id
    name
    inStock
    brand
    category
    prices {
      amount
      currency {
        label
        symbol
      }
    }
    attributes {
      id
      name
      type
      items {
        id
        displayValue
        value
      }
    }
  }
}
```

### Create Order
```graphql
mutation {
  createOrder(input: {
    customerEmail: "customer@example.com"
    customerName: "John Doe"
    items: [
      {
        productId: "huarache-x-stussy-le"
        quantity: 2
        selectedAttributes: "{\"Size\": \"42\"}"
      }
    ]
  }) {
    success
    message
    order {
      id
      customerEmail
      customerName
      totalAmount
      status
      items {
        productId
        quantity
        unitPrice
        subtotal
      }
    }
  }
}
```

## Architecture Highlights

### Polymorphism Implementation
- **Product Factory**: Creates appropriate product types based on category
- **Attribute Factory**: Creates appropriate attribute types based on type field
- **No Switch Statements**: Each product/attribute type handles its own logic

### GraphQL Features
- **Type Registry**: Manages GraphQL types and prevents circular dependencies
- **Resolvers**: Separate resolver classes for queries and mutations
- **Input Validation**: Comprehensive input validation in mutations
- **Error Handling**: Proper error responses for failed operations

### Database Design
- **Normalized Schema**: Proper relationships between tables
- **Indexing**: Optimized indexes for common queries
- **Foreign Keys**: Referential integrity constraints
- **Flexible Attributes**: JSON storage for selected attributes in orders

## API Endpoint

The GraphQL endpoint is available at:
```
POST /graphql
```

Content-Type: `application/json`

Request body should contain:
```json
{
  "query": "your_graphql_query_here",
  "variables": {}
}
``` 