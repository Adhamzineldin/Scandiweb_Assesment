import React from 'react';

export default function ProductCard({ product, onAddToCart, onProductClick }) {
  const mainImage = product.gallery && product.gallery[0];
  const price = product.prices && product.prices[0];

  const handleCardClick = () => {
    if (onProductClick) onProductClick(product);
  };

  return (
    <div
      className="card h-100"
      style={{ cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      <img src={mainImage} className="card-img-top" alt={product.name} style={{ objectFit: 'cover', height: 200 }} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text">{product.brand}</p>
        <p className="card-text">{product.inStock ? 'In Stock' : 'Out of Stock'}</p>
        {price && (
          <p className="card-text">{price.currency.symbol}{price.amount}</p>
        )}
        <button
          className="btn btn-primary mt-auto"
          disabled={!product.inStock}
          onClick={e => { e.stopPropagation(); onAddToCart(product); }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
} 