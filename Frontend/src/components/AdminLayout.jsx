import { Outlet } from "react-router-dom";
import AdminNavBar from "./AdminNavBar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavBar />
      <main className="mx-auto max-w-7xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
