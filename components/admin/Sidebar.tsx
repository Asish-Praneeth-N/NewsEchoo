'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  PenTool, 
  FileText, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  X,
  Mail
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Create Newsletter', href: '/admin/create', icon: PenTool },
  { name: 'Manage Newsletters', href: '/admin/newsletters', icon: FileText },
  { name: 'User List', href: '/admin/users', icon: Users },
  { name: 'Replies', href: '/admin/replies', icon: MessageSquare, badge: 12 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [signOutError, setSignOutError] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setSignOutError(`Failed to sign out: ${error.message}`);
    }
  };

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed lg:sticky top-0 left-0 min-h-screen w-72 flex-col bg-white dark:bg-black shadow-xl lg:shadow-lg z-50 border-2 border-black dark:border-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-black dark:bg-white rounded-xl">
            <Mail className="w-6 h-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-xl font-playfair font-semibold text-black dark:text-white">NewsEcho</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white border-l-4 border-black dark:border-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  isActive ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white'
                }`}
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-600">
        {signOutError && <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">{signOutError}</p>}
        <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-black dark:text-white">{user?.email || 'Admin User'}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">{user?.email || 'admin@newsecho.com'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-4 py-3 mt-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign out
        </button>
      </div>
    </motion.div>
  );
}