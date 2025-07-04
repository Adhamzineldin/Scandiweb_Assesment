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
  onAddToCart?: (product: Product) => void;
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
  });

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products.</div>;

  return (
    <div className="row">
      {/* {data.products.map(product => (
        <div className="col-md-4 mb-4" key={product.id}>
          <ProductCard product={product} />
        </div>
      ))} */}
      {/* ProductCard will be implemented next */}
      {data?.products.map(product => (
        <div className="col-md-4 mb-4" key={product.id}>
          <ProductCard product={product} onAddToCart={onAddToCart || (() => console.log('Add to cart', product))} onProductClick={onProductClick} />
        </div>
      ))}
    </div>
  );
} 