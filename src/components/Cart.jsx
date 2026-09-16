import React, { useState, useEffect } from "react";
import {
  BsCart2,
  BsTrash,
  BsPlus,
  BsArrowLeft,
  BsBagCheck,
  BsCreditCard,
  BsCash,
  BsWallet,
  BsCheckCircle,
  BsClock,
} from "react-icons/bs";
import { BiMinus, BiFoodMenu } from "react-icons/bi";
import { FiChevronRight, FiUsers } from "react-icons/fi";
import { MdOutlineReceiptLong } from "react-icons/md";

const API_BASE = "http://localhost:8080/api";
const ACTIVE_ORDER_KEY = "cafe_popp_active_order";

function formatUGX(amount) {
  return `UGX ${Math.round(amount).toLocaleString()}`;
}

const Cart = ({
  menuItemsById,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [checkoutStep, setCheckoutStep] = useState(() =>
    localStorage.getItem(ACTIVE_ORDER_KEY) ? "confirmation" : "cart",
  ); // cart, table, payment, confirmation
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ACTIVE_ORDER_KEY)) || null;
    } catch {
      return null;
    }
  });
  const [paymentComplete, setPaymentComplete] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ACTIVE_ORDER_KEY))?.status === "PAID";
    } catch {
      return false;
    }
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const items = Object.entries(cartItems).map(([id, quantity]) => {
    const menuItem = menuItemsById[id];
    return {
      id: Number(id),
      name: menuItem?.name ?? "Unknown item",
      price: menuItem?.price ?? 0,
      quantity,
    };
  });

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  useEffect(() => {
    if (checkoutStep !== "table") return;
    fetch(`${API_BASE}/tables`)
      .then((res) => res.json())
      .then((data) => setTables(data.filter((t) => t.status === "FREE")))
      .catch(() => setError("Couldn't load tables"));
  }, [checkoutStep]); // only re-fetches when the step becomes "table"

  const handleQuantityChange = (itemId, change) => {
    const item = items.find((i) => i.id === itemId);
    const newQty = Math.max(1, item.quantity + change);
    onUpdateQuantity?.(itemId, newQty);
  };

  const handlePlaceOrder = async () => {
    if (!selectedTableId) {
      setError("Please select a table");
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create the order against the chosen table
      const orderRes = await fetch(
        `${API_BASE}/orders?tableId=${selectedTableId}`,
        { method: "POST" },
      );
      if (!orderRes.ok) {
        const body = await orderRes.json().catch(() => null);
        throw new Error(body?.message || "Could not create order");
      }
      const order = await orderRes.json();

      // 2. Add each cart item to the order, one request per line item
      for (const item of items) {
        const itemRes = await fetch(
          `${API_BASE}/orders/${order.id}/items?menuItemId=${item.id}&quantity=${item.quantity}`,
          { method: "POST" },
        );
        if (!itemRes.ok) throw new Error(`Could not add ${item.name} to order`);
      }

      // 3. Confirm — this is where the backend checks/deducts stock
      const confirmRes = await fetch(`${API_BASE}/orders/${order.id}/confirm`, {
        method: "POST",
      });
      if (!confirmRes.ok) {
        const body = await confirmRes.json().catch(() => null);
        throw new Error(
          body?.message || "Could not confirm order — check stock levels",
        );
      }
      const confirmedOrderData = await confirmRes.json();

      setConfirmedOrder(confirmedOrderData);
      localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(confirmedOrderData));
      setCheckoutStep("confirmation");
      onClearCart?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const checkOrderStatus = async () => {
    if (!confirmedOrder) return;
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`${API_BASE}/orders/${confirmedOrder.id}`);
      if (!response.ok) throw new Error("Could not refresh order status");
      const refreshedOrder = await response.json();
      setConfirmedOrder(refreshedOrder);
      localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(refreshedOrder));
      setStatusMessage(
        refreshedOrder.status === "SERVED"
          ? "Your order is ready. Payment is now available."
          : refreshedOrder.status === "PAID"
            ? "Payment has already been received."
            : "Your order is still being prepared.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (checkoutStep !== "confirmation" || !confirmedOrder) return;
    if (["SERVED", "PAID"].includes(confirmedOrder.status)) return;
    const interval = window.setInterval(checkOrderStatus, 10000);
    return () => window.clearInterval(interval);
  }, [checkoutStep, confirmedOrder]);

  const payForOrder = async () => {
    if (!confirmedOrder || confirmedOrder.status !== "SERVED") return;
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/payments?orderId=${confirmedOrder.id}&method=${paymentMethod}`,
        { method: "POST" },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || "Could not complete payment");
      setPaymentComplete(true);
      const paidOrder = { ...confirmedOrder, status: "PAID" };
      setConfirmedOrder(paidOrder);
      localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(paidOrder));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Empty Cart State
  if (items.length === 0 && checkoutStep === "cart") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <BsCart2 className="w-12 h-12 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Add some items from the menu to get started.
          </p>
        </div>
      </div>
    );
  }

  // Confirmation Step
  if (checkoutStep === "confirmation" && confirmedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <BsCheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Order Confirmed!
          </h2>
          <p className="text-gray-500 mb-6">
            Your order has been sent to the kitchen (Table{" "}
            {confirmedOrder.tableNumber}).
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <MdOutlineReceiptLong className="w-5 h-5 text-gray-400" />
              Order #: <span className="font-bold">{confirmedOrder.id}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <BsWallet className="w-5 h-5 text-gray-400" />
              Total:{" "}
              <span className="font-bold">
                {formatUGX(confirmedOrder.total)}
              </span>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-cafe-100 bg-cafe-50 p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Payment</span>
              <span className="badge badge-warning">{confirmedOrder.status}</span>
            </div>
            {paymentComplete ? (
              <p className="mt-3 text-sm font-medium text-green-700">Payment received. Thank you.</p>
            ) : confirmedOrder.status !== "SERVED" ? (
              <>
                <p className="mt-2 text-sm text-gray-500">Payment becomes available here when the kitchen marks your order ready.</p>
                {statusMessage && <p className="mt-2 text-xs font-medium text-cafe-700">{statusMessage}</p>}
                <button onClick={checkOrderStatus} disabled={isCheckingStatus} className="btn btn-sm mt-3 border-cafe-200 bg-white text-cafe-700 hover:bg-cafe-100">
                  {isCheckingStatus ? "Checking..." : "Check status"}
                </button>
              </>
            ) : (
              <>
                <label className="mt-3 block text-sm font-medium text-gray-600">
                  Payment method
                  <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="select select-sm mt-1 w-full bg-white">
                    <option value="CASH">Cash</option>
                    <option value="MOBILE_MONEY">Mobile money</option>
                    <option value="CARD">Card</option>
                  </select>
                </label>
                <button onClick={payForOrder} disabled={isProcessing} className="btn mt-3 w-full border-cafe-500 bg-cafe-500 text-white hover:bg-cafe-600">
                  {isProcessing ? "Processing..." : `Pay ${formatUGX(confirmedOrder.total)}`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          {checkoutStep !== "cart" && (
            <button
              onClick={() => setCheckoutStep("cart")}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <BsArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {checkoutStep === "cart" && "Your Cart"}
              {checkoutStep === "table" && "Choose a Table"}
            </h1>
            <p className="text-gray-500 mt-1">
              {checkoutStep === "cart" && `${items.length} items in your cart`}
              {checkoutStep === "table" && "Select a free table for this order"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {checkoutStep === "cart" && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800">
                    Cart Items
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-cafe-600 font-bold mt-1">
                          {formatUGX(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-orange-50 rounded-full p-1">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-orange-500 hover:bg-orange-100"
                        >
                          <BiMinus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-gray-800 min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-orange-500 hover:bg-orange-100"
                        >
                          <BsPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right min-w-[100px] font-bold text-gray-800">
                        {formatUGX(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => onRemoveItem?.(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <BsTrash className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {checkoutStep === "table" && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Available Tables
                </h2>
                {tables.length === 0 ? (
                  <p className="text-gray-500">No free tables right now.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {tables.map((table) => (
                      <button
                        key={table.id}
                        onClick={() => setSelectedTableId(table.id)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          selectedTableId === table.id
                            ? "border-cafe-500 bg-cafe-50"
                            : "border-gray-200 hover:border-cafe-200"
                        }`}
                      >
                        <FiUsers className="w-6 h-6 text-cafe-500" />
                        <span className="font-bold">
                          Table {table.tableNumber}
                        </span>
                        <span className="text-xs text-gray-400">
                          Seats {table.capacity}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedTableId || isProcessing}
                  className="mt-6 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Placing order...
                    </>
                  ) : (
                    <>
                      <BsBagCheck className="w-5 h-5" />
                      Confirm Order - {formatUGX(total)}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-600">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-medium text-gray-800">
                      {formatUGX(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-cafe-600">
                  {formatUGX(total)}
                </span>
              </div>

              {checkoutStep === "cart" && (
                <button
                  onClick={() => setCheckoutStep("table")}
                  className="mt-6 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Table Selection
                  <FiChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
