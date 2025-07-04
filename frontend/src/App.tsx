import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import './App.css'
import Header from './components/Header'
import CartOverlay from './components/CartOverlay'
import ProductList from './components/ProductList'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import ProductDetails from './components/ProductDetails'
import CategoryList from './components/CategoryList'
import { useMutation, gql } from '@apollo/client'
import { CartContextType, CartItem, Product, CreateOrderInput, CreateOrderResponse, PlaceOrderData } from './types'

// Cart Context
const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Helper to compare options
  const optionsEqual = (a: Record<string, string> | undefined, b: Record<string, string> | undefined): boolean => {
    return JSON.stringify(a || {}) === JSON.stringify(b || {});
  };

  const addToCart = (product: Product, selectedOptions: Record<string, string>) => {
    setCart(prev => {
      const idx = prev.findIndex(
        item => item.id === product.id && optionsEqual(item.selectedOptions, selectedOptions)
      );
      if (idx !== -1) {
        // Increase quantity
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      } else {
        // Add new line
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            image: product.gallery && product.gallery[0],
            price: product.prices && product.prices[0] ? product.prices[0].amount : 0,
            currency: product.prices && product.prices[0] ? product.prices[0].currency.symbol : '$',
            selectedOptions,
            quantity: 1,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string, selectedOptions: Record<string, string>) => {
    setCart(prev => prev.filter(item => !(item.id === productId && optionsEqual(item.selectedOptions, selectedOptions))));
  };

  const updateQuantity = (productId: string, selectedOptions: Record<string, string>, quantity: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId && optionsEqual(item.selectedOptions, selectedOptions)) {
        return { ...item, quantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const updateCartItemAttributes = (productId: string, oldOptions: Record<string, string>, newOptions: Record<string, string>) => {
    setCart(prev => {
      // Find the item to update
      const itemIndex = prev.findIndex(item => 
        item.id === productId && optionsEqual(item.selectedOptions, oldOptions)
      );
      
      if (itemIndex === -1) return prev;
      
      const itemToUpdate = prev[itemIndex];
      
      // Check if there's already an item with the same ID and new attributes
      const existingItemIndex = prev.findIndex(item => 
        item.id === productId && optionsEqual(item.selectedOptions, newOptions)
      );
      
      let updatedCart = [...prev];
      
      if (existingItemIndex !== -1 && existingItemIndex !== itemIndex) {
        // Merge with existing item: add quantities together
        updatedCart[existingItemIndex].quantity += itemToUpdate.quantity;
        // Remove the old item
        updatedCart.splice(itemIndex, 1);
      } else {
        // Just update the attributes
        updatedCart[itemIndex] = { ...itemToUpdate, selectedOptions: newOptions };
      }
      
      return updatedCart;
    });
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, updateQuantity, updateCartItemAttributes, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      success
      message
      order {
        id
      }
    }
  }
`;

function App() {
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('all');
  const { addToCart, cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [createOrder] = useMutation<{ createOrder: CreateOrderResponse }, { input: CreateOrderInput }>(CREATE_ORDER_MUTATION);

  const handleAddToCart = (product: Product) => {
    // Check if product has default attributes (from quick shop)
    const defaultAttributes = (product as any).defaultAttributes;
    addToCart(product, defaultAttributes || {});
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategoryName(categoryName);
    navigate('/');
  };

  const handlePlaceOrder = async ({ customerName, customerEmail }: PlaceOrderData) => {
    const items = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      selectedAttributes: JSON.stringify(item.selectedOptions || {})
    }));
    try {
      const { data } = await createOrder({
        variables: {
          input: {
            customerName,
            customerEmail,
            items
          }
        }
      });
      if (data?.createOrder.success) {
        clearCart();
        alert('Order placed successfully!');
      } else {
        alert('Order failed: ' + (data?.createOrder.message || 'Unknown error'));
      }
    } catch (e) {
      alert('Order failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <>
      <Header 
        onCartClick={() => setCartOpen(true)} 
        selectedCategoryName={selectedCategoryName}
        onCategorySelect={handleCategorySelect}
      />
      <CartOverlay open={cartOpen} onClose={() => setCartOpen(false)} onPlaceOrder={handlePlaceOrder} />
      <main className="container" style={{ paddingTop: '100px', marginTop: '0' }}>
        <CategoryList selectedCategoryId={selectedCategoryName} onCategorySelect={handleCategorySelect} />
        <Routes>
          <Route path="/" element={<ProductList categoryName={selectedCategoryName} onAddToCart={handleAddToCart} onProductClick={handleProductClick} />} />
          <Route path="/product/:id" element={<ProductDetailsWrapper />} />
        </Routes>
      </main>
    </>
  );
}

function ProductDetailsWrapper() {
  const { id } = useParams<{ id: string }>();
  return <ProductDetails productId={id || ''} />;
}

export default function AppWithCartProvider() {
  return (
    <CartProvider>
      <Router>
        <App />
      </Router>
    </CartProvider>
  );
}
