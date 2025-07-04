import React, { useState, useEffect } from 'react';
import { useCart } from '../App';
import { PlaceOrderData, Product } from '../types';
import { useQuery, gql } from '@apollo/client';

const GET_PRODUCT_QUERY = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      name
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

interface CartOverlayProps {
  open: boolean;
  onClose: () => void;
  onPlaceOrder: (data: PlaceOrderData) => Promise<void>;
}

// Helper function to determine if an option key represents a color
const isColorOption = (key: string): boolean => {
  return key.toLowerCase().includes('color');
};

// Helper function to get color value from option value
const getColorValue = (value: string): string => {
  // Check if the value is already a hex color
  if (value && value.startsWith('#')) {
    return value;
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
  
  const colorName = value?.toLowerCase();
  return colorMap[colorName] || value || '#CCCCCC';
};

// Helper function to convert string to kebab-case
const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

// Component to handle individual cart item attributes
const CartItemAttributes: React.FC<{
  item: any;
  itemIndex: number;
  onAttributeChange: (itemIndex: number, attributeId: string, value: string) => void;
}> = ({ item, itemIndex, onAttributeChange }) => {
  const { data, loading } = useQuery<{ product: Product }>(GET_PRODUCT_QUERY, {
    variables: { id: item.id },
    skip: !item.id
  });

  if (loading || !data?.product?.attributes) {
    return null;
  }

  const attributes = data.product.attributes;

  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      {attributes.map(attr => (
        <div key={attr.id} className="mb-2" data-testid={`cart-item-attribute-${toKebabCase(attr.name)}`}>
          <div style={{ fontSize: '14px', fontWeight: '400', marginBottom: '4px' }}>
            {attr.name}:
          </div>
          <div className="d-flex flex-wrap gap-1">
            {attr.items.map(option => {
              const isSelected = item.selectedOptions[attr.id] === option.value;
              const isColor = isColorOption(attr.name);
              const optionKebab = toKebabCase(option.value);
              const attrKebab = toKebabCase(attr.name);
              
              if (isColor) {
                const colorValue = getColorValue(option.value);
                return (
                  <button
                    key={option.id}
                    className="border-0"
                    onClick={() => onAttributeChange(itemIndex, attr.id, option.value)}
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: colorValue,
                      border: isSelected ? '2px solid #5ECE7B' : '1px solid #A6A6A6',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    title={option.displayValue}
                    data-testid={isSelected ? `cart-item-attribute-${attrKebab}-${optionKebab}-selected` : `cart-item-attribute-${attrKebab}-${optionKebab}`}
                  />
                );
              } else {
                return (
                  <button
                    key={option.id}
                    className="btn btn-sm"
                    onClick={() => onAttributeChange(itemIndex, attr.id, option.value)}
                    style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      border: '1px solid #1D1F22',
                      backgroundColor: isSelected ? '#1D1F22' : 'transparent',
                      color: isSelected ? 'white' : '#1D1F22',
                      minWidth: '30px'
                    }}
                    data-testid={isSelected ? `cart-item-attribute-${attrKebab}-${optionKebab}-selected` : `cart-item-attribute-${attrKebab}-${optionKebab}`}
                  >
                    {option.displayValue}
                  </button>
                );
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function CartOverlay({ open, onClose, onPlaceOrder }: CartOverlayProps) {
  const { cart, updateQuantity, removeFromCart, updateCartItemAttributes } = useCart();
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      document.body.classList.add('cart-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('cart-open');
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.classList.remove('cart-open');
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const handlePlaceOrder = async () => {
    setLoading(true);
    await onPlaceOrder({ customerName: 'Customer', customerEmail: 'customer@example.com' });
    setLoading(false);
  };

  const canPlaceOrder = cart.length > 0 && !loading;

  const handleAttributeChange = (itemIndex: number, attributeId: string, value: string) => {
    const item = cart[itemIndex];
    const newAttributes = { ...item.selectedOptions, [attributeId]: value };
    
    // Update cart item attributes
    if (updateCartItemAttributes) {
      updateCartItemAttributes(item.id, item.selectedOptions, newAttributes);
    }
  };

  return (
    <>
      {/* Overlay Background */}
      <div 
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: 'rgba(57, 55, 72, 0.22)',
          zIndex: 1050
        }}
        onClick={onClose}
      />
      
      {/* Cart Modal */}
      <div 
        className="position-fixed top-0 end-0 h-100 bg-white"
        style={{
          width: '525px',
          zIndex: 1051,
          boxShadow: '-4px 0px 20px rgba(168, 172, 176, 0.19)'
        }}
      >
        <div className="p-4 h-100 d-flex flex-column">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 style={{ 
              fontSize: '16px', 
              fontWeight: '700',
              color: '#1D1F22',
              margin: 0
            }}>
              My Bag, <span style={{ fontWeight: '500' }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            </h5>
          </div>

          {/* Cart Items */}
          <div className="flex-grow-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {cart.length === 0 ? (
              <div className="text-center text-muted py-5">Your cart is empty</div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="d-flex mb-4 pb-4" style={{ borderBottom: '1px solid #E5E5E5' }}>
                  {/* Product Info */}
                  <div className="flex-grow-1 me-3">
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '300',
                      color: '#1D1F22',
                      marginBottom: '8px'
                    }}>
                      {item.name}
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '500',
                      color: '#1D1F22',
                      marginBottom: '8px'
                    }}>
                      {item.currency}{item.price}
                    </div>
                    <CartItemAttributes 
                      item={item} 
                      itemIndex={idx} 
                      onAttributeChange={handleAttributeChange} 
                    />
                  </div>

                  {/* Quantity Controls */}
                  <div className="d-flex flex-column align-items-center justify-content-between me-3">
                    <button 
                      className="btn border-0 p-0 d-flex align-items-center justify-content-center"
                      onClick={() => updateQuantity(item.id, item.selectedOptions, item.quantity + 1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '1px solid #1D1F22',
                        backgroundColor: 'transparent'
                      }}
                      data-testid="cart-item-amount-increase"
                    >
                      <span style={{ fontSize: '14px', color: '#1D1F22' }}>+</span>
                    </button>
                    
                    <span 
                      style={{ 
                        fontSize: '16px', 
                        fontWeight: '500',
                        color: '#1D1F22',
                        margin: '16px 0'
                      }}
                      data-testid="cart-item-amount"
                    >
                      {item.quantity}
                    </span>
                    
                    <button 
                      className="btn border-0 p-0 d-flex align-items-center justify-content-center"
                      onClick={() => item.quantity === 1 ? removeFromCart(item.id, item.selectedOptions) : updateQuantity(item.id, item.selectedOptions, item.quantity - 1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '1px solid #1D1F22',
                        backgroundColor: 'transparent'
                      }}
                      data-testid="cart-item-amount-decrease"
                    >
                      <span style={{ fontSize: '14px', color: '#1D1F22' }}>-</span>
                    </button>
                  </div>

                  {/* Product Image */}
                  <div 
                    className="cart-item-image-container"
                    style={{
                      width: '120px',
                      height: '120px',
                      backgroundColor: 'white',
                      border: '1px solid #f5f5f5',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center'
                      }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total and Checkout */}
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                color: '#1D1F22'
              }}>
                Total
              </span>
              <span 
                style={{ 
                  fontSize: '16px', 
                  fontWeight: '700',
                  color: '#1D1F22'
                }}
                data-testid="cart-total"
              >
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              className="btn w-100"
              disabled={!canPlaceOrder}
              onClick={handlePlaceOrder}
              style={{
                backgroundColor: '#5ECE7B',
                border: 'none',
                borderRadius: '0',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                textTransform: 'uppercase',
                opacity: canPlaceOrder ? 1 : 0.5
              }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : null}
              Place Order
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 