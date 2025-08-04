'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Newsletter } from '../../types/newsletter';

export default function UserDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);

  useEffect(() => {
    if (!loading && (!user || role !== 'user' || !user.emailVerified)) {
      toast.error('Please log in and verify your email to access the dashboard.');
      router.push('/login');
      return;
    }
    const fetchNewsletters = async () => {
      try {
        const q = query(collection(db, 'newsletters'), where('status', '==', 'published'));
        const querySnapshot = await getDocs(q);
        const newsletterData: Newsletter[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        } as Newsletter));
        setNewsletters(newsletterData);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        toast.error(`Failed to fetch newsletters: ${error.message}`);
      }
    };
    if (user) fetchNewsletters();
  }, [user, role, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error(error.message);
      toast.error(`Failed to log out: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        Loading...
      </div>
    );
  }

  if (!user || role !== 'user' || !user.emailVerified) {
    return null;
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl w-full mx-4 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      >
        <h2 className="text-3xl font-playfair font-bold text-black dark:text-white mb-6 text-center">
          Welcome, {user?.email}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          You are logged in as a User. Enjoy your NewsEcho experience!
        </p>
        <div className="mb-8">
          <h3 className="text-xl font-playfair font-semibold text-black dark:text-white mb-4">
            Your Newsletters
          </h3>
          {newsletters.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No newsletters available.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsletters.map((newsletter) => (
                <motion.div
                  key={newsletter.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-300 dark:border-gray-600 p-6"
                >
                  <h4 className="text-lg font-medium text-black dark:text-white">{newsletter.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">{newsletter.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full max-w-xs mx-auto block py-3 px-4 bg-black dark:bg-gray-400 text-white rounded-lg font-medium transition-all duration-300"
        >
          Log Out
        </motion.button>
      </motion.div>
    </section>
  );
}