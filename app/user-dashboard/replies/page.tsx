'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Calendar, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

interface Reply {
  id: string;
  newsletterId: string;
  newsletterTitle: string;
  message: string;
  senderId: string;
  senderName: string;
  userEmail: string;
  createdAt: Date;
  isPrivate: boolean;
  read: boolean;
}

function ReplyCard({ reply }: { reply: Reply }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-600 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-500 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white font-playfair">{reply.newsletterTitle}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-gray-300">
                <Calendar className="w-3 h-3" />
                <span>{new Date(reply.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              {reply.isPrivate && (
                <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <Link
          href={`/newsletter/${reply.newsletterId}`}
          className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-sm font-medium"
        >
          View Newsletter
        </Link>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
        <p className="text-slate-700 dark:text-gray-200 leading-relaxed">{reply.message}</p>
      </div>
      
      {reply.isPrivate && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded-xl border border-green-200 dark:border-green-700">
          <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Private Reply</span>
          </div>
          <p className="text-green-600 dark:text-green-400 text-xs mt-1">
            This reply is private and only visible to you and the newsletter author.
          </p>
        </div>
      )}
    </div>
  );
}

export default function RepliesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('RepliesPage: Auth state:', {
      userId: user?.uid,
      email: user?.email,
      authLoading,
      path: window.location.pathname,
    });

    const fetchReplies = async () => {
      if (!user) {
        console.log('RepliesPage: No user, redirecting to /login');
        toast.error('Please log in to view your replies.');
        router.push('/login');
        return;
      }

      setIsLoading(true);
      try {
        console.log('RepliesPage: Fetching replies for user:', user.uid);
        const repliesQuery = query(
          collection(db, 'replies'),
          where('senderId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const repliesSnapshot = await getDocs(repliesQuery);
        const repliesData: Reply[] = repliesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            newsletterId: data.newsletterId || '',
            newsletterTitle: data.newsletterTitle || 'Untitled',
            message: data.message || '',
            senderId: data.senderId || '',
            senderName: data.senderName || '',
            userEmail: data.userEmail || '',
            createdAt: data.timestamp?.toDate() || new Date(),
            isPrivate: data.isPrivate || true,
            read: data.read || false,
          };
        });
        setReplies(repliesData);
        console.log('RepliesPage: Fetched replies:', repliesData.length);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('RepliesPage: Error fetching replies:', error);
        toast.error('Failed to load replies. Please try again later.');
        setReplies([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchReplies();
    } else if (!authLoading && !user) {
      console.log('RepliesPage: No user, redirecting to /login');
      toast.error('Please log in to view your replies.');
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    console.log('RepliesPage: Rendering loading spinner');
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('RepliesPage: No user, returning null (redirect handled)');
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto p-6 lg:p-8 bg-white dark:bg-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-playfair">My Replies</h1>
          <p className="text-slate-600 dark:text-gray-300 mt-1">Your private replies to newsletter authors</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium rounded-xl">
            {replies.length} Repl{replies.length !== 1 ? 'ies' : 'y'} Sent
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <Lock className="w-6 h-6 text-blue-500 dark:text-blue-300 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1 font-playfair">Private & Secure</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              All your replies are private and only visible to you and the newsletter authors. 
              They help create meaningful connections and provide valuable feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Replies List */}
      {replies.length > 0 ? (
        <div className="space-y-4">
          {replies.map((reply) => (
            <ReplyCard key={reply.id} reply={reply} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8 text-slate-400 dark:text-gray-500" />}
          title="No replies yet"
          description="You haven't sent any replies yet. Subscribe to newsletters and start engaging with authors."
          action={
            <Link
              href="/user-dashboard/subscriptions"
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors duration-200"
            >
              View Subscriptions
            </Link>
          }
        />
      )}
    </div>
  );
}