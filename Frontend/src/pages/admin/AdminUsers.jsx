import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import http from "../../lib/http";
import { Search } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

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

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter logic for search
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    return users.filter((u) =>
      (u.name ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading users…
      </p>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Registered Users
        </h2>

        {/* SEARCH BAR */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-800 rounded-xl">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Roles</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((u, idx) => {
              const roles = Array.isArray(u.roles) ? u.roles : [...(u.roles ?? [])];
              const isAdmin = roles.includes("ADMIN");

              return (
                <tr key={u.id || u.email || idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{u.name ?? "-"}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{roles.join(", ")}</td>

                  <td className="px-4 py-3 text-center">
                    {isAdmin ? (
                      <button
                        onClick={() => demoteUser(u.email)}
                        className="rounded-lg bg-red-500 px-4 py-1.5 text-white hover:bg-red-600 transition"
                      >
                        Demote
                      </button>
                    ) : (
                      <button
                        onClick={() => promoteUser(u.email)}
                        className="rounded-lg bg-green-600 px-4 py-1.5 text-white hover:bg-green-700 transition"
                      >
                        Promote
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No matching users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
