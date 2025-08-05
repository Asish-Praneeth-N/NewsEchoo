"use client";

import { useState, useEffect } from "react";
import { Mail, Users, MessageSquare, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
}

function StatCard({ icon, title, value, change, changeType }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover-lift">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          </div>
        </div>
        {change && (
          <div
            className={`flex items-center space-x-1 text-sm ${
              changeType === "positive"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface Newsletter {
  id: string;
  title: string;
  isSubscribed: boolean;
}

interface Reply {
  id: string;
  newsletterTitle: string;
  message: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalNewsletters: 0,
    subscribedNewsletters: 0,
    totalReplies: 0,
  });
  const [recentReplies, setRecentReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && role === "admin") {
      router.push("/admin");
      return;
    }

    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const newslettersQuery = query(
          collection(db, "newsletters"),
          where("status", "==", "published")
        );
        const newslettersSnap = await getDocs(newslettersQuery);
        const newsletters: Newsletter[] = newslettersSnap.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || "Untitled",
          isSubscribed: false,
        }));

        const subscriptionsQuery = query(
          collection(db, "users", user.uid, "subscriptions")
        );
        const subscriptionsSnap = await getDocs(subscriptionsQuery);
        const subscribedIds = subscriptionsSnap.docs.map((doc) => doc.id);
        newsletters.forEach((n) => {
          n.isSubscribed = subscribedIds.includes(n.id);
        });

        const repliesQuery = query(
          collection(db, "replies"),
          where("senderId", "==", user.uid)
        );
        const repliesSnap = await getDocs(repliesQuery);
        const replies: Reply[] = repliesSnap.docs.map((doc) => ({
          id: doc.id,
          newsletterTitle: doc.data().newsletterTitle || "Unknown",
          message: doc.data().message || "",
          createdAt:
            doc.data().timestamp?.toDate().toISOString() ||
            new Date().toISOString(),
        }));

        setStats({
          totalNewsletters: newsletters.length,
          subscribedNewsletters: newsletters.filter((n) => n.isSubscribed).length,
          totalReplies: replies.length,
        });
        setRecentReplies(replies.slice(0, 3));
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        console.error("Fetch dashboard data error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading, role, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-300">
          Please log in to view your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.displayName || "User"}!
            </h1>
            <p className="text-blue-100 text-lg">
              Here&apos;s what&apos;s happening with your newsletters today.
            </p>
            {role === "admin" && (
              <p className="text-blue-200 text-sm mt-2">
                You have admin access. Visit the{" "}
                <Link href="/admin" className="underline">
                  Admin Dashboard
                </Link>{" "}
                for more controls.
              </p>
            )}
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <Mail className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Mail className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
          title="Total Newsletters"
          value={stats.totalNewsletters.toString()}
          change="+3 this week"
          changeType="positive"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-green-500 dark:text-green-400" />}
          title="Your Subscriptions"
          value={stats.subscribedNewsletters.toString()}
          change="+1 this week"
          changeType="positive"
        />
        <StatCard
          icon={
            <MessageSquare className="w-6 h-6 text-purple-500 dark:text-purple-400" />
          }
          title="Replies Sent"
          value={stats.totalReplies.toString()}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {recentReplies.length > 0 ? (
            recentReplies.map((reply) => (
              <div
                key={reply.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {reply.newsletterTitle}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                    {reply.message.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No recent replies.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
