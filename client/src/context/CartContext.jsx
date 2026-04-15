import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useState } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'ym-cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, qty = 1 } = action.payload;
      const existing = state.find((i) => i.id === product.id);
      if (existing) {
        return state.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...state, { ...product, qty }];
    }
    case 'REMOVE_ITEM':
      return state.filter((i) => i.id !== action.payload);
    case 'UPDATE_QTY':
      if (action.payload.qty < 1) {
        return state.filter((i) => i.id !== action.payload.id);
      }
      return state.map((i) =>
        i.id === action.payload.id ? { ...i, qty: action.payload.qty } : i
      );
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, null, loadCart);

  // Toast state for add-to-cart notifications
  const [toast, setToast] = useState(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /**
   * Add a product to cart. Supports optional qty parameter.
   * @param {Object} product – product object
   * @param {number} [qty=1] – quantity to add
   */
  const addItem = useCallback(
    (product, qty = 1) => {
      dispatch({ type: 'ADD_ITEM', payload: { product, qty } });
      // Show toast notification
      setToast({ name: product.name, nameEn: product.nameEn });
    },
    []
  );

  const removeItem = useCallback(
    (id) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
    []
  );

  const updateQty = useCallback(
    (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } }),
    []
  );

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const dismissToast = useCallback(() => setToast(null), []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        subtotal,
        toast,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
