import { useEffect, useMemo, useState } from "react";
import http from "../lib/http";

const STATUS_OPTIONS = ["ALL", "PENDING", "PAID", "SHIPPED", "CANCELLED"];
const STATUS_UPDATE_OPTIONS = ["PENDING", "PAID", "SHIPPED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);      // frontend page index
  const [size, setSize] = useState(10);     // items per page

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("DATE_DESC");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* --------------------------------------------------
   * 1) LOAD ALL ORDERS (single backend call)
   *    We request a large page so we can handle
   *    search/sort/pagination fully on the client.
   * -------------------------------------------------- */
  useEffect(() => {
    setLoading(true);
    setError(null);

    http
      .get("/admin/orders", {
        params: { page: 0, size: 1000 },
      })
      .then((res) => {
        const content = res.data?.content || [];
        setOrders(content);
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        setError("Failed to load orders.");
      })
      .finally(() => setLoading(false));
  }, []);


  /* --------------------------------------------------
   * 2) Whenever filters/search/sort change, reset to
   *    first page so pagination and results stay in sync.
   * -------------------------------------------------- */
  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, sort, fromDate, toDate, size]);

  /* --------------------------------------------------
   * 3) Apply search + status filter + date filter + sort
   *    on the full orders list.
   * -------------------------------------------------- */
  const processedOrders = useMemo(() => {
    let result = [...orders];
    const s = search.toLowerCase().trim();

    // search: ID, name, email
    if (s) {
      result = result.filter((o) => {
        return (
          String(o.id).toLowerCase().includes(s) ||
          (o.fullName || "").toLowerCase().includes(s) ||
          (o.email || "").toLowerCase().includes(s)
        );
      });
    }

    // status filter
    if (statusFilter !== "ALL") {
      result = result.filter(
        (o) => (o.status || "").toUpperCase() === statusFilter
      );
    }

    // date range filter (createdAt)
    if (fromDate) {
      const start = new Date(fromDate).getTime();
      result = result.filter(
        (o) => new Date(o.createdAt).getTime() >= start
      );
    }
    if (toDate) {
      // add 1 day end-of-day so "to" is inclusive
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      const endTime = end.getTime();

      result = result.filter(
        (o) => new Date(o.createdAt).getTime() <= endTime
      );
    }

    // sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      const totalA = Number(a.total);
      const totalB = Number(b.total);

      switch (sort) {
        case "DATE_ASC":
          return dateA - dateB;
        case "DATE_DESC":
          return dateB - dateA;        // newest first (global)
        case "TOTAL_ASC":
          return totalA - totalB;
        case "TOTAL_DESC":
          return totalB - totalA;
        default:
          return 0;
      }
    });

    return result;
  }, [orders, search, statusFilter, sort, fromDate, toDate]);

  /* --------------------------------------------------
   * 4) Client-side pagination on processedOrders
   * -------------------------------------------------- */
  const totalPages = Math.max(
    1,
    Math.ceil(processedOrders.length / size)
  );

  const pagedOrders = useMemo(() => {
    const startIdx = page * size;
    const endIdx = startIdx + size;
    return processedOrders.slice(startIdx, endIdx);
  }, [processedOrders, page, size]);

  /* --------------------------------------------------
   * 5) CSV EXPORT (export all filtered orders, not only page)
   * -------------------------------------------------- */
  const exportCSV = () => {
    if (processedOrders.length === 0) {
      alert("No orders to export.");
      return;
    }

    const header = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Status",
      "Total",
      "CreatedAt",
      "Address",
    ].join(",");

    const rows = processedOrders.map((o) =>
      [
        o.id,
        `"${o.fullName}"`,
        o.email,
        o.phone,
        o.status,
        o.total,
        o.createdAt,
        `"${o.address}, ${o.city}, ${o.postalCode}, ${o.country}"`,
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  /* --------------------------------------------------
   * RENDER
   * -------------------------------------------------- */
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
        <h1 className="text-2xl font-bold">Orders Dashboard</h1>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid gap-4 md:grid-cols-4">
        <input
          type="text"
          placeholder="Search: ID, name, email"
          className="border px-3 py-2 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="DATE_DESC">Newest First</option>
          <option value="DATE_ASC">Oldest First</option>
          <option value="TOTAL_DESC">Total: High → Low</option>
          <option value="TOTAL_ASC">Total: Low → High</option>
        </select>

        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="border px-3 py-2 rounded-lg"
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
        </select>

        {/* DATE RANGE */}
        <div className="flex gap-2 md:col-span-2">
          <input
            type="date"
            className="border px-3 py-2 rounded-lg flex-1"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            className="border px-3 py-2 rounded-lg flex-1"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <p className="text-gray-500">Loading orders…</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : processedOrders.length === 0 ? (
        <p className="text-gray-500">No orders match your filters.</p>
      ) : (
        <div className="space-y-6">
          {pagedOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {processedOrders.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 border rounded-lg disabled:opacity-40"
          >
            Previous
          </button>

          <p className="text-sm">
            Page <strong>{page + 1}</strong> of {totalPages}
          </p>

          <button
            onClick={() =>
              setPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={page === totalPages - 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* --- ORDER CARD WITH STATUS UPDATE FEATURE --- */
function OrderCard({ order }) {
  const [updating, setUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState(order.status);

  const updateStatus = async (newStatus) => {
    if (newStatus === localStatus) return;

    const previousStatus = localStatus;
    setLocalStatus(newStatus);
    setUpdating(true);

    try {
      const res = await http.patch(
        `/admin/orders/${order.id}/status`,
        null,
        { params: { status: newStatus } }
      );

      const updatedStatus = res.data?.status ?? newStatus;
      setLocalStatus(updatedStatus);
    } catch (err) {
      console.error("Status update failed:", err?.response?.data || err.message);
      setLocalStatus(previousStatus);
      const msg =
        err?.response?.data?.message ||
        "Failed to update status. Check product stock or try again.";
      alert(msg);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-semibold text-gray-900">Order #{order.id}</p>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <p className="text-indigo-600 text-lg font-bold">
            €{Number(order.total).toFixed(2)}
          </p>

          <select
            className="mt-1 border px-2 py-1 rounded-lg text-sm"
            disabled={updating}
            value={localStatus}
            onChange={(e) => updateStatus(e.target.value)}
          >
            {STATUS_UPDATE_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer */}
      <p className="font-medium text-gray-800">{order.fullName}</p>
      <p className="text-sm text-gray-600">{order.email}</p>
      <p className="text-xs text-gray-500 mb-2">Phone: {order.phone}</p>

      {/* Address */}
      <p className="text-sm text-gray-600 mb-4">
        {order.address}, {order.city}, {order.postalCode}, {order.country}
      </p>

      {/* Items */}
      <div className="border-t pt-3 mt-3 text-sm">
        <p className="font-semibold mb-2">Items</p>

        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between border-b py-1 last:border-b-0"
          >
            <span>
              {item.title} × {item.quantity}
            </span>
            <span>€{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="mt-2 text-xs text-gray-500">
          <strong>Notes:</strong> {order.notes}
        </div>
      )}
    </div>
  );
}
