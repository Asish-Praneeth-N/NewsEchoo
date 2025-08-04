'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    console.log('AdminLayout: Auth state:', {
      loading,
      userId: user?.uid,
      email: user?.email,
      role,
      emailVerified: user?.emailVerified,
      path: window.location.pathname,
    });
    if (!loading) {
      if (!user) {
        console.log('AdminLayout: No user, redirecting to /login');
        toast.error('Please log in to access the admin panel.');
        router.push('/login');
      } else if (role !== 'admin') {
        console.log('AdminLayout: User is not admin, redirecting to /login');
        toast.error('Admin access required.');
        router.push('/login');
      } else if (!user.emailVerified) {
        console.log('AdminLayout: Email not verified, redirecting to /login');
        toast.error('Please verify your email to access the admin panel.');
        router.push('/login');
      } else {
        console.log('AdminLayout: User is admin, rendering dashboard');
      }
    }
  }, [user, role, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('AdminLayout: Signed out successfully');
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('AdminLayout: Sign out error:', error);
      toast.error(`Failed to sign out: ${error.message}`);
    }
  };

  if (loading) {
    console.log('AdminLayout: Loading auth state, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || role !== 'admin' || !user.emailVerified) {
    console.log('AdminLayout: Auth check failed, returning null');
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-black overflow-visible">
      <Sidebar isOpen={isSidebarOpen} onClose={() => {
        console.log('AdminLayout: Closing sidebar');
        setIsSidebarOpen(false);
      }} />
      <div className="flex-1 p-6 lg:p-8">
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => {
              console.log('AdminLayout: Opening sidebar');
              setIsSidebarOpen(true);
            }}
            className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg border-2 border-black dark:border-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}