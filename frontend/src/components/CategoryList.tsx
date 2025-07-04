import React from 'react';

interface CategoryListProps {
  selectedCategoryId: string;
  onCategorySelect: (categoryName: string) => void;
}

// CategoryList is now integrated into Header component
// This component is kept for backward compatibility but renders nothing
export default function CategoryList(_props: CategoryListProps) {
  return null;
} 