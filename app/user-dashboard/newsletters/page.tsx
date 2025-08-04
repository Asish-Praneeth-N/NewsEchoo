'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

interface Newsletter {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  author: string;
  subscriberCount: number;
  publishedAt: string;
  isSubscribed: boolean;
}

function NewsletterCard({ newsletter }: { newsletter: Newsletter }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }
    setIsSubmitting(true);
    try {
      const subscriptionRef = doc(db, 'users', user.uid, 'subscriptions', newsletter.id);
      if (newsletter.isSubscribed) {
        await deleteDoc(subscriptionRef);
        toast.success('Successfully unsubscribed!');
        newsletter.isSubscribed = false;
      } else {
        await setDoc(subscriptionRef, { subscribedAt: new Date() });
        toast.success('Successfully subscribed!');
        newsletter.isSubscribed = true;
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Subscription error:', error);
      toast.error('Failed to update subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <div className="aspect-video w-full">
        <img
          src={newsletter.image}
          alt={newsletter.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
            {newsletter.category}
          </span>
          {newsletter.isSubscribed && (
            <span className="inline-block px-3 py-1 bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
              Subscribed
            </span>
          )}
        </div>
        <h3 className="text-lg font-playfair font-bold text-slate-900 dark:text-slate-100 mb-2">{newsletter.title}</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">{newsletter.description}</p>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{newsletter.subscriberCount.toLocaleString()} subscribers</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(newsletter.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-300">by {newsletter.author}</span>
          <div className="flex space-x-2">
            <Link
              href={`/user-dashboard/newsletters/${newsletter.id}`}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
            >
              View Details
            </Link>
            <button
              onClick={handleSubscribe}
              disabled={isSubmitting || !user}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                newsletter.isSubscribed
                  ? 'bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900'
                  : 'bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? '...' : newsletter.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function NewslettersPage() {
  const { user, loading: authLoading } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewsletters = async () => {
      setIsLoading(true);
      try {
        const newslettersQuery = query(collection(db, 'newsletters'), where('status', '==', 'published'));
        const newslettersSnap = await getDocs(newslettersQuery);
        const newslettersData: Newsletter[] = newslettersSnap.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || 'Untitled',
          description: doc.data().description || '',
          image: doc.data().image || 'https://via.placeholder.com/600x400',
          category: doc.data().category || 'General',
          author: doc.data().author || 'Unknown',
          subscriberCount: doc.data().subscriberCount || 0,
          publishedAt: doc.data().publishedAt?.toDate().toISOString() || new Date().toISOString(),
          isSubscribed: false,
        }));

        if (user) {
          const subscriptionsQuery = query(collection(db, 'users', user.uid, 'subscriptions'));
          const subscriptionsSnap = await getDocs(subscriptionsQuery);
          const subscribedIds = subscriptionsSnap.docs.map(doc => doc.id);
          newslettersData.forEach(n => {
            n.isSubscribed = subscribedIds.includes(n.id);
          });
        }

        setNewsletters(newslettersData);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('Fetch newsletters error:', error);
        toast.error('Failed to load newsletters');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchNewsletters();
    }
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <style jsx>{`
        ::-webkit-scrollbar {
          display: none;
        }
        html {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-slate-900 dark:text-slate-100">Newsletters</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Browse and subscribe to newsletters</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-xl">
            {newsletters.length} Newsletter{newsletters.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Newsletters Grid */}
      {newsletters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsletters.map((newsletter) => (
            <NewsletterCard key={newsletter.id} newsletter={newsletter} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Lock className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-playfair font-medium text-slate-900 dark:text-slate-100 mb-2">No newsletters available</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">There are no published newsletters at the moment.</p>
          <Link
            href="/user-dashboard"
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}