import { useEffect, useState } from "react";
import axiosAuth from "../../api/axiosAuth";

export default function AdminOrdersPage() {
  const [ordersPage, setOrdersPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosAuth
      .get("/admin/orders?page=0&size=20")
      .then((res) => {
        console.log("ADMIN ORDER RESPONSE:", res.data);
        setOrdersPage(res.data);
      })
      .catch((err) => {
        console.error("ADMIN ORDER FETCH ERROR:", err);
        setError("Failed to load admin orders. Please check your admin token.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Safely read content from Spring Page object
  const orders = ordersPage?.content ?? [];

  return (
    <>
     

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">All Orders</h1>

        {loading && <p>Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-xl shadow border"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "---"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">
                      €{Number(order.total ?? 0).toFixed(2)}
                    </p>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          order.status === "PENDING"
                            ? "bg-yellow-200 text-yellow-800"
                            : order.status === "SHIPPED"
                            ? "bg-blue-200 text-blue-800"
                            : order.status === "PAID"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }
                      `}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-3">
                  <p className="text-gray-700 font-medium">
                    {order.fullName ?? "Unknown"}
                  </p>
                  <p className="text-gray-600 text-sm">{order.email}</p>
                </div>

                {/* Address */}
                <p className="text-sm text-gray-600 mb-3">
                  {order.address}, {order.city}, {order.postalCode},{" "}
                  {order.country}
                </p>

                {/* Items */}
                <div className="border-t pt-3 mt-3">
                  <h3 className="font-semibold mb-2">Items:</h3>

                  <div className="space-y-1">
                    {(order.items ?? []).map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm border-b py-1"
                      >
                        <span>
                          {item.title} (x{item.quantity})
                        </span>
                        <span>
                          €
                          {(
                            Number(item.price ?? 0) * Number(item.quantity ?? 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
