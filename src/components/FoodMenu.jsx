import { Link } from "@tanstack/react-router";
import { BiMinus } from "react-icons/bi";
import { BsCart2, BsPlus } from "react-icons/bs";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useCart } from "../context/CartContext";

function formatUGX(amount) {
  return `UGX ${Math.round(amount).toLocaleString()}`;
}

const QuantityStepper = ({ quantity, onChange, size = "md" }) => {
  const dims =
    size === "sm"
      ? { btn: "p-1", icon: "w-3.5 h-3.5", text: "text-sm min-w-[20px]" }
      : { btn: "p-1.5", icon: "w-4 h-4", text: "text-sm min-w-[24px]" };

  return (
    <div className="flex items-center gap-2 bg-cafe-500 rounded-full shadow-md px-1 py-1">
      <button
        type="button"
        onClick={() => onChange(-1)}
        aria-label="Decrease quantity"
        className={`bg-white text-cafe-600 hover:bg-cafe-50 rounded-full ${dims.btn} transition-colors duration-150`}
      >
        <BiMinus className={dims.icon} />
      </button>
      <span className={`text-white font-semibold ${dims.text} text-center tabular-nums`}>
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(1)}
        aria-label="Increase quantity"
        className={`bg-white text-cafe-600 hover:bg-cafe-50 rounded-full ${dims.btn} transition-colors duration-150`}
      >
        <BsPlus className={dims.icon} />
      </button>
    </div>
  );
};

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

  const handleAddToCart = () => onAddToCart(id, 1);
  const formattedPrice = formatUGX(price);
  const inCart = quantity > 0;

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-cafe-100 shadow-sm transition-all duration-300 overflow-hidden w-full ${
        available
          ? "hover:shadow-xl hover:border-cafe-200 hover:-translate-y-0.5"
          : "opacity-75"
      } ${inCart ? "ring-2 ring-cafe-400 ring-offset-2" : ""}`}
    >
      <div className="relative aspect-[4/3] w-full bg-cafe-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <span
          className="absolute inset-0 items-center justify-center text-5xl"
          style={{ display: imageUrl ? "none" : "flex" }}
        >
          🍽️
        </span>

        {!available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-white font-semibold text-xs tracking-wide px-3 py-1.5 bg-black/60 rounded-full">
              Sold out
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-cafe-700 font-bold text-sm px-3 py-1 rounded-full shadow">
          {formattedPrice}
        </div>
      </div>

      <div className="p-4 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-gray-800 leading-snug line-clamp-1">
            {name}
          </h3>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {description}
        </p>

        <div className="pt-2 flex items-center justify-end min-h-[40px]">
          {available &&
            (quantity === 0 ? (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 bg-cafe-500 hover:bg-cafe-600 active:bg-cafe-700 text-white font-semibold text-sm pl-3 pr-4 py-2 rounded-full shadow-sm transition-colors duration-200"
              >
                <BsPlus className="w-4 h-4" />
                Add
              </button>
            ) : (
              <QuantityStepper quantity={quantity} onChange={handleQuantityChange} />
            ))}
        </div>
      </div>
    </div>
  );
};

const FoodCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-cafe-100 shadow-sm overflow-hidden animate-pulse">
    <div className="aspect-[4/3] w-full bg-cafe-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-2/3 bg-cafe-100 rounded" />
      <div className="h-3 w-full bg-cafe-100 rounded" />
      <div className="h-3 w-4/5 bg-cafe-100 rounded" />
      <div className="flex justify-end pt-1">
        <div className="h-9 w-20 bg-cafe-100 rounded-full" />
      </div>
    </div>
  </div>
);

const MenuSkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 max-w-7xl mx-auto">
    {Array.from({ length: count }).map((_, i) => (
      <FoodCardSkeleton key={i} />
    ))}
  </div>
);

const EmptyMenuState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-6">
    <span className="text-5xl mb-3">🍽️</span>
    <h3 className="text-lg font-semibold text-gray-700">Nothing on the menu yet</h3>
    <p className="text-sm text-gray-500 mt-1 max-w-sm">
      Items will show up here as soon as they're added.
    </p>
  </div>
);

const MenuErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-6">
    <HiOutlineExclamationCircle className="w-10 h-10 text-red-500 mb-3" />
    <h3 className="text-lg font-semibold text-gray-700">Couldn't load the menu</h3>
    <p className="text-sm text-gray-500 mt-1 max-w-sm">{message}</p>
  </div>
);

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
  const { cartItems, menuItemsById, menuLoading, menuError, addToCart } =
    useCart();

  const menuItems = Object.values(menuItemsById);
  const cartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-slate-100">
      <div className="sticky top-0 z-20 bg-cafe-50/80 backdrop-blur-md border-b border-cafe-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Our Menu</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Fresh picks, made to order
            </p>
          </div>

          <Link
            to="/cart"
            className="relative flex items-center gap-2 bg-cafe-500 hover:bg-cafe-600 text-white px-4 py-2.5 rounded-full shadow-md transition-colors duration-200"
          >
            <BsCart2 className="w-5 h-5" />
            <span className="font-semibold text-sm">{cartCount}</span>
          </Link>
        </div>
      </div>

      <div className="py-2">
        {menuLoading ? (
          <MenuSkeletonGrid />
        ) : menuError ? (
          <MenuErrorState message={menuError.message} />
        ) : menuItems.length === 0 ? (
          <EmptyMenuState />
        ) : (
          <FoodCardGrid
            foods={menuItems}
            cartItems={cartItems}
            onAddToCart={addToCart}
          />
        )}
      </div>
    </div>
  );
};

export default FoodMenu;