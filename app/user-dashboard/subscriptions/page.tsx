'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, doc, getDoc, deleteDoc, addDoc } from 'firebase/firestore';

interface Newsletter {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  author: string;
  subscriberCount: number;
  publishedAt: string;
  content: string;
  subscribedAt?: Date;
}

function SubscriptionCard({ newsletter, onReply, canUnsubscribe }: { newsletter: Newsletter; onReply: () => void; canUnsubscribe: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUnsubscribe = async () => {
    if (!canUnsubscribe) {
      toast.error('You cannot unsubscribe for 2 days after subscribing.');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to unsubscribe from "${newsletter.title}"?`);
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser!.uid, 'subscriptions', newsletter.id));
      toast.success('Successfully unsubscribed!');
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Unsubscribe error:', error);
      toast.error('Failed to unsubscribe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-md transition-shadow duration-200">
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
          <span className="inline-block px-3 py-1 bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
            Subscribed
          </span>
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
            <button
              onClick={onReply}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200 flex items-center space-x-1"
            >
              <MessageSquare className="w-4 h-4" />
              <span>View & Reply</span>
            </button>
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading || !canUnsubscribe}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : 'Unsubscribe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const subscriptionsQuery = query(collection(db, 'users', user.uid, 'subscriptions'));
        const subscriptionsSnap = await getDocs(subscriptionsQuery);
        const subscriptionPromises = subscriptionsSnap.docs.map(async (subDoc) => {
          const newsletterDoc = await getDoc(doc(db, 'newsletters', subDoc.id));
          if (newsletterDoc.exists()) {
            const data = newsletterDoc.data();
            return {
              id: newsletterDoc.id,
              title: data.title || 'Untitled',
              description: data.description || '',
              image: data.image || 'https://via.placeholder.com/600x400',
              category: data.category || 'General',
              author: data.author || 'Unknown',
              subscriberCount: data.subscriberCount || 0,
              publishedAt: data.publishedAt?.toDate().toISOString() || new Date().toISOString(),
              content: data.content || 'No content available.',
              subscribedAt: subDoc.data().subscribedAt?.toDate() || new Date(),
            } as Newsletter;
          }
          return null;
        });
        const newsletters = (await Promise.all(subscriptionPromises)).filter((n): n is Newsletter => n !== null);
        setSubscriptions(newsletters);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('Fetch subscriptions error:', error);
        toast.error('Failed to load subscriptions');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchSubscriptions();
    }
  }, [user, authLoading]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedNewsletter || !replyMessage.trim() || replyMessage.length > 1000) {
      toast.error('Please provide a valid reply (1-1000 characters)');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'replies'), {
        newsletterId: selectedNewsletter.id,
        newsletterTitle: selectedNewsletter.title,
        message: replyMessage,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Anonymous',
        userEmail: user.email || 'Unknown',
        timestamp: new Date(),
        read: false,
      });
      setReplyMessage('');
      setSelectedNewsletter(null);
      toast.success('Reply sent to admin successfully!');
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Reply submission error:', error);
      toast.error('Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <p className="text-slate-600 dark:text-slate-300">Please log in to view your subscriptions.</p>
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
          <h1 className="text-3xl font-playfair font-bold text-slate-900 dark:text-slate-100">My Subscriptions</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Manage your newsletter subscriptions</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="px-4 py-2 bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-sm font-medium rounded-xl">
            {subscriptions.length} Active Subscription{subscriptions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {subscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((newsletter) => {
            const canUnsubscribe = newsletter.subscribedAt
              ? (Date.now() - newsletter.subscribedAt.getTime()) / (1000 * 60 * 60 * 24) > 2
              : true;
            return (
              <SubscriptionCard
                key={newsletter.id}
                newsletter={newsletter}
                onReply={() => setSelectedNewsletter(newsletter)}
                canUnsubscribe={canUnsubscribe}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-playfair font-medium text-slate-900 dark:text-slate-100 mb-2">No subscriptions yet</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">You haven&apos;t subscribed to any newsletters yet. Browse our collection to find interesting content.</p>
          <Link
            href="/user-dashboard/newsletters"
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
          >
            Browse Newsletters
          </Link>
        </div>
      )}

      {/* Dialog for Newsletter Content */}
      {selectedNewsletter && (
        <dialog open className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 dark:text-slate-100">{selectedNewsletter.title}</h2>
              <button
                onClick={() => setSelectedNewsletter(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
            <img
              src={selectedNewsletter.image}
              alt={selectedNewsletter.title}
              className="w-full h-40 object-cover rounded-xl mb-4"
            />
            <p className="text-slate-600 dark:text-slate-300 mb-4">{selectedNewsletter.content}</p>
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div>
                <label htmlFor="reply" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Your Reply (to Admin)
                </label>
                <textarea
                  id="reply"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  placeholder="Share your feedback or questions..."
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !replyMessage.trim() || replyMessage.length > 1000}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}