'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import NewsletterCard from '@/components/admin/NewsletterCard';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { BarChart2, Users, MessageSquare, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Newsletter } from '@/types/newsletter';

export default function AdminDashboard() {
  const [totalNewsletters, setTotalNewsletters] = useState(0);
  const [newsletterGrowth, setNewsletterGrowth] = useState(0);
  const [activeSubscribers, setActiveSubscribers] = useState(0);
  const [subscriberGrowth, setSubscriberGrowth] = useState(0);
  const [totalReplies, setTotalReplies] = useState(0);
  const [repliesGrowth, setRepliesGrowth] = useState(0);
  const [lastPublished, setLastPublished] = useState<{ title: string; date: Date } | null>(null);
  const [recentNewsletters, setRecentNewsletters] = useState<Newsletter[]>([]);
  const [engagementData, setEngagementData] = useState<number[]>([]);
  const [growthPercentage, setGrowthPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const fourteenDaysAgo = new Date(today);
        fourteenDaysAgo.setDate(today.getDate() - 14);
        fourteenDaysAgo.setHours(0, 0, 0, 0);

        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        // Fetch newsletters (only published)
        const newslettersSnapshot = await getDocs(
          query(collection(db, 'newsletters'), where('status', '==', 'published'))
        );
        setTotalNewsletters(newslettersSnapshot.size);

        // Newsletters published in the last 7 days
        const currentNewsletters = await getDocs(
          query(
            collection(db, 'newsletters'),
            where('status', '==', 'published'),
            where('publishedAt', '>=', sevenDaysAgo),
            where('publishedAt', '<=', today)
          )
        );

        // Newsletters published in the 7 days before that
        const previousNewsletters = await getDocs(
          query(
            collection(db, 'newsletters'),
            where('status', '==', 'published'),
            where('publishedAt', '>=', fourteenDaysAgo),
            where('publishedAt', '<', sevenDaysAgo)
          )
        );

        const currentNewsletterCount = currentNewsletters.size;
        const previousNewsletterCount = previousNewsletters.size;
        const newsletterGrowth =
          previousNewsletterCount === 0
            ? (currentNewsletterCount > 0 ? 100 : 0)
            : ((currentNewsletterCount - previousNewsletterCount) / previousNewsletterCount) * 100;
        setNewsletterGrowth(Math.round(newsletterGrowth * 10) / 10);

        // Active Subscribers (users with subscribed == true)
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'user'), where('subscribed', '==', true))
        );
        setActiveSubscribers(usersSnapshot.size);

        // New active subscribers this period
        const currentSubscribers = await getDocs(
          query(
            collection(db, 'users'),
            where('role', '==', 'user'),
            where('subscribed', '==', true),
            where('createdAt', '>=', sevenDaysAgo),
            where('createdAt', '<=', today)
          )
        );

        // Active subscribers in previous period
        const previousSubscribers = await getDocs(
          query(
            collection(db, 'users'),
            where('role', '==', 'user'),
            where('subscribed', '==', true),
            where('createdAt', '>=', fourteenDaysAgo),
            where('createdAt', '<', sevenDaysAgo)
          )
        );

        const currentSubscriberCount = currentSubscribers.size;
        const previousSubscriberCount = previousSubscribers.size;
        const subscriberGrowth =
          previousSubscriberCount === 0
            ? (currentSubscriberCount > 0 ? 100 : 0)
            : ((currentSubscriberCount - previousSubscriberCount) / previousSubscriberCount) * 100;
        setSubscriberGrowth(Math.round(subscriberGrowth * 10) / 10);

        // Total Replies (count of all replies)
        const repliesSnapshot = await getDocs(collection(db, 'replies'));
        setTotalReplies(repliesSnapshot.size);

        // Replies in current period (last 7 days)
        const currentRepliesQ = query(
          collection(db, 'replies'),
          where('createdAt', '>=', sevenDaysAgo),
          where('createdAt', '<=', today)
        );
        const currentRepliesSnapshot = await getDocs(currentRepliesQ);
        const currentReplies = currentRepliesSnapshot.size;

        // Replies in previous period (7 days before current)
        const previousRepliesQ = query(
          collection(db, 'replies'),
          where('createdAt', '>=', fourteenDaysAgo),
          where('createdAt', '<', sevenDaysAgo)
        );
        const previousRepliesSnapshot = await getDocs(previousRepliesQ);
        const previousReplies = previousRepliesSnapshot.size;

        const repliesGrowth =
          previousReplies === 0
            ? (currentReplies > 0 ? 100 : 0)
            : ((currentReplies - previousReplies) / previousReplies) * 100;
        setRepliesGrowth(Math.round(repliesGrowth * 10) / 10);

        // Last Published Newsletter
        const lastPublishedQuery = query(
          collection(db, 'newsletters'),
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc'),
          limit(1)
        );
        const lastPublishedSnapshot = await getDocs(lastPublishedQuery);
        if (!lastPublishedSnapshot.empty) {
          const data = lastPublishedSnapshot.docs[0].data();
          setLastPublished({
            title: data.title || 'Untitled',
            date: data.publishedAt?.toDate?.() || new Date(),
          });
        }

        // Recent Newsletters (latest 3 published)
        const recentQuery = query(
          collection(db, 'newsletters'),
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc'),
          limit(3)
        );
        const recentSnapshot = await getDocs(recentQuery);

        // For each newsletter, count replies related to it
        const recentNewslettersData: Newsletter[] = recentSnapshot.docs
          .filter((doc) => doc.data().publishedAt)
          .map((doc) => {
            const data = doc.data();
            const newsletterReplies = repliesSnapshot.docs.filter(
              (replyDoc) => replyDoc.data().newsletterId === doc.id
            ).length;
            return {
              id: doc.id,
              title: data.title || 'Untitled',
              date: data.publishedAt.toDate?.() || new Date(),
              status: data.status || 'draft',
              replies: newsletterReplies,
              subscribers: data.subscribers || 0,
              imageUrl: data.imageUrl,
              content: data.content || '',
            };
          });
        setRecentNewsletters(recentNewslettersData);

        // Engagement Data: new subscribers in last 30 days, grouped by day for last 7 days
        const engagementQuery = query(
          collection(db, 'users'),
          where('role', '==', 'user'),
          where('subscribed', '==', true),
          where('createdAt', '>=', thirtyDaysAgo),
          orderBy('createdAt', 'asc')
        );
        const engagementSnapshot = await getDocs(engagementQuery);

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          const subscribersOnDay = engagementSnapshot.docs.filter((doc) => {
            const docDate = doc.data().createdAt?.toDate?.();
            return docDate && docDate >= date && docDate < nextDate;
          }).length;
          return subscribersOnDay;
        });
        setEngagementData(last7Days);

        const early = last7Days.slice(0, 3).reduce((a, b) => a + b, 0);
        const recent = last7Days.slice(4, 7).reduce((a, b) => a + b, 0);
        const growth = early === 0 ? (recent > 0 ? 100 : 0) : ((recent - early) / early) * 100;
        setGrowthPercentage(Math.round(growth * 10) / 10);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('Error fetching dashboard:', error.message);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-playfair font-bold text-black dark:text-white">Dashboard Overview</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
  Welcome back! Here&apos;s what&apos;s happening with your newsletter platform.
</p>

        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard
            title="Total Newsletters"
            value={totalNewsletters.toLocaleString()}
            change={`${newsletterGrowth >= 0 ? '+' : ''}${newsletterGrowth}%`}
            changeColor={newsletterGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
            icon={<BarChart2 className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
            loading={loading}
          />
          <StatsCard
            title="Active Subscribers"
            value={activeSubscribers.toLocaleString()}
            change={`${subscriberGrowth >= 0 ? '+' : ''}${subscriberGrowth}%`}
            changeColor={subscriberGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
            icon={<Users className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
            loading={loading}
          />
          <StatsCard
            title="Total Replies"
            value={totalReplies.toLocaleString()}
            change={`${repliesGrowth >= 0 ? '+' : ''}${repliesGrowth}%`}
            changeColor={repliesGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
            icon={<MessageSquare className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
            loading={loading}
          />
          <StatsCard
            title="Last Published"
            value={lastPublished ? lastPublished.title : '-'}
            change={lastPublished ? lastPublished.date.toLocaleDateString() : '-'}
            icon={<Calendar className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
            loading={loading}
          />
        </motion.div>

        {/* Engagement Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-300 dark:border-gray-600 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-playfair font-semibold text-black dark:text-white">Recent Engagement</h2>
            <span
              className={`text-sm ${
                growthPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {growthPercentage >= 0 ? '+' : ''}
              {growthPercentage}% growth
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Newsletter performance from{' '}
            {sevenDaysAgo.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} to Today
          </p>

          {loading ? (
            <div className="text-center text-gray-600 dark:text-gray-300">Loading chart...</div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="h-36 bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-end justify-between p-4 space-x-2"
            >
              {engagementData.map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(value * 10 + 10, 100)}%` }} // adjusted scaling for better visibility
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex-1 bg-gradient-to-t from-sky-600 to-sky-400 dark:from-emerald-600 dark:to-emerald-400 rounded-t"
                />
              ))}
            </motion.div>
          )}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>7 days ago</span>
            <span>Today</span>
          </div>
        </motion.div>

        {/* Recent Newsletters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-300 dark:border-gray-600 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-playfair font-semibold text-black dark:text-white">Recent Newsletters</h2>
            <button
              onClick={() => router.push('/admin/newsletters')}
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
            >
              View all →
            </button>
          </div>
          {loading ? (
            <div className="text-center text-gray-600 dark:text-gray-300">Loading newsletters...</div>
          ) : (
            <div className="space-y-4">
              {recentNewsletters.map((newsletter) => (
                <NewsletterCard
                  key={newsletter.id}
                  title={newsletter.title}
                  status={newsletter.status}
                  date={newsletter.date}
                  replies={newsletter.replies}
                  imageUrl={newsletter.imageUrl}
                  onClick={() => router.push(`/admin/newsletters`)}
                />
              ))}
              {recentNewsletters.length === 0 && (
                <p className="text-gray-600 dark:text-gray-300">No recent newsletters found.</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
