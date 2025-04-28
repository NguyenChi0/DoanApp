import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  products: Product[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: string) => void;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  products: [],
  addToCart: () => {},
  removeFromCart: () => {},
  setCartItems: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch products when component mounts
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://192.168.43.49:3000/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product: CartItem) => {
    setCartItems((prevItems) => {
      // Check if the product is already in the cart
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        // If yes, increase quantity
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      } else {
        // If not, add new item
        return [...prevItems, product];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        products,
        addToCart,
        removeFromCart,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);