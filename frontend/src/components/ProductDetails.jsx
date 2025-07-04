import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useCart } from '../App';

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

export default function ProductDetails({ productId }) {
  const { data, loading, error } = useQuery(PRODUCT_QUERY, { variables: { id: productId } });
  const { addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState({});

  if (loading) return <div>Loading product...</div>;
  if (error) return <div>Error loading product.</div>;
  if (!data || !data.product) return <div>Product not found.</div>;

  const product = data.product;
  const price = product.prices && product.prices[0];

  const handleSelect = (attrId, value) => {
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
          <div key={attr.id} className="mb-2">
            <div className="fw-bold">{attr.name}</div>
            <div>
              {attr.items.map(item => (
                <button
                  key={item.id}
                  className={`btn btn-sm me-2 mb-1 ${selectedOptions[attr.id] === item.value ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => handleSelect(attr.id, item.value)}
                  type="button"
                  style={{
                    backgroundColor: selectedOptions[attr.id] === item.value ? '#1D1F22' : 'transparent',
                    borderColor: selectedOptions[attr.id] === item.value ? '#1D1F22' : '#6c757d',
                    color: selectedOptions[attr.id] === item.value ? 'white' : '#6c757d'
                  }}
                >
                  {item.displayValue}
                </button>
              ))}
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