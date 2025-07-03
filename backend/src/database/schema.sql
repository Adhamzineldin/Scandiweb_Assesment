-- Create database
CREATE DATABASE IF NOT EXISTS scandiweb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scandiweb;

-- Categories table
CREATE TABLE IF NOT EXISTS categories
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products
(
    id          VARCHAR(255) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    in_stock    BOOLEAN   DEFAULT TRUE,
    category_id INT          NOT NULL,
    brand       VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_brand (brand),
    INDEX idx_stock (in_stock)
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    url        TEXT         NOT NULL,
    sort_order INT       DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    INDEX idx_product_images (product_id)
);

-- Attributes table
CREATE TABLE IF NOT EXISTS attributes
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    name       VARCHAR(255) NOT NULL,
    type       ENUM ('text', 'swatch', 'select') DEFAULT 'text',
    created_at TIMESTAMP                         DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    INDEX idx_product_attributes (product_id),
    INDEX idx_attribute_name (name)
);

-- Attribute items table
CREATE TABLE IF NOT EXISTS attribute_items
(
    id            INT AUTO_INCREMENT PRIMARY KEY,
    attribute_id  INT          NOT NULL,
    display_value VARCHAR(255) NOT NULL,
    value         VARCHAR(255) NOT NULL,
    item_id       VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attribute_id) REFERENCES attributes (id) ON DELETE CASCADE,
    INDEX idx_attribute_items (attribute_id),
    INDEX idx_item_id (item_id)
);

-- Prices table
CREATE TABLE IF NOT EXISTS prices
(
    id              INT AUTO_INCREMENT PRIMARY KEY,
    product_id      VARCHAR(255)   NOT NULL,
    amount          DECIMAL(10, 2) NOT NULL,
    currency_label  VARCHAR(10)    NOT NULL DEFAULT 'USD',
    currency_symbol VARCHAR(5)     NOT NULL DEFAULT '$',
    created_at      TIMESTAMP               DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP               DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    INDEX idx_product_prices (product_id),
    INDEX idx_currency (currency_label)
);

-- Insert default categories if they don't exist
INSERT IGNORE INTO categories (name)
VALUES ('all'),
       ('clothes'),
       ('tech');