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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function AdminHome() {
  // sample demo data
  const revenueData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Revenue (€)",
        data: [540, 610, 700, 820, 750, 900, 1000],
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

  return (
    <div className="p-6 space-y-6">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Revenue Today</p>
          <h2 className="text-2xl font-semibold mt-1">€1,240</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <h2 className="text-2xl font-semibold mt-1">58</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Active Users</p>
          <h2 className="text-2xl font-semibold mt-1">14</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Low Stock Items</p>
          <h2 className="text-2xl font-semibold mt-1">3</h2>
        </div>
      </div>

      {/* GRAPHS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Sales This Week</h2>
          <Line data={revenueData} />
        </div>

        {/* API Performance */}
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
              <tr className="border-b">
                <td>#1234</td>
                <td>John Doe</td>
                <td>€89.99</td>
                <td className="text-green-600 font-medium">Completed</td>
              </tr>

              <tr className="border-b">
                <td>#1235</td>
                <td>Sarah Lee</td>
                <td>€45.50</td>
                <td className="text-yellow-600 font-medium">Pending</td>
              </tr>

              <tr>
                <td>#1236</td>
                <td>Michael</td>
                <td>€120.00</td>
                <td className="text-red-600 font-medium">Failed</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* System Alerts */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">System Alerts</h2>

          <ul className="space-y-3 text-sm text-gray-700">
            <li className="p-3 rounded-lg bg-red-50 border border-red-200">
              High API latency detected at 6 PM.
            </li>

            <li className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              Stock low for “Women Hoodie”.
            </li>

            <li className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              New user registered: maria@example.com
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
