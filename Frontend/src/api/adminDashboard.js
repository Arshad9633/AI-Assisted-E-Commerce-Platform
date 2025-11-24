import http from "../lib/http.jsx";

// -----------------------------
// Admin Dashboard 
// -----------------------------

export async function getDashboardKpis() {
  const { data } = await http.get("/admin/dashboard/kpis");
  return data;
}

export async function getDashboardSalesWeek() {
  const { data } = await http.get("/admin/dashboard/sales-week");
  return data;
}

export async function getDashboardRecentOrders() {
  const { data } = await http.get("/admin/dashboard/recent-orders");
  return data;
}

export async function getDashboardAlerts() {
  const { data } = await http.get("/admin/dashboard/alerts");
  return data;
}