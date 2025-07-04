import React, { createContext, useContext, useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/Header.jsx'
import CartOverlay from './components/CartOverlay.jsx'
import ProductList from './components/ProductList.jsx'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import ProductDetails from './components/ProductDetails.jsx'
import CategoryList from './components/CategoryList.jsx'
import { useMutation, gql } from '@apollo/client'

// Cart Context
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Helper to compare options
  const optionsEqual = (a, b) => {
    return JSON.stringify(a || {}) === JSON.stringify(b || {});
  };

  const addToCart = (product, selectedOptions) => {
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

  const removeFromCart = (productId, selectedOptions) => {
    setCart(prev => prev.filter(item => !(item.id === productId && optionsEqual(item.selectedOptions, selectedOptions))));
  };

  const updateQuantity = (productId, selectedOptions, quantity) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId && optionsEqual(item.selectedOptions, selectedOptions)) {
        return { ...item, quantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, updateQuantity, clearCart }}>
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
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState('all');
  const { addToCart, cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [createOrder] = useMutation(CREATE_ORDER_MUTATION);

  const handleAddToCart = (product) => {
    addToCart(product, {});
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategoryName(categoryName);
    navigate('/');
  };

  const handlePlaceOrder = async ({ customerName, customerEmail }) => {
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
      if (data.createOrder.success) {
        clearCart();
        alert('Order placed successfully!');
      } else {
        alert('Order failed: ' + data.createOrder.message);
      }
    } catch (e) {
      alert('Order failed: ' + e.message);
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
      <main className="container mt-4">
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
  const { id } = useParams();
  return <ProductDetails productId={id} />;
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
