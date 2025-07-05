import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useCart, openCartGlobally } from '../App';
import { Product } from '../types';

const PRODUCT_QUERY = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      name
      brand
      gallery
      description
      prices {
        amount
        currency {
          label
          symbol
        }
      }
      inStock
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
`;

interface ProductDetailsProps {
  productId: string;
}

interface ProductQueryData {
  product: Product;
}

interface ProductQueryVariables {
  id: string;
}

// Helper function to convert string to kebab-case
const toKebabCase = (str: string): string => {
  return str
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .toLowerCase()
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Replace multiple consecutive hyphens with single hyphen
};

// Helper function to determine if an attribute is a color
const isColorAttribute = (attribute: any): boolean => {
  return attribute.type === 'swatch' || 
         attribute.name.toLowerCase().includes('color') ||
         attribute.id.toLowerCase().includes('color');
};

// Helper function to get color value from attribute item
const getColorValue = (item: any): string => {
  // Check if the value is already a hex color
  if (item.value && item.value.startsWith('#')) {
    return item.value;
  }
  
  // Map common color names to hex values
  const colorMap: Record<string, string> = {
    'green': '#44FF03',
    'cyan': '#03FFF7', 
    'blue': '#030BFF',
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'yellow': '#FFFF00',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'orange': '#FFA500',
    'brown': '#A52A2A',
    'gray': '#808080',
    'grey': '#808080'
  };
  
  const colorName = item.value?.toLowerCase() || item.displayValue?.toLowerCase();
  return colorMap[colorName] || item.value || '#CCCCCC';
};

// Helper function to parse HTML description without dangerouslySetInnerHTML
const parseHTMLDescription = (html: string): React.ReactNode[] => {
  if (!html) return [];
  
  // Simple HTML parser - handles basic tags
  const elements: React.ReactNode[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.querySelector('div');
  
  if (!container) return [html];
  
  const parseNode = (node: Node, key: number = 0): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const children = Array.from(element.childNodes).map((child, index) => 
        parseNode(child, index)
      );
      
      switch (element.tagName.toLowerCase()) {
        case 'p':
          return React.createElement('p', { key }, children);
        case 'br':
          return React.createElement('br', { key });
        case 'strong':
        case 'b':
          return React.createElement('strong', { key }, children);
        case 'em':
        case 'i':
          return React.createElement('em', { key }, children);
        case 'h1':
          return React.createElement('h1', { key }, children);
        case 'h2':
          return React.createElement('h2', { key }, children);
        case 'h3':
          return React.createElement('h3', { key }, children);
        case 'h4':
          return React.createElement('h4', { key }, children);
        case 'h5':
          return React.createElement('h5', { key }, children);
        case 'h6':
          return React.createElement('h6', { key }, children);
        case 'ul':
          return React.createElement('ul', { key }, children);
        case 'ol':
          return React.createElement('ol', { key }, children);
        case 'li':
          return React.createElement('li', { key }, children);
        case 'div':
          return React.createElement('div', { key }, children);
        case 'span':
          return React.createElement('span', { key }, children);
        default:
          return React.createElement('span', { key }, children);
      }
    }
    
    return null;
  };
  
  return Array.from(container.childNodes).map((node, index) => parseNode(node, index));
};

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const { data, loading, error } = useQuery<ProductQueryData, ProductQueryVariables>(PRODUCT_QUERY, { 
    variables: { id: productId },
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
    // Add timeout for test reliability
    context: {
      timeout: 10000, // 10 seconds
    },
  });
  const { addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  useEffect(() => {
    // Reset selected image when product changes
    setSelectedImageIndex(0);
    // Reset selected options when product changes
    setSelectedOptions({});
  }, [productId]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }} data-testid='product-loading'>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading product...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-danger" role="alert">
      Error loading product: {error.message}
    </div>
  );
  
  if (!data || !data.product) return (
    <div className="alert alert-warning" role="alert">
      Product not found.
    </div>
  );

  const product = data.product;
  const price = product.prices && product.prices[0];

  // Check if all required attributes are selected
  const allRequiredAttributesSelected = product.attributes.every(attr => 
    selectedOptions[attr.id] !== undefined
  );

  const canAddToCart = product.inStock && allRequiredAttributesSelected;

  const handleSelect = (attrId: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [attrId]: value }));
  };

  const handleAddToCart = () => {
    if (canAddToCart) {
      console.log('ProductDetails: Adding to cart and opening cart overlay');
      addToCart(product, selectedOptions);
      // Open cart overlay directly
      openCartGlobally();
    }
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handlePreviousImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex < product.gallery.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="row">
        {/* Product Gallery */}
        <div className="col-12 col-lg-6 mb-4">
          <div className="d-flex" data-testid='product-gallery'>
            {/* Thumbnail Gallery */}
            <div className="d-flex flex-column me-3" style={{ width: '80px' }}>
              {product.gallery.map((image, index) => (
                <div
                  key={index}
                  className="mb-2"
                  style={{
                    width: '80px',
                    height: '80px',
                    cursor: 'pointer',
                    border: selectedImageIndex === index ? '2px solid #5ECE7B' : '1px solid #e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s ease'
                  }}
                  onClick={() => handleImageSelect(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* Main Image Display */}
            <div className="flex-grow-1 position-relative">
              <div 
                style={{ 
                  width: '100%',
                  maxHeight: '500px',
                  height: '500px',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <img 
                  src={product.gallery[selectedImageIndex]} 
                  alt={product.name} 
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
                
                {/* Previous Arrow */}
                {selectedImageIndex > 0 && (
                  <button
                    onClick={handlePreviousImage}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: 'none',
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      zIndex: 10,
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                    }}
                  >
                    ‹
                  </button>
                )}
                
                {/* Next Arrow */}
                {selectedImageIndex < product.gallery.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: 'none',
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      zIndex: 10,
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                    }}
                  >
                    ›
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="col-12 col-lg-6">
          {/* Product Name */}
          <h1 style={{ fontSize: '30px', fontWeight: '600', color: '#1D1F22', marginBottom: '16px' }}>
            {product.name}
          </h1>

          {/* Product Brand */}
          {product.brand && (
            <div style={{ fontSize: '18px', fontWeight: '400', color: '#8D8F9A', marginBottom: '20px' }}>
              {product.brand}
            </div>
          )}

          {/* Product Attributes */}
          {product.attributes.map(attr => (
            <div 
              key={attr.id} 
              className="mb-4"
              data-testid={`product-attribute-${toKebabCase(attr.name)}`}
            >
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#1D1F22', 
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                {attr.name}:
              </div>
              <div className="d-flex flex-wrap gap-2">
                {attr.items.map(item => {
                  const isSelected = selectedOptions[attr.id] === item.value;
                  const isColor = isColorAttribute(attr);
                  
                  if (isColor) {
                    // Render color swatch
                    const colorValue = getColorValue(item);
                    return (
                      <button
                        key={item.id}
                        className="border-0 position-relative"
                        onClick={() => handleSelect(attr.id, item.value)}
                        type="button"
                        data-testid={`product-attribute-${toKebabCase(attr.name)}-${item.value}`}
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: colorValue,
                          cursor: 'pointer',
                          border: isSelected ? '3px solid #5ECE7B' : '2px solid #ccc',
                          borderRadius: '2px',
                          transition: 'border-color 0.2s ease'
                        }}
                        title={item.displayValue}
                      >
                        {/* Checkmark for selected color */}
                        {isSelected && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              color: colorValue === '#FFFFFF' || colorValue === '#ffffff' ? '#000' : '#fff',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  } else {
                    // Render text/size attribute
                    return (
                      <button
                        key={item.id}
                        className="btn"
                        onClick={() => handleSelect(attr.id, item.value)}
                        type="button"
                        data-testid={`product-attribute-${toKebabCase(attr.name)}-${item.value}`}
                        style={{
                          backgroundColor: isSelected ? '#1D1F22' : 'transparent',
                          borderColor: '#1D1F22',
                          color: isSelected ? 'white' : '#1D1F22',
                          minWidth: '63px',
                          height: '45px',
                          padding: '8px 16px',
                          border: '1px solid #1D1F22',
                          fontSize: '16px',
                          fontWeight: '400',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {item.displayValue}
                      </button>
                    );
                  }
                })}
              </div>
            </div>
          ))}

          {/* Product Price */}
          {price && (
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1D1F22',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase' }}>
                Price:
              </div>
              {price.currency.symbol}{price.amount.toFixed(2)}
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            className="btn w-100"
            disabled={!canAddToCart}
            onClick={handleAddToCart}
            data-testid='add-to-cart'
            style={{
              backgroundColor: canAddToCart ? '#5ECE7B' : '#9E9E9E',
              color: 'white',
              border: 'none',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              textTransform: 'uppercase',
              marginBottom: '40px',
              cursor: canAddToCart ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s ease'
            }}
          >
            Add to Cart
          </button>

          {/* Product Description */}
          <div data-testid='product-description' style={{ 
            fontSize: '16px', 
            lineHeight: '1.6', 
            color: '#1D1F22' 
          }}>
            {parseHTMLDescription(product.description || '')}
          </div>
        </div>
      </div>
    </div>
  );
} 