import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import http from "../../lib/http";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    try {
      const { data } = await http.get("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  async function promoteUser(email) {
    try {
      await http.post("/admin/promote", { email });
      toast.success(`User ${email} promoted to admin`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to promote user");
    }
  }

  async function demoteUser(email) {
    try {
      await http.post("/admin/demote", { email });
      toast.success(`Admin ${email} demoted to user`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to demote admin");
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading users…</p>;
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-4 text-xl font-semibold">Registered Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Roles</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => {
              const roles = Array.isArray(u.roles) ? u.roles : [...(u.roles ?? [])];
              const isAdmin = roles.includes("ADMIN");

              return (
                <tr key={u.id || u.email || idx} className={idx % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-4 py-2">{u.name ?? "-"}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{roles.join(", ")}</td>
                  <td className="px-4 py-2 text-center">
                    {isAdmin ? (
                      <button
                        onClick={() => demoteUser(u.email)}
                        className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      >
                        Demote
                      </button>
                    ) : (
                      <button
                        onClick={() => promoteUser(u.email)}
                        className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                      >
                        Promote
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
