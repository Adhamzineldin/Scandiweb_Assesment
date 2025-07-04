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
          backgroundColor: 'white'
        }}
      >
        <img 
          src={mainImage} 
          className="w-100 h-100" 
          alt={product.name} 
          style={{ 
            objectFit: 'cover',
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
              bottom: '16px',
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
            <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.5615 5.87361C19.1824 5.41034 18.5924 5.12874 17.9824 5.12874H5.15892L4.75859 3.63901C4.52682 2.773 3.72784 2.16888 2.80108 2.16888H0.653061C0.294884 2.16888 0 2.45048 0 2.79348C0 3.13566 0.294102 3.41808 0.653061 3.41808H2.80108C3.11726 3.41808 3.39023 3.61943 3.47426 3.92142L6.04306 13.7077C6.27483 14.5737 7.07381 15.1778 8.00057 15.1778H16.4034C17.3302 15.1778 18.1507 14.5737 18.3613 13.7077L19.9405 7.50574C20.0884 6.94097 19.9619 6.33686 19.5615 5.87361ZM18.6566 7.22253L17.0774 13.4245C16.9934 13.7265 16.7198 13.9279 16.4036 13.9279H8.00073C7.68455 13.9279 7.41158 13.7265 7.32755 13.4245L5.49585 6.39756H17.9826C18.1938 6.39756 18.4047 6.49817 18.5308 6.65952C18.6569 6.81992 18.7191 7.02127 18.6566 7.22253Z" fill="white"/>
              <path d="M8.44437 16.9814C7.24418 16.9814 6.25488 17.9276 6.25488 19.0751C6.25488 20.2226 7.24418 21.1688 8.44437 21.1688C9.64456 21.1696 10.6339 20.2234 10.6339 19.0757C10.6339 17.928 9.64456 16.9812 8.44437 16.9812V16.9814ZM8.44437 19.9011C7.95998 19.9011 7.58077 19.5385 7.58077 19.0752C7.58077 18.6119 7.95998 18.2493 8.44437 18.2493C8.92875 18.2493 9.30796 18.6119 9.30796 19.0752C9.30714 19.5188 8.90711 19.9011 8.44437 19.9011Z" fill="white"/>
              <path d="M15.6881 16.9814C14.4879 16.9814 13.4986 17.9277 13.4986 19.0752C13.4986 20.2226 14.4886 21.1689 15.6881 21.1689C16.8883 21.1689 17.8776 20.2226 17.8776 19.0752C17.8561 17.9284 16.8883 16.9814 15.6881 16.9814ZM15.6881 19.9011C15.2037 19.9011 14.8245 19.5385 14.8245 19.0752C14.8245 18.612 15.2037 18.2493 15.6881 18.2493C16.1725 18.2493 16.5517 18.612 16.5517 19.0752C16.5517 19.5188 16.1517 19.9011 15.6881 19.9011Z" fill="white"/>
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