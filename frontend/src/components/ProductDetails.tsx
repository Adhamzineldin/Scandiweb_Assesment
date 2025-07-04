import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useCart } from '../App';
import { Product } from '../types';

const PRODUCT_QUERY = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      name
      brand
      gallery
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

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const { data, loading, error } = useQuery<ProductQueryData, ProductQueryVariables>(PRODUCT_QUERY, { variables: { id: productId } });
  const { addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  if (loading) return <div>Loading product...</div>;
  if (error) return <div>Error loading product.</div>;
  if (!data || !data.product) return <div>Product not found.</div>;

  const product = data.product;
  const price = product.prices && product.prices[0];

  const handleSelect = (attrId: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [attrId]: value }));
  };

  const handleAddToCart = () => {
    addToCart(product, selectedOptions);
  };

  return (
    <div className="row">
      <div className="col-md-6">
        <img src={product.gallery[0]} alt={product.name} className="img-fluid" />
      </div>
      <div className="col-md-6">
        <h2>{product.name}</h2>
        <p>{product.brand}</p>
        {price && <p>{price.currency.symbol}{price.amount}</p>}
        {product.attributes.map(attr => (
          <div key={attr.id} className="mb-3">
            <div className="fw-bold mb-2">{attr.name}:</div>
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
                      className={`border-0 position-relative`}
                      onClick={() => handleSelect(attr.id, item.value)}
                      type="button"
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: colorValue,
                        cursor: 'pointer',
                        border: isSelected ? '3px solid #5ECE7B' : '2px solid #ccc',
                        borderRadius: '2px'
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
                  // Render text attribute
                  return (
                    <button
                      key={item.id}
                      className={`btn btn-sm ${isSelected ? 'btn-dark' : 'btn-outline-secondary'}`}
                      onClick={() => handleSelect(attr.id, item.value)}
                      type="button"
                      style={{
                        backgroundColor: isSelected ? '#1D1F22' : 'transparent',
                        borderColor: isSelected ? '#1D1F22' : '#6c757d',
                        color: isSelected ? 'white' : '#6c757d',
                        minWidth: '50px',
                        padding: '8px 16px'
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
        <button
          className="btn btn-success mt-3"
          disabled={!product.inStock}
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
} 