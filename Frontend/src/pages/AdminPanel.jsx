import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import http from "../lib/http";

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await http.get('/api/admin/users');
            setUsers(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const promotUser = async (email) => {
        try {
            await http.post('/api/admin/promote', { email });
            toast.success(`User ${email} promoted to admin`);
            fetchUsers(); // Refresh the user list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to promote user');
        }
    };

    const demoteUser = async (email) => {
        try {
            await http.post('/api/admin/demote', { email });
            toast.success(`Admin ${email} demoted to user`);
            fetchUsers(); // Refresh the user list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to demote admin');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) {
        return <p className="text-center mt-10 text-gray-500">Loading users...</p>;;
    }
     return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-gray-600">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Roles</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr
                key={u.id}
                className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <td className="px-6 py-3">{u.name}</td>
                <td className="px-6 py-3">{u.email}</td>
                <td className="px-6 py-3">{[...u.roles].join(', ')}</td>
                <td className="px-6 py-3 text-center space-x-2">
                  {!u.roles.includes('ADMIN') ? (
                    <button
                      onClick={() => promoteUser(u.email)}
                      className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Promote
                    </button>
                  ) : (
                    <button
                      onClick={() => demoteUser(u.email)}
                      className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Demote
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
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