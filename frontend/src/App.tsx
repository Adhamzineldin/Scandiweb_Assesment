import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense, lazy } from 'react'
import './App.css'
import Header from './components/Header'
import CartOverlay from './components/CartOverlay'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'
import CategoryList from './components/CategoryList'
import { useMutation, gql } from '@apollo/client'
import { CartContextType, CartItem, Product, CreateOrderInput, CreateOrderResponse, PlaceOrderData } from './types'

// Lazy load heavy components
const ProductList = lazy(() => import('./components/ProductList'))
const ProductDetails = lazy(() => import('./components/ProductDetails'))

// Preload components for better performance
const preloadComponents = () => {
  const productListImport = import('./components/ProductList')
  const productDetailsImport = import('./components/ProductDetails')
  return Promise.all([productListImport, productDetailsImport])
}

// Loading component
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }} data-testid='loading-spinner'>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
)

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

  const addToCart = (product: Product, selectedOptions: Record<string, string> | undefined, openCart: boolean = false) => {
    // Always build selectedOptions from the product's own attributes (first option for each)
    const safeSelectedOptions: Record<string, string> = {};
    if (product.attributes) {
      product.attributes.forEach(attr => {
        if (selectedOptions && selectedOptions[attr.id]) {
          safeSelectedOptions[attr.id] = selectedOptions[attr.id];
        } else if (attr.items && attr.items.length > 0) {
          safeSelectedOptions[attr.id] = attr.items[0].value;
        }
      });
    }
    setCart(prev => {
      const idx = prev.findIndex(
        item => item.id === product.id && optionsEqual(item.selectedOptions, safeSelectedOptions)
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
            selectedOptions: { ...safeSelectedOptions },
            attributes: product.attributes ? JSON.parse(JSON.stringify(product.attributes)) : [],
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

// Global cart opener function
let globalOpenCart: (() => void) | null = null;

export const openCartGlobally = () => {
  if (globalOpenCart) {
    globalOpenCart();
  } else {
    console.warn('Global cart opener not initialized');
  }
};

function App() {
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('all');
  const { addToCart, cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [createOrder] = useMutation<{ createOrder: CreateOrderResponse }, { input: CreateOrderInput }>(CREATE_ORDER_MUTATION);
  
  // Set up global cart opener
  useEffect(() => {
    globalOpenCart = () => {
      console.log('Global: Opening cart via globalOpenCart');
      setCartOpen(true);
    };
    return () => {
      globalOpenCart = null;
    };
  }, []);
  
  // Debug logging for cart state and category
  console.log('App render - cartOpen:', cartOpen, 'selectedCategory:', selectedCategoryName);
  
  // Handle URL-based category selection
  useEffect(() => {
    const path = location.pathname;
    console.log('App URL path changed:', path);
    let newCategory = 'all';
    if (path === '/all') {
      newCategory = 'all';
    } else if (path === '/clothes') {
      newCategory = 'clothes';
    } else if (path === '/tech') {
      newCategory = 'tech';
    } else if (path === '/') {
      // Default to 'all' for home page
      newCategory = 'all';
    }
    console.log('Setting category to:', newCategory);
    setSelectedCategoryName(newCategory);
  }, [location.pathname]);

  // Preload components on mount
  useEffect(() => {
    preloadComponents().catch(console.error);
  }, []);



  const handleAddToCart = (product: Product, selectedOptions?: Record<string, string>) => {
    addToCart(product, selectedOptions || {});
    setCartOpen(true); // Open cart overlay when item is added
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategoryName(categoryName);
    navigate(`/${categoryName}`);
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
        console.log('Order placed successfully');
      } else {
        console.error('Order failed:', data?.createOrder.message || 'Unknown error');
      }
    } catch (e) {
      console.error('Order failed:', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div data-testid='app-ready'>
      <div data-testid='app-loaded' style={{ display: 'none' }}>App Loaded</div>
      <Header 
        onCartClick={() => setCartOpen(prev => !prev)} 
        selectedCategoryName={selectedCategoryName}
        onCategorySelect={handleCategorySelect}
      />
      <CartOverlay open={cartOpen} onClose={() => setCartOpen(false)} onPlaceOrder={handlePlaceOrder} />
      <main className="container" style={{ paddingTop: '100px', marginTop: '0' }}>
        <CategoryList selectedCategoryId={selectedCategoryName} onCategorySelect={handleCategorySelect} />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<ProductList categoryName={selectedCategoryName} onAddToCart={handleAddToCart} onProductClick={handleProductClick} />} />
            <Route path="/all" element={<ProductList categoryName={selectedCategoryName} onAddToCart={handleAddToCart} onProductClick={handleProductClick} />} />
            <Route path="/clothes" element={<ProductList categoryName={selectedCategoryName} onAddToCart={handleAddToCart} onProductClick={handleProductClick} />} />
            <Route path="/tech" element={<ProductList categoryName={selectedCategoryName} onAddToCart={handleAddToCart} onProductClick={handleProductClick} />} />
            <Route path="/product/:id" element={<ProductDetailsWrapper />} />
            {/* Catch-all route for unmatched URLs */}
            <Route path="*" element={<ProductList categoryName={selectedCategoryName} onAddToCart={handleAddToCart} onProductClick={handleProductClick} />} />
          </Routes>
        </Suspense>
      </main>
    </div>
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
