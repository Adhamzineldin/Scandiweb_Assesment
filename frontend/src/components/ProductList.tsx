import React from 'react';
import { useQuery, gql } from '@apollo/client';
import ProductCard from './ProductCard';
import { Product } from '../types';

const PRODUCTS_QUERY = gql`
  query GetProducts($categoryName: String) {
    products(categoryName: $categoryName) {
      id
      name
      gallery
      prices {
        amount
        currency {
          label
          symbol
        }
      }
      inStock
      brand
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

interface ProductListProps {
  categoryName: string;
  onAddToCart?: (product: Product, selectedOptions?: Record<string, string>) => void;
  onProductClick?: (product: Product) => void;
}

interface ProductsQueryData {
  products: Product[];
}

interface ProductsQueryVariables {
  categoryName: string;
}

export default function ProductList({ categoryName, onAddToCart, onProductClick }: ProductListProps) {
  const { data, loading, error } = useQuery<ProductsQueryData, ProductsQueryVariables>(PRODUCTS_QUERY, {
    variables: { categoryName },
    // Add fetchPolicy for better performance
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
    // Add timeout for test reliability
    context: {
      timeout: 10000, // 10 seconds
    },
  });

  // Debug logging for tests
  React.useEffect(() => {
    if (data?.products) {
      console.log(`[ProductList] Loaded ${data.products.length} products for category: ${categoryName}`);
      console.log('[ProductList] Product names:', data.products.map(p => p.name));
    }
    if (error) {
      console.error('[ProductList] GraphQL Error:', error.message);
    }
  }, [data, error, categoryName]);

  if (loading) return (
         <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }} data-testid='products-loading'>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading products...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-danger" role="alert" data-testid="products-error">
      Error loading products: {error.message}
    </div>
  );

  if (!data?.products || data.products.length === 0) {
    return (
      <div className="text-center" style={{ padding: '60px 0', color: '#8D8F9A' }} data-testid="products-empty">
        <h3>No products found</h3>
        <p>There are no products available in this category.</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4" data-testid="products-container">
      <div className="row g-4">
        {data.products.map((product, index) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3" key={product.id}>
            <ProductCard 
              product={product} 
              onAddToCart={onAddToCart || (() => {})} 
              onProductClick={onProductClick}
              index={index} // Pass index for smart loading
            />
          </div>
        ))}
      </div>
    </div>
  );
} 