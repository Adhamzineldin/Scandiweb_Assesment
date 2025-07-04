import React from 'react';
import { useCart } from '../App';
import { useQuery, gql } from '@apollo/client';
import { Category } from '../types';

const CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

interface HeaderProps {
  onCartClick: () => void;
  selectedCategoryName: string;
  onCategorySelect: (categoryName: string) => void;
}

interface CategoriesQueryData {
  categories: Category[];
}

export default function Header({ onCartClick, selectedCategoryName, onCategorySelect }: HeaderProps) {
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const { data: categoriesData } = useQuery<CategoriesQueryData>(CATEGORIES_QUERY);

  // Filter out the backend "all" category and add our own
  const categories = categoriesData?.categories?.filter(cat => cat.name !== 'all') || [];

  return (
    <header 
      className="navbar navbar-light bg-white border-bottom px-4 py-3 position-fixed w-100"
      style={{
        top: '0',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <div className="d-flex w-100 justify-content-between align-items-center">
        {/* Left: Category Navigation */}
        <nav className="d-flex">
          <button
            className={`btn btn-link text-decoration-none me-4 p-0 ${!selectedCategoryName || selectedCategoryName === 'all' ? 'text-dark fw-bold border-bottom border-2 border-success' : 'text-muted'}`}
            onClick={() => onCategorySelect('all')}
            style={{ borderColor: (!selectedCategoryName || selectedCategoryName === 'all') ? '#5ECE7B' : 'transparent' }}
          >
            ALL
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`btn btn-link text-decoration-none me-4 p-0 ${selectedCategoryName === category.name ? 'text-dark fw-bold border-bottom border-2' : 'text-muted'}`}
              onClick={() => onCategorySelect(category.name)}
              style={{ 
                borderColor: selectedCategoryName === category.name ? '#5ECE7B' : 'transparent',
                textTransform: 'uppercase'
              }}
            >
              {category.name}
            </button>
          ))}
        </nav>

        {/* Center: Shop Icon/Logo */}
        <div className="text-center">
          <svg width="31" height="28" viewBox="0 0 31 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30.5 7.5L27.75 1H3.25L0.5 7.5V12.5C0.5 14.5 2 16 4 16C6 16 7.5 14.5 7.5 12.5C7.5 14.5 9 16 11 16C13 16 14.5 14.5 14.5 12.5C14.5 14.5 16 16 18 16C20 16 21.5 14.5 21.5 12.5C21.5 14.5 23 16 25 16C27 16 28.5 14.5 28.5 12.5V7.5H30.5Z" stroke="#1D1F22" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.5 16V22.5C7.5 24.5 9 26 11 26H20C22 26 23.5 24.5 23.5 22.5V16" stroke="#1D1F22" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Right: Cart Icon */}
        <button
          className="btn p-0 position-relative border-0 bg-transparent"
          data-testid="cart-btn"
          onClick={onCartClick}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.5 6.5L18.5 17.5H1.5L0.5 6.5H19.5Z" stroke="#1D1F22" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 9C14 7 12 5 10 5C8 5 6 7 6 9" stroke="#1D1F22" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {itemCount > 0 && (
            <span 
              className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-dark"
              style={{ fontSize: '0.7rem', minWidth: '1.2rem', height: '1.2rem' }}
            >
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
} 