import { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const CartContext = createContext(null);

const API_BASE = "http://localhost:8080/api";
const SETTINGS_KEY = "cafe_popp_settings";

const DEFAULT_SETTINGS = {
  name: "Tabitha Mugide",
  role: "Administrator",
  email: "",
  orderUpdates: true,
  soundAlerts: true,
  compactMode: false,
};

async function fetchMenuItems() {
  const response = await fetch(`${API_BASE}/menu/items`);
  if (!response.ok) throw new Error("Couldn't load menu items.");
  return response.json();
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState({}); // { menuItemId: quantity }
  const [settings, setSettings] = useState(() => {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const { data: menuItems = [], isLoading: menuLoading, error: menuError } =
    useQuery({
      queryKey: ["menuItems"],
      queryFn: fetchMenuItems,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });

  const menuItemsById = Object.fromEntries(
    menuItems.map((item) => [item.id, item]),
  );

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

  const updateSettings = (changes) => {
    setSettings((current) => {
      const next = { ...current, ...changes };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem("cafe_popp_token");
    localStorage.removeItem(SETTINGS_KEY);
    setCartItems({});
    setSettings(DEFAULT_SETTINGS);
  };

  const value = {
    cartItems,
    menuItemsById,
    menuLoading,
    menuError,
    settings,
    updateSettings,
    logout,
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
