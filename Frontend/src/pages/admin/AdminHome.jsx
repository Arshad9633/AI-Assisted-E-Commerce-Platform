import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import toast from "react-hot-toast";
import {
  getDashboardKpis,
  getDashboardSalesWeek,
  getDashboardRecentOrders,
  getDashboardAlerts,
} from "../../api/adminDashboard";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function AdminHome() {
  /* --------------------------
       Dashboard State
  --------------------------- */
  const [kpis, setKpis] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);

  /* --------------------------
       LOAD DASHBOARD DATA
  --------------------------- */
  const loadDashboard = async () => {
    try {
      const [kpiRes, salesRes, ordersRes, alertsRes] = await Promise.all([
        getDashboardKpis(),
        getDashboardSalesWeek(),
        getDashboardRecentOrders(),
        getDashboardAlerts(),
      ]);

      setKpis(kpiRes);
      setSalesData(salesRes);
      setRecentOrders(ordersRes);
      setAlerts(alertsRes);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !kpis) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">Loading dashboard…</p>
      </div>
    );
  }

  /* --------------------------
       Prepare Chart.js Data
  --------------------------- */

  const revenueData = {
    labels: salesData.labels,
    datasets: [
      {
        label: "Revenue (€)",
        data: salesData.values,
        borderColor: "rgb(99,102,241)",
        backgroundColor: "rgba(99,102,241,0.2)",
        tension: 0.4,
      },
    ],
  };

  const apiLatencyData = {
    labels: ["10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"],
    datasets: [
      {
        label: "API Latency (ms)",
        data: [120, 160, 140, 180, 200, 150],
        borderColor: "rgb(239,68,68)",
        backgroundColor: "rgba(239,68,68,0.2)",
        tension: 0.4,
      },
    ],
  };

  /* --------------------------
       Helper: status badge classes
  --------------------------- */
  const statusBadge = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    if (status === "COMPLETED" || status === "PAID") return "bg-green-50 text-green-700";
    if (status === "PENDING") return "bg-yellow-50 text-yellow-700";
    if (status === "SHIPPED") return "bg-blue-50 text-blue-700";
    return "bg-gray-100 text-gray-800";
  };

  /* --------------------------
       UI
  --------------------------- */
  return (
    <div className="p-6 space-y-6">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Revenue Today</p>
          <h2 className="text-2xl font-semibold mt-1">€{kpis.revenueToday.toFixed(2)}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <h2 className="text-2xl font-semibold mt-1">{kpis.totalOrders}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Active Users (30 min)</p>
          <h2 className="text-2xl font-semibold mt-1">{kpis.activeUsers}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Low Stock Items</p>
          <h2 className="text-2xl font-semibold mt-1">{kpis.lowStockCount}</h2>
        </div>
      </div>

      {/* GRAPHS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Sales This Week</h2>
          <Line data={revenueData} />
        </div>

        {/* API Latency */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">API Latency</h2>
          <Line data={apiLatencyData} />
        </div>
      </div>

      {/* TABLES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Recent Orders</h2>

          {/* Desktop table (unchanged) */}
          <div className="hidden lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Order</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b">
                    <td className="py-3">#{o.id}</td>
                    <td className="py-3">{o.userName}</td>
                    <td className="py-3">€{o.amount.toFixed(2)}</td>
                    <td className={`py-3 font-medium ${o.status === "COMPLETED" ? "text-green-600" : o.status === "PENDING" ? "text-yellow-600" : "text-red-600"}`}>
                      {o.status}
                    </td>
                  </tr>
                ))}

                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-gray-500 text-center">
                      No recent orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="block lg:hidden space-y-3">
  
            {recentOrders.map((o) => (
              <article
                key={o.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm"
                role="group"
              >
                <div className="flex-1 min-w-0">
                  {/* order id truncated */}
                  <div className="text-xs text-gray-500">Order</div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    #{o.id}
                  </div>

                  <div className="mt-1 text-xs text-gray-500">User</div>
                  <div className="text-sm text-gray-700 truncate">{o.userName}</div>
                </div>

                <div className="ml-3 flex-shrink-0 text-right">
                  <div className="text-sm font-semibold">€{o.amount.toFixed(2)}</div>
                  <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(o.status)}`}>
                    {o.status}
                  </div>
                </div>
              </article>
            ))}

            {recentOrders.length === 0 && (
              <div className="text-gray-500 text-sm text-center">No recent orders.</div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">System Alerts</h2>

          <ul className="space-y-3 text-sm text-gray-700">
            {alerts.map((a, i) => (
              <li
                key={i}
                className={`p-3 rounded-lg border ${
                  a.level === "ERROR"
                    ? "bg-red-50 border-red-200"
                    : a.level === "WARNING"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                {a.message}
              </li>
            ))}

            {alerts.length === 0 && <li className="text-gray-500">No alerts.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
