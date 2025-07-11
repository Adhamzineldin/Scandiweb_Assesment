import React, { useState, useEffect } from 'react';
import { useCart } from '../App';
import { PlaceOrderData, Attribute } from '../types';

interface CartOverlayProps {
  open: boolean;
  onClose: () => void;
  onPlaceOrder: (data: PlaceOrderData) => Promise<void>;
}

// Helper function to determine if an attribute represents a color
const isColorOption = (attribute: Attribute): boolean => {
  return attribute.type === 'swatch' || 
         attribute.name?.toLowerCase().includes('color') ||
         attribute.id?.toLowerCase().includes('color');
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
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .toLowerCase()
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Replace multiple consecutive hyphens with single hyphen
};

// Component to handle individual cart item attributes
const CartItemAttributes: React.FC<{
  item: any;
  itemIndex: number;
}> = ({ item, itemIndex }) => {
  // Use attributes directly from the cart item (no API call needed)
  const attributes = item.attributes || [];

  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      {attributes.map((attr: Attribute) => (
        <div key={attr.id} className="mb-2" data-testid={`cart-item-attribute-${toKebabCase(attr.name)}`}>
          <div style={{ fontSize: '14px', fontWeight: '400', marginBottom: '4px' }}>
            {attr.name}:
          </div>
          <div className="d-flex flex-wrap gap-1">
            {attr.items.map((option: any) => {
              const isSelected = item.selectedOptions[attr.id] === option.value;
              const isColor = isColorOption(attr);
              const attrKebab = toKebabCase(attr.name);
              
              if (isColor) {
                const colorValue = getColorValue(option.value);
                return (
                  <button
                    key={option.id}
                    className="border-0 position-relative"
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: colorValue,
                      border: isSelected ? '3px solid #5ECE7B' : '1px solid #A6A6A6',
                      cursor: 'default',
                      padding: 0
                    }}
                    title={option.displayValue}
                    data-testid={isSelected ? `cart-item-attribute-${attrKebab}-${attrKebab}-selected` : `cart-item-attribute-${attrKebab}-${attrKebab}`}
                    disabled
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
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              } else {
                return (
                  <button
                    key={option.id}
                    className="btn btn-sm"
                    style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      border: '1px solid #1D1F22',
                      backgroundColor: isSelected ? '#1D1F22' : 'transparent',
                      color: isSelected ? 'white' : '#1D1F22',
                      minWidth: '30px',
                      cursor: 'default'
                    }}
                    data-testid={isSelected ? `cart-item-attribute-${attrKebab}-${attrKebab}-selected` : `cart-item-attribute-${attrKebab}-${attrKebab}`}
                    disabled
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
  
  // Calculate total using proper pricing data
  const total = cart.reduce((sum, item) => {
    const itemPrice = item.prices && item.prices[0] ? item.prices[0].amount : item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);
  
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

  // Force early return if not open - extra safety
  if (!open) {
    return null;
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    await onPlaceOrder({ customerName: 'Customer', customerEmail: 'customer@example.com' });
    setLoading(false);
  };

  const canPlaceOrder = cart.length > 0 && !loading;

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
        data-testid="cart-overlay"
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
              My Bag, <span style={{ fontWeight: '500' }}>{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
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
                      marginBottom: '4px'
                    }}>
                      {item.name}
                    </div>
                    {item.brand && (
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '300',
                        color: '#8D8F9A',
                        marginBottom: '6px'
                      }}>
                        {item.brand}
                      </div>
                    )}
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '500',
                      color: '#1D1F22',
                      marginBottom: '8px'
                    }}>
                      {item.prices && item.prices[0] ? 
                        `${item.prices[0].currency.symbol}${item.prices[0].amount.toFixed(2)}` : 
                        `${item.currency}${item.price.toFixed(2)}`
                      }
                    </div>
                    <CartItemAttributes 
                      item={item} 
                      itemIndex={idx} 
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
                      data-testid='cart-item-amount-increase'
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
                      data-testid='cart-item-amount'
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
                      data-testid='cart-item-amount-decrease'
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
                      loading="lazy"
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
                data-testid='cart-total'
              >
                {cart.length > 0 && cart[0].prices && cart[0].prices[0] ? 
                  `${cart[0].prices[0].currency.symbol}${total.toFixed(2)}` : 
                  `$${total.toFixed(2)}`
                }
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