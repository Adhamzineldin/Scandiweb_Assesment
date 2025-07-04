import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

// Helper function to convert string to kebab-case
const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

// Helper function to get default attributes for quick shop
const getDefaultAttributes = (product: Product): Record<string, string> => {
  const defaultAttributes: Record<string, string> = {};
  
  if (product.attributes) {
    product.attributes.forEach(attr => {
      if (attr.items && attr.items.length > 0) {
        // Use the first item as default
        defaultAttributes[attr.id] = attr.items[0].value;
      }
    });
  }
  
  return defaultAttributes;
};

export default function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const mainImage = product.gallery && product.gallery[0];
  const price = product.prices && product.prices[0];

  const handleCardClick = () => {
    if (onProductClick) onProductClick(product);
  };

  const handleQuickShop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inStock) {
      // Add product with default attributes
      const productWithDefaults = {
        ...product,
        defaultAttributes: getDefaultAttributes(product)
      };
      onAddToCart(productWithDefaults);
    }
  };

  return (
    <div
      className="position-relative"
      style={{ cursor: 'pointer' }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`product-${toKebabCase(product.name)}`}
    >
      {/* Product Image Container */}
      <div 
        className="position-relative overflow-hidden"
        style={{ 
          height: '340px',
          backgroundColor: '#f8f9fa'
        }}
      >
        <img 
          src={mainImage} 
          className="w-100 h-100" 
          alt={product.name} 
          style={{ 
            objectFit: 'contain',
            transition: 'transform 0.3s ease',
            filter: !product.inStock ? 'grayscale(100%) opacity(0.5)' : 'none'
          }} 
        />
        
        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.73)',
              color: '#8D8F9A',
              fontSize: '24px',
              fontWeight: '400',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Out of Stock
          </div>
        )}

        {/* Quick Shop Button - Shows on Hover for In-Stock Products Only */}
        {isHovered && product.inStock && (
          <button
            className="position-absolute btn"
            onClick={handleQuickShop}
            style={{
              bottom: '72px',
              right: '16px',
              width: '52px',
              height: '52px',
              backgroundColor: '#5ECE7B',
              border: 'none',
              borderRadius: '50%',
              boxShadow: '0px 4px 11px rgba(29, 31, 34, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              opacity: 1,
              transform: 'scale(1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.5 6.5L18.5 17.5H1.5L0.5 6.5H19.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 9C14 7 12 5 10 5C8 5 6 7 6 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3">
        <div 
          style={{ 
            fontSize: '18px',
            fontWeight: '300',
            color: product.inStock ? '#1D1F22' : '#8D8F9A',
            marginBottom: '8px',
            lineHeight: '1.6'
          }}
        >
          {product.name}
        </div>
        {price && (
          <div 
            style={{ 
              fontSize: '18px',
              fontWeight: '500',
              color: product.inStock ? '#1D1F22' : '#8D8F9A'
            }}
          >
            {price.currency.symbol}{price.amount.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
} 