import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8080/api";

export const Route = createFileRoute("/payments")({
  component: RouteComponent,
});

const METHODS = ["CASH", "MOBILE_MONEY", "CARD"];
const METHOD_LABELS = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile Money",
  CARD: "Card",
};
const METHOD_ICON = { CASH: "💵", MOBILE_MONEY: "📱", CARD: "💳" };

function formatUGX(amount) {
  return `UGX ${Math.round(amount).toLocaleString()}`;
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Request failed");
  }
  return res.json();
}

function RouteComponent() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [payingOrder, setPayingOrder] = useState(null); // order object mid-payment
  const [selectedMethod, setSelectedMethod] = useState("CASH");
  const [isPaying, setIsPaying] = useState(false);

  const [receipt, setReceipt] = useState(null); // { payment, order } for the receipt modal

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, paymentsData] = await Promise.all([
        fetchJson(`${API_BASE}/orders/all`),
        fetchJson(`${API_BASE}/payments`),
      ]);
      setOrders(ordersData);
      setPayments(paymentsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]); // fetch once on mount

  const servedOrders = useMemo(
    () => orders.filter((o) => o.status === "SERVED"),
    [orders],
  );

  const totalCollected = useMemo(
    () => payments.reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );

  const methodBreakdown = useMemo(() => {
    const totals = { CASH: 0, MOBILE_MONEY: 0, CARD: 0 };
    payments.forEach(
      (p) => (totals[p.method] = (totals[p.method] ?? 0) + p.amount),
    );
    const grand = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    return METHODS.map((m) => ({
      method: m,
      amount: totals[m] ?? 0,
      pct: Math.round(((totals[m] ?? 0) / grand) * 100),
    }));
  }, [payments]);

  const openPayModal = (order) => {
    setPayingOrder(order);
    setSelectedMethod("CASH");
  };

  const collectPayment = async () => {
    if (!payingOrder) return;
    setIsPaying(true);
    setError(null);
    try {
      const payment = await fetchJson(
        `${API_BASE}/payments?orderId=${payingOrder.id}&method=${selectedMethod}`,
        { method: "POST" },
      );
      setPayingOrder(null);
      await loadAll();
      // show the receipt right after paying
      setReceipt({ payment, order: payingOrder });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPaying(false);
    }
  };

  const viewReceipt = async (payment) => {
    try {
      const order = await fetchJson(`${API_BASE}/orders/${payment.orderId}`);
      setReceipt({ payment, order });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-slate-500">Loading payments...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Payments</h1>
        <p className="mt-1 text-slate-500">
          Collect payment for served orders and review transaction history.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Ready to Pay */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Ready for Payment
          </h2>
          <p className="text-sm text-slate-500">
            Orders that have been served and are awaiting payment
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {servedOrders.length === 0 && (
            <p className="p-6 text-center text-slate-400">
              No orders waiting on payment right now.
            </p>
          )}
          {servedOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="font-medium text-slate-800">
                  Order #{order.id} · Table {order.tableNumber}
                </p>
                <p className="text-sm text-slate-500">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}{" "}
                  · served by {order.staffName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800">
                  {formatUGX(order.total)}
                </span>
                <button
                  onClick={() => openPayModal(order)}
                  className="btn btn-sm bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600"
                >
                  Collect Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Revenue Collected</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {formatUGX(totalCollected)}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            All-time, from all payments
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Payments Recorded</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {payments.length}
          </h2>
          <p className="mt-1 text-xs text-slate-400">Total transactions</p>
        </div>
      </div>

      {/* Method Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          Payment Methods
        </h2>
        <p className="text-sm text-slate-500">Share of revenue by method</p>
        <div className="mt-5 space-y-4">
          {methodBreakdown.map((m) => (
            <div key={m.method}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-700">
                  <span>{METHOD_ICON[m.method]}</span> {METHOD_LABELS[m.method]}
                </span>
                <span className="text-slate-500">
                  {formatUGX(m.amount)} · {m.pct}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-cafe-500"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Payment History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th>Payment ID</th>
                <th>Order</th>
                <th>Method</th>
                <th>Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-cafe-50/50">
                  <td className="font-medium text-slate-800">
                    PMT-{payment.id}
                  </td>
                  <td className="text-slate-600">#{payment.orderId}</td>
                  <td className="text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      {METHOD_ICON[payment.method]}{" "}
                      {METHOD_LABELS[payment.method]}
                    </span>
                  </td>
                  <td className="text-slate-800">
                    {formatUGX(payment.amount)}
                  </td>
                  <td>
                    <div className="flex justify-end">
                      <button
                        onClick={() => viewReceipt(payment)}
                        className="btn btn-ghost btn-xs text-cafe-600 hover:text-cafe-700"
                      >
                        Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Collect Payment · Order #{payingOrder.id}
              </h2>
              <button
                onClick={() => setPayingOrder(null)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-2xl font-bold text-cafe-600">
              {formatUGX(payingOrder.total)}
            </p>

            <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-400">
              Payment method
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    selectedMethod === m
                      ? "border-cafe-500 bg-cafe-50 text-cafe-700"
                      : "border-slate-200 text-slate-600 hover:border-cafe-300 hover:bg-cafe-50"
                  }`}
                >
                  {METHOD_ICON[m]} {METHOD_LABELS[m]}
                </button>
              ))}
            </div>

            <button
              onClick={collectPayment}
              disabled={isPaying}
              className="mt-6 w-full btn bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600 disabled:opacity-60"
            >
              {isPaying
                ? "Processing..."
                : `Confirm Payment · ${formatUGX(payingOrder.total)}`}
            </button>
          </div>
        </div>
      )}

      {/* Itemized Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Receipt</h2>
              <button
                onClick={() => setReceipt(null)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 text-center border-b border-dashed border-slate-300 pb-4">
              <p className="font-bold text-slate-800">Cafe Popp</p>
              <p className="text-xs text-slate-500">
                Order #{receipt.order.id} · Table {receipt.order.tableNumber}
              </p>
              <p className="text-xs text-slate-500">
                Served by {receipt.order.staffName}
              </p>
            </div>

            <div className="py-4 space-y-2">
              {receipt.order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">
                    {item.quantity} × {item.menuItemName}
                  </span>
                  <span className="text-slate-800">
                    {formatUGX(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Total</span>
                <span>{formatUGX(receipt.payment.amount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Payment method</span>
                <span>
                  {METHOD_ICON[receipt.payment.method]}{" "}
                  {METHOD_LABELS[receipt.payment.method]}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Payment ID</span>
                <span>PMT-{receipt.payment.id}</span>
              </div>
            </div>

            <button
              onClick={() => setReceipt(null)}
              className="mt-6 w-full btn bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
