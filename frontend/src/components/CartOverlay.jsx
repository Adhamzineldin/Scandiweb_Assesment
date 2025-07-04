import React, { useState, useEffect } from 'react';
import { useCart } from '../App';

export default function CartOverlay({ open, onClose, onPlaceOrder }) {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.classList.add('cart-open');
    } else {
      document.body.classList.remove('cart-open');
    }
    return () => document.body.classList.remove('cart-open');
  }, [open]);

  if (!open) return null;

  const handlePlaceOrder = async () => {
    setLoading(true);
    await onPlaceOrder({ customerName, customerEmail });
    setLoading(false);
    setCustomerName('');
    setCustomerEmail('');
  };

  const canPlaceOrder = cart.length > 0 && customerName && customerEmail && !loading;

  return (
    <>
      {/* Overlay */}
      <div className="cart-overlay-bg" onClick={onClose}></div>
      {/* Cart Modal */}
      <div className="cart-modal">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>My Bag, {itemCount} {itemCount === 1 ? 'Item' : 'Items'}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <div>
          {cart.length === 0 ? (
            <div className="text-center text-muted">Cart is empty</div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="d-flex align-items-center mb-3 border-bottom pb-2">
                <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', marginRight: 12 }} />
                <div className="flex-grow-1">
                  <div className="fw-bold">{item.name}</div>
                  <div className="small text-muted">{item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                  <div className="d-flex align-items-center mt-2">
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => updateQuantity(item.id, item.selectedOptions, item.quantity + 1)}>+</button>
                    <span>{item.quantity}</span>
                    <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => item.quantity === 1 ? removeFromCart(item.id, item.selectedOptions) : updateQuantity(item.id, item.selectedOptions, item.quantity - 1)}>-</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center mt-4">
          <span className="fw-bold">Total</span>
          <span className="fw-bold">${total.toFixed(2)}</span>
        </div>
        <form className="mt-3" onSubmit={e => { e.preventDefault(); if (canPlaceOrder) handlePlaceOrder(); }}>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Your Name"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            required
          />
          <input
            type="email"
            className="form-control mb-2"
            placeholder="Your Email"
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
            required
          />
          <button
            className="btn btn-primary w-100 mt-2"
            disabled={!canPlaceOrder}
            type="submit"
          >
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'Place Order'}
          </button>
        </form>
      </div>
    </>
  );
} 