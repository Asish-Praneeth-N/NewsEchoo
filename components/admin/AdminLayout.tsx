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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Changed to true for testing

  useEffect(() => {
    console.log('AdminLayout: loading=', loading, 'user=', user, 'role=', role);
    if (!loading && (!user || role !== 'admin' || !user.emailVerified)) {
      console.log('AdminLayout: Redirecting to /login');
      toast.error('You must be an admin to access this page.');
      router.push('/login');
    }
  }, [user, role, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err: any) {
      toast.error('Failed to sign out: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user || role !== 'admin' || !user.emailVerified) {
    console.log('AdminLayout: Not rendering due to auth check');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-black overflow-visible">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 p-6 lg:p-8">
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => {
              console.log('Toggling sidebar: ', !isSidebarOpen);
              setIsSidebarOpen(true);
            }}
            className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg border-2 border-black dark:border-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}