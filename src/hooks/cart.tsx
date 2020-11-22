import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      setProducts([...JSON.parse(storedProducts || '[]')]);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(prod => prod.id === product.id);

      if (productExists) {
        const newProductsArray = products.map(item =>
          item.id === product.id
            ? { ...product, quantity: item.quantity + 1 }
            : item,
        );

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProductsArray),
        );

        setProducts(newProductsArray);
      } else {
        const newProductsArray = [...products, { ...product, quantity: 1 }];

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProductsArray),
        );

        setProducts(newProductsArray);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProductsArray = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProductsArray),
      );

      setProducts(newProductsArray);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProductsArray = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity - 1 }
          : product,
      );

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProductsArray),
      );

      setProducts(newProductsArray);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
