import { createFileRoute } from "@tanstack/react-router";
import Cart from "../components/Cart";
import { useCart } from "../context/CartContext";

export const Route = createFileRoute("/cart")({
  component: RouteComponent,
});

function RouteComponent() {
  const { cartItems, menuItemsById, updateQuantity, removeItem, clearCart } =
    useCart();

  return (
    <Cart
      cartItems={cartItems}
      menuItemsById={menuItemsById}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeItem}
      onClearCart={clearCart}
    />
  );
}
