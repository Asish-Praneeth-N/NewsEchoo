'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Filter, Calendar, MessageSquare, Send } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, updateDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchReplies = async () => {
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
            userName: data.userName || 'Unknown',
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
    if (!authLoading) {
      fetchReplies();
    }
  }, [authLoading]);

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
          userName: data.userName || 'Unknown',
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-slate-600">Please log in to view replies.</p>
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
            <h1 className="text-3xl font-playfair font-bold text-slate-900">
              Replies
              {unreadCount > 0 && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-800">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="mt-2 text-slate-600">Manage and respond to subscriber feedback.</p>
          </div>
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
                <p className="text-sm font-medium text-slate-500">Total Replies</p>
                <p className="text-3xl font-bold text-slate-900">{replies.length}</p>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl">
                <MessageSquare className="w-6 h-6 text-sky-600" />
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
                <p className="text-sm font-medium text-slate-500">Unread</p>
                <p className="text-3xl font-bold text-slate-900">{unreadCount}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <MessageSquare className="w-6 h-6 text-amber-600" />
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
                <p className="text-sm font-medium text-slate-500">This Week</p>
                <p className="text-3xl font-bold text-slate-900">{repliesThisWeek}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
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
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search replies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedNewsletter}
                onChange={(e) => setSelectedNewsletter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
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
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
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
              className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md ${
                reply.read ? 'border-slate-200' : 'border-sky-200 bg-sky-50/30'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {reply.userName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{reply.userName}</h3>
                        {!reply.read && (
                          <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{reply.userEmail}</p>
                      <p className="text-sm text-sky-600 font-medium">
                        Re: {reply.newsletterTitle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">
                      {new Date(reply.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(reply.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-700 leading-relaxed">{reply.message}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowReplyForm({ ...showReplyForm, [reply.id]: !showReplyForm[reply.id] })}
                      className="text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
                    >
                      {showReplyForm[reply.id] ? 'Cancel' : 'Reply'}
                    </button>
                  </div>
                  {!reply.read && (
                    <button
                      onClick={() => handleMarkAsRead(reply.id)}
                      className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
                {showReplyForm[reply.id] && (
                  <div className="mt-4 p-4 bg-slate-100 rounded-xl">
                    <textarea
                      value={replyForm[reply.id] || ''}
                      onChange={(e) => setReplyForm({ ...replyForm, [reply.id]: e.target.value })}
                      placeholder="Type your reply here..."
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      rows={4}
                    />
                    <button
                      onClick={() => handleSendReply(reply.id)}
                      className="mt-2 flex items-center px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors shadow-sm hover:shadow-md"
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
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No replies found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}