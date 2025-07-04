export interface Currency {
  label: string;
  symbol: string;
}

export interface Price {
  amount: number;
  currency: Currency;
}

export interface AttributeItem {
  id: string;
  displayValue: string;
  value: string;
}

export interface Attribute {
  id: string;
  name: string;
  type: string;
  items: AttributeItem[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  inStock: boolean;
  gallery: string[];
  description: string;
  category: string;
  attributes: Attribute[];
  prices: Price[];
  productType: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  currency: string;
  selectedOptions: Record<string, string>;
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: Product, selectedOptions: Record<string, string>) => void;
  removeFromCart: (productId: string, selectedOptions: Record<string, string>) => void;
  updateQuantity: (productId: string, selectedOptions: Record<string, string>, quantity: number) => void;
  updateCartItemAttributes: (productId: string, oldOptions: Record<string, string>, newOptions: Record<string, string>) => void;
  clearCart: () => void;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  selectedAttributes: string;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
}

export interface Order {
  id: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order?: Order;
}

export interface PlaceOrderData {
  customerName: string;
  customerEmail: string;
} 