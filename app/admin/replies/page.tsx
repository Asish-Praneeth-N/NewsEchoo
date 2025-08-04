'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Calendar, MessageSquare, Send } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, updateDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Reply {
  id: string;
  newsletterId: string;
  newsletterTitle: string;
  userName: string;
  userEmail: string;
  message: string;
  timestamp: string;
  read: boolean;
  senderId?: string;
}

export default function RepliesPage() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedNewsletter, setSelectedNewsletter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [replyForm, setReplyForm] = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = useState<{ [key: string]: boolean }>({});
  const { user, role, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchReplies = async () => {
      if (!user || role !== 'admin') return;
      setLoading(true);
      try {
        const repliesQuery = query(collection(db, 'replies'));
        const querySnapshot = await getDocs(repliesQuery);
        const repliesData: Reply[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            newsletterId: data.newsletterId || 'Unknown',
            newsletterTitle: data.newsletterTitle || 'Unknown',
            userName: data.senderName || 'Unknown',
            userEmail: data.userEmail || 'Unknown',
            message: data.message || '',
            timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
            read: data.read ?? false,
            senderId: data.senderId || 'Unknown',
          };
        });
        setReplies(repliesData);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('Fetch replies error:', error);
        toast.error('Failed to load replies');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && user && role === 'admin') {
      fetchReplies();
    }
  }, [authLoading, user, role]);

  const handleMarkAsRead = async (replyId: string) => {
    try {
      const replyRef = doc(db, 'replies', replyId);
      await updateDoc(replyRef, { read: true });
      setReplies(replies.map(reply => (reply.id === replyId ? { ...reply, read: true } : reply)));
      toast.success('Reply marked as read');
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Mark as read error:', error);
      toast.error('Failed to mark reply as read');
    }
  };

  const handleSendReply = async (originalReplyId: string) => {
    if (!user) {
      toast.error('You must be logged in to send a reply');
      return;
    }
    const message = replyForm[originalReplyId]?.trim();
    if (!message) {
      toast.error('Reply message cannot be empty');
      return;
    }

    const originalReply = replies.find(reply => reply.id === originalReplyId);
    if (!originalReply) return;

    try {
      await addDoc(collection(db, 'replies'), {
        newsletterId: originalReply.newsletterId,
        newsletterTitle: originalReply.newsletterTitle,
        userName: user.displayName || 'Admin',
        userEmail: user.email || 'admin@newsecho.com',
        message,
        timestamp: Timestamp.fromDate(new Date()),
        read: false,
        senderId: user.uid,
      });
      setReplyForm({ ...replyForm, [originalReplyId]: '' });
      setShowReplyForm({ ...showReplyForm, [originalReplyId]: false });
      toast.success('Reply sent successfully');
      // Refresh replies
      const repliesQuery = query(collection(db, 'replies'));
      const querySnapshot = await getDocs(repliesQuery);
      const repliesData: Reply[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          newsletterId: data.newsletterId || 'Unknown',
          newsletterTitle: data.newsletterTitle || 'Unknown',
          userName: data.senderName || 'Unknown',
          userEmail: data.userEmail || 'Unknown',
          message: data.message || '',
          timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
          read: data.read ?? false,
          senderId: data.senderId || 'Unknown',
        };
      });
      setReplies(repliesData);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Send reply error:', error);
      toast.error('Failed to send reply');
    }
  };

  const filteredReplies = replies.filter(reply => {
    const matchesSearch =
      reply.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reply.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reply.newsletterTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' || (filter === 'unread' && !reply.read) || (filter === 'read' && reply.read);
    const matchesNewsletter = selectedNewsletter === 'all' || reply.newsletterId === selectedNewsletter;
    return matchesSearch && matchesFilter && matchesNewsletter;
  });

  const unreadCount = replies.filter(reply => !reply.read).length;
  const newsletters = Array.from(
    new Set(replies.map(r => ({ id: r.newsletterId, title: r.newsletterTitle }))),
    (item, index) => ({ ...item, index })
  ).sort((a, b) => a.index - b.index);

  const repliesThisWeek = replies.filter(reply => {
    const replyDate = new Date(reply.timestamp);
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return replyDate >= oneWeekAgo && replyDate <= today;
  }).length;

  if (loading || authLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
          <div className="w-8 h-8 border-2 border-sky-600 dark:border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!user || role !== 'admin') {
    return null; // AdminLayout handles redirect
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
            <h1 className="text-3xl font-playfair font-bold text-slate-900 dark:text-slate-100">
              Replies
              {unreadCount > 0 && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Manage and respond to subscriber feedback.</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Replies</p>
                <p className="text-3xl font-playfair font-bold text-slate-900 dark:text-slate-100">{replies.length}</p>
              </div>
              <div className="p-3 bg-sky-50 dark:bg-sky-900/50 rounded-xl">
                <MessageSquare className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Unread</p>
                <p className="text-3xl font-playfair font-bold text-slate-900 dark:text-slate-100">{unreadCount}</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/50 rounded-xl">
                <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">This Week</p>
                <p className="text-3xl font-playfair font-bold text-slate-900 dark:text-slate-100">{repliesThisWeek}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/50 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search replies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200/50 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedNewsletter}
                onChange={(e) => setSelectedNewsletter(e.target.value)}
                className="px-4 py-3 border border-gray-200/50 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Newsletters</option>
                {newsletters.map(newsletter => (
                  <option key={newsletter.id} value={newsletter.id}>
                    {newsletter.title.length > 30 ? newsletter.title.substring(0, 30) + '...' : newsletter.title}
                  </option>
                ))}
              </select>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'read' | 'unread')}
                className="px-4 py-3 border border-gray-200/50 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Replies</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Replies List */}
        <div className="space-y-4">
          {filteredReplies.map((reply, index) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md ${
                reply.read ? 'border-gray-200/50 dark:border-gray-700/50' : 'border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/30'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {reply.userName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{reply.userName}</h3>
                        {!reply.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{reply.userEmail}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Re: {reply.newsletterTitle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(reply.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(reply.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{reply.message}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowReplyForm({ ...showReplyForm, [reply.id]: !showReplyForm[reply.id] })}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      {showReplyForm[reply.id] ? 'Cancel' : 'Reply'}
                    </button>
                  </div>
                  {!reply.read && (
                    <button
                      onClick={() => handleMarkAsRead(reply.id)}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
                {showReplyForm[reply.id] && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    <textarea
                      value={replyForm[reply.id] || ''}
                      onChange={(e) => setReplyForm({ ...replyForm, [reply.id]: e.target.value })}
                      placeholder="Type your reply here..."
                      className="w-full p-3 border border-gray-200/50 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100"
                      rows={4}
                    />
                    <button
                      onClick={() => handleSendReply(reply.id)}
                      className="mt-2 flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-sm hover:shadow-md"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReplies.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No replies found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria.</p>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}