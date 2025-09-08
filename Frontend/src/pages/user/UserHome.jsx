import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

export default function UserHome() {
  const { name, email } = useAuth();
  const displayName = name || (email ? email.split("@")[0] : "there");

  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <Navbar />
      <h1 className="text-xl font-semibold">Welcome, {displayName}</h1>
      <p className="mt-2 text-gray-600">
        This is your dashboard. We’ll add orders, saved items, and account settings here.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <section className="rounded-xl border p-4">
          <h2 className="font-medium">Recent orders</h2>
          <p className="text-sm text-gray-500">No orders yet.</p>
        </section>

        <section className="rounded-xl border p-4">
          <h2 className="font-medium">Saved items</h2>
          <p className="text-sm text-gray-500">You haven’t saved anything yet.</p>
        </section>

        <section className="rounded-xl border p-4">
          <h2 className="font-medium">Account</h2>
          <p className="text-sm text-gray-500">Update your profile and address.</p>
        </section>
      </div>
    </div>
  );
}
