"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalClients: number;
  totalProjects: number;
  totalTasks: number;
  activeProjects: number;
  completedTasks: number;
}

export default function AdminContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as "ADMIN" | "EMPLOYEE",
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Kullanıcılar alınamadı");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Kullanıcılar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [clientsRes, projectsRes, tasksRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/projects"),
        fetch("/api/tasks"),
      ]);

      const clients = await clientsRes.json();
      const projects = await projectsRes.json();
      const tasks = await tasksRes.json();

      setStats({
        totalUsers: 0, // Will be updated after users fetch
        totalClients: clients.length,
        totalProjects: projects.length,
        totalTasks: tasks.length,
        activeProjects: projects.filter((p: any) => p.status === "ACTIVE").length,
        completedTasks: tasks.filter((t: any) => t.status === "DONE").length,
      });
    } catch (error) {
      console.error("Stats error:", error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "EMPLOYEE") => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Rol değiştirilemedi");

      toast.success("Kullanıcı rolü güncellendi");
      fetchUsers();
    } catch (error) {
      toast.error("Rol güncellenemedi");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Kullanıcı silinemedi");

      toast.success("Kullanıcı silindi");
      fetchUsers();
    } catch (error) {
      toast.error("Kullanıcı silinemedi");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Kullanıcı eklenemedi");

      toast.success("Kullanıcı eklendi");
      setShowAddUser(false);
      setNewUser({ name: "", email: "", password: "", role: "EMPLOYEE" });
      fetchUsers();
    } catch (error) {
      toast.error("Kullanıcı eklenemedi");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card">
            <p className="text-xs text-gray-600">Kullanıcılar</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-600">Müşteriler</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalClients}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-600">Projeler</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProjects}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-600">Aktif Projeler</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeProjects}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-600">Toplam Görev</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTasks}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-600">Tamamlanan</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.completedTasks}</p>
          </div>
        </div>
      )}

      {/* Users Management */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Kullanıcı Yönetimi</h2>
          <button onClick={() => setShowAddUser(true)} className="btn-primary btn-sm">
            + Kullanıcı Ekle
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">İsim</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rol</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Kayıt Tarihi</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value as any)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="EMPLOYEE">Çalışan</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-500">
                      {format(new Date(user.createdAt), "dd MMM yyyy", { locale: tr })}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Kullanıcı Ekle</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="label">İsim *</label>
                <input
                  type="text"
                  className="input"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  className="input"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Şifre *</label>
                <input
                  type="password"
                  className="input"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="label">Rol</label>
                <select
                  className="input"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                >
                  <option value="EMPLOYEE">Çalışan</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Kullanıcı Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="btn-secondary flex-1"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

