import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

const API_BASE = "http://localhost:8080/api";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState({}); // { menuItemId: quantity }
  const [menuItemsById, setMenuItemsById] = useState({});

  // Load the menu once, at app level, so both FoodMenu and Cart can use it
  useEffect(() => {
    fetch(`${API_BASE}/menu/items`)
      .then((res) => res.json())
      .then((items) => {
        const byId = {};
        items.forEach((item) => {
          byId[item.id] = item;
        });
        setMenuItemsById(byId);
      })
      .catch((err) => console.error("Failed to load menu items", err));
  }, []); // runs once on app mount

  const addToCart = (itemId, quantity) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: quantity };
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    setCartItems((prev) => {
      if (newQuantity <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const removeItem = (itemId) => {
    setCartItems((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const clearCart = () => setCartItems({});

  const value = {
    cartItems,
    menuItemsById,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
