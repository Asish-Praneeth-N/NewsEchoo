'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Download, Mail, UserCheck, UserX, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, doc, updateDoc, where, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  subscribed: boolean;
  replies: number;
  joinDate: string;
  lastActive: string;
  enabled: boolean;
  role?: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');
  const [loading, setLoading] = useState(true);
  const [showNewslettersForUser, setShowNewslettersForUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersQuery = query(collection(db, 'users'), where('role', '!=', 'admin'));
        const querySnapshot = await getDocs(usersQuery);
        const usersData: User[] = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'Unknown',
              email: data.email || 'Unknown',
              subscribed: data.subscribed ?? false,
              replies: data.replies ?? 0,
              joinDate: data.createdAt?.toDate?.()?.toISOString().split('T')[0] || 'Unknown',
              lastActive: data.lastActive?.toDate?.()?.toISOString().split('T')[0] || 'Unknown',
              enabled: data.enabled ?? true,
              role: data.role,
            };
          })
          .filter(user => user.role !== 'admin');
        setUsers(usersData);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('Fetch users error:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleUserEnabled = async (userId: string, currentState: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        enabled: !currentState,
      });
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, enabled: !currentState } : user
        )
      );
      toast.success(`User ${!currentState ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  // Dummy newsletters data (replace with real fetch if needed)
  const newslettersByUser: Record<string, string[]> = {
    // userId: ["Newsletter A", "Newsletter B"]
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'subscribed' && user.subscribed) ||
      (filter === 'unsubscribed' && !user.subscribed);
    return matchesSearch && matchesFilter;
  });

  const subscribedCount = users.filter(user => user.subscribed).length;
  const totalReplies = users.reduce((sum, user) => sum + user.replies, 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-playfair font-bold text-slate-900">Users List</h1>
            <p className="mt-2 text-slate-600">Manage your newsletter subscribers and their activity.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{users.length}</p>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl">
                <UserCheck className="w-6 h-6 text-sky-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Subscribers</p>
                <p className="text-3xl font-bold text-slate-900">{subscribedCount}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Mail className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Replies</p>
                <p className="text-3xl font-bold text-slate-900">{totalReplies}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'subscribed' | 'unsubscribed')}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            >
              <option value="all">All Users</option>
              <option value="subscribed">Subscribed</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">User</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Replies</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Join Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Last Active</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.subscribed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.subscribed ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Subscribed
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Unsubscribed
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-900 font-medium">{user.replies}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-600">{new Date(user.joinDate).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-slate-600">{new Date(user.lastActive).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4 px-6 text-center space-x-2">
                      {/* Enable/Disable toggle */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={user.enabled}
                          onChange={() => toggleUserEnabled(user.id, user.enabled)}
                        />
                        <div
                          className={`w-11 h-6 ${
                            user.enabled ? 'bg-emerald-600' : 'bg-red-600'
                          } rounded-full peer peer-focus:ring-4 peer-focus:ring-${
                            user.enabled ? 'emerald' : 'red'
                          }-300 dark:peer-focus:ring-${
                            user.enabled ? 'emerald' : 'red'
                          }-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
                          aria-label={user.enabled ? 'Disable user' : 'Enable user'}
                        />
                      </label>

                      {/* Delete user */}
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="inline-flex items-center justify-center p-2 rounded-md text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                        aria-label="Delete user"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      {/* Show newsletters */}
                      <button
                        onClick={() =>
                          setShowNewslettersForUser(
                            showNewslettersForUser === user.id ? null : user.id
                          )
                        }
                        className="inline-flex items-center justify-center p-2 rounded-md text-sky-600 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                        aria-label="View newsletters"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Newsletters modal / section */}
        {showNewslettersForUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-8 rounded-2xl max-w-md w-full relative">
              <button
                onClick={() => setShowNewslettersForUser(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
                aria-label="Close newsletters"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold mb-4">Subscribed Newsletters</h2>
              {newslettersByUser[showNewslettersForUser]?.length ? (
                <ul className="list-disc pl-5 space-y-2">
                  {newslettersByUser[showNewslettersForUser].map((newsletter, i) => (
                    <li key={i}>{newsletter}</li>
                  ))}
                </ul>
              ) : (
                <p>No newsletters found for this user.</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
