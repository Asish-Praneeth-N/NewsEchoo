"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  MessageSquare,
  Edit,
  Trash,
  Image as ImageIcon,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Newsletter {
  id: string;
  title: string;
  publishedAt: Date | null;
  status: "published" | "draft";
  replies: number;
  subscribers: number;
  imageUrl?: string | null;
  author: string;
  category: string;
}

export default function ManageNewsletters() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const q = query(
          collection(db, "newsletters"),
          orderBy("updatedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const newslettersData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Untitled",
            publishedAt: data.publishedAt?.toDate() || null,
            status: data.status || "draft",
            replies: data.replies || 0,
            subscribers: data.subscribers || 0,
            imageUrl: data.imageUrl || null,
            author: data.author || "Unknown",
            category: data.category || "General",
          };
        }) as Newsletter[];
        setNewsletters(newslettersData);
        console.log(`Fetched ${newslettersData.length} newsletters`);
      } catch (err) {
        console.error("Fetch newsletters error:", err);
        toast.error("Failed to load newsletters");
      } finally {
        setLoading(false);
      }
    };
    fetchNewsletters();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this newsletter?")) return;
    try {
      await deleteDoc(doc(db, "newsletters", id));
      setNewsletters((prev) => prev.filter((n) => n.id !== id));
      toast.success("Newsletter deleted successfully");
    } catch (err) {
      console.error("Delete newsletter error:", err);
      toast.error("Failed to delete newsletter");
    }
  };

  const filteredNewsletters = newsletters.filter((newsletter) => {
    const matchesSearch = newsletter.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || newsletter.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-playfair font-bold text-black dark:text-white">
              Manage Newsletters
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              View, edit, and manage all your newsletters.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/admin/create")}
            className="flex items-center px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Newsletter
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-300 dark:border-gray-600"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-300" />
                <input
                  type="text"
                  placeholder="Search newsletters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-gray-500 dark:focus:border-gray-400 transition-colors dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-gray-500 dark:focus:border-gray-400 transition-colors dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <button className="flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-300 dark:border-gray-600 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-black dark:text-white">
                    Title
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-black dark:text-white">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-black dark:text-white">
                    Author
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-black dark:text-white">
                    Published
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-black dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-black dark:text-white">
                    Replies
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-black dark:text-white">
                    Subscribers
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-4 px-6 text-center text-gray-600 dark:text-gray-300"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : (
                  filteredNewsletters.map((newsletter, index) => (
                    <motion.tr
                      key={newsletter.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-4">
                          {newsletter.imageUrl ? (
                            <img
                              src={newsletter.imageUrl}
                              alt={newsletter.title}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                console.warn(
                                  `Failed to load image for newsletter ${newsletter.id}`
                                );
                                (e.currentTarget as HTMLElement).style.display =
                                  "none";
                                (
                                  e.currentTarget
                                    .nextElementSibling as HTMLElement
                                ).style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                            style={{
                              display: newsletter.imageUrl ? "none" : "flex",
                            }}
                          >
                            <ImageIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="font-medium text-black dark:text-white">
                            {newsletter.title}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        {newsletter.category}
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        {newsletter.author}
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {newsletter.publishedAt
                            ? new Date(
                                newsletter.publishedAt
                              ).toLocaleDateString()
                            : "Not published"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            newsletter.status === "published"
                              ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200"
                              : "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200"
                          }`}
                        >
                          {newsletter.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {newsletter.replies}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        {newsletter.subscribers > 0
                          ? newsletter.subscribers.toLocaleString()
                          : "-"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/create?id=${newsletter.id}`)
                            }
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                          <button
                            onClick={() => handleDelete(newsletter.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Trash className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {!loading && filteredNewsletters.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-black dark:text-white mb-2">
              No newsletters found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search or filter criteria.
            </p>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
