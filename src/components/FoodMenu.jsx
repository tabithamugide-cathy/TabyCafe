import { Link } from "@tanstack/react-router";
import React from "react";
import { BiMinus } from "react-icons/bi";
import { BsCart2, BsPlus } from "react-icons/bs";
import { useCart } from "../context/CartContext";

function formatUGX(amount) {
  return `UGX ${Math.round(amount).toLocaleString()}`;
}

const FoodCard = ({
  id,
  name,
  description,
  price,
  available,
  imageUrl,
  quantity,
  onAddToCart,
}) => {
  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(0, quantity + change);
    onAddToCart(id, newQuantity);
  };

  const handleAddToCart = () => {
    onAddToCart(id, 1);
  };

  const formattedPrice = formatUGX(price);

  return (
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden max-w-sm w-full">
      <div className="relative pt-4 px-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-full border-4 border-cafe-100 group-hover:border-cafe-300 transition-all duration-300 bg-cafe-50 flex items-center justify-center">
          {!available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full z-10">
              <span className="text-white font-bold text-sm px-3 py-1 bg-red-500 rounded-full">
                Sold Out
              </span>
            </div>
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Broken/unreachable image URL — fall back to the emoji placeholder
                e.currentTarget.style.display = "none";
                e.currentTarget.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <span
            className="text-4xl"
            style={{ display: imageUrl ? "none" : "flex" }}
          >
            🍽️
          </span>
        </div>

        <div className="absolute top-6 right-6 bg-cafe-500 text-white font-bold text-sm px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
          {formattedPrice}
        </div>

        {available && (
          <div className="absolute bottom-4 right-6">
            {quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="bg-cafe-500 hover:bg-cafe-600 text-white p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              >
                <BsPlus className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-cafe-500 rounded-full shadow-lg p-1.5">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="bg-white text-cafe-600 hover:bg-cafe-50 rounded-full p-1 transition-all duration-200 hover:scale-110"
                >
                  <BiMinus className="w-4 h-4" />
                </button>
                <span className="text-white font-bold text-sm min-w-[24px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="bg-white text-cafe-600 hover:bg-cafe-50 rounded-full p-1 transition-all duration-200 hover:scale-110"
                >
                  <BsPlus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 pt-2 space-y-2">
        <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-cafe-600 transition-colors duration-300">
          {name}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
          {description}
        </p>

        {available && quantity > 0 && (
          <div className="flex items-center justify-between mt-2 p-2 bg-cafe-50 rounded-xl border border-cafe-200">
            <span className="text-sm text-gray-600">
              {quantity} × {formattedPrice}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="text-cafe-600 hover:text-cafe-700 hover:bg-cafe-100 p-1 rounded-full transition-all"
              >
                <BiMinus className="w-4 h-4" />
              </button>
              <span className="font-bold text-cafe-600">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="text-cafe-600 hover:text-cafe-700 hover:bg-cafe-100 p-1 rounded-full transition-all"
              >
                <BsPlus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FoodCardGrid = ({ foods, cartItems, onAddToCart }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 max-w-7xl mx-auto">
    {foods.map((food) => (
      <FoodCard
        key={food.id}
        {...food}
        quantity={cartItems[food.id] || 0}
        onAddToCart={onAddToCart}
      />
    ))}
  </div>
);

const FoodMenu = () => {
  const { cartItems, menuItemsById, addToCart } = useCart();

  const menuItems = Object.values(menuItemsById);
  const loading = menuItems.length === 0;

  const cartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🍕 Our Menu</h1>
          <Link
            to="/cart"
            className="bg-cafe-500 hover:bg-cafe-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transition-colors"
          >
            <BsCart2 className="w-5 h-5" />
            <span className="font-bold">{cartCount}</span>
          </Link>
        </div>

        <FoodCardGrid
          foods={menuItems}
          cartItems={cartItems}
          onAddToCart={addToCart}
        />
      </div>
    </div>
  );
};

export default FoodMenu;
