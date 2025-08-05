'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (sectionId.startsWith('/')) {
      router.push(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (err: unknown) {
      console.error('Logout error:', err instanceof Error ? err.message : 'Unknown error');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-black/10 dark:border-white/10 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <Image
              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/v1/logo.png`}
              alt="Logo"
              width={32}
              height={32}
              priority
              className="rounded-lg"
            />
            <span className="font-playfair text-lg sm:text-xl font-bold text-black dark:text-white">
              NewsEcho
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {[
              { name: 'Home', id: 'hero' },
              { name: 'Newsletters', id: 'newsletters' },
              { name: 'How It Works', id: 'how-it-works' },
              { name: 'About', id: 'testimonials' },
              ...(user && role && user.emailVerified
                ? [
                    {
                      name: role === 'admin' ? 'Admin Dashboard' : 'User Dashboard',
                      id: role === 'admin' ? '/admin' : '/user-dashboard',
                    },
                  ]
                : []),
            ].map((item, index) => (
              <motion.a
                key={item.name}
                onClick={() => scrollToSection(item.id)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ y: -2 }}
                className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium cursor-pointer text-base"
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button
              className="md:hidden text-black dark:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <span className="text-black dark:text-white text-base">Loading...</span>
              ) : user && user.emailVerified ? (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-white/20 dark:bg-gray-800/20 px-4 py-2 rounded-lg text-black dark:text-white font-medium border border-black/10 dark:border-white/10 text-base"
                >
                  Logout
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/login')}
                    className="bg-white/20 dark:bg-gray-800/20 px-4 py-2 rounded-lg text-black dark:text-white font-medium border border-black/10 dark:border-white/10 text-base"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/signup')}
                    className="bg-black dark:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium text-base transition-all duration-300 shadow-lg"
                  >
                    Sign Up
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden absolute top-16 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-black/10 dark:border-white/10 flex flex-col items-center space-y-4 py-4"
            >
              {[
                { name: 'Home', id: 'hero' },
                { name: 'Newsletters', id: 'newsletters' },
                { name: 'How It Works', id: 'how-it-works' },
                { name: 'About', id: 'testimonials' },
                ...(user && role && user.emailVerified
                  ? [
                      {
                        name: role === 'admin' ? 'Admin Dashboard' : 'User Dashboard',
                        id: role === 'admin' ? '/admin' : '/user-dashboard',
                      },
                    ]
                  : []),
              ].map((item) => (
                <motion.a
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  whileHover={{ scale: 1.05 }}
                  className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300 font-medium text-base cursor-pointer"
                >
                  {item.name}
                </motion.a>
              ))}
              {loading ? (
                <span className="text-black dark:text-white text-base">Loading...</span>
              ) : user && user.emailVerified ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-white/20 dark:bg-gray-800/20 px-4 py-2 rounded-lg text-black dark:text-white font-medium border border-black/10 dark:border-white/10 text-base"
                >
                  Logout
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      router.push('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-white/20 dark:bg-gray-800/20 px-4 py-2 rounded-lg text-black dark:text-white font-medium border border-black/10 dark:border-white/10 text-base"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      router.push('/signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-black dark:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium text-base transition-all duration-300 shadow-lg"
                  >
                    Sign Up
                  </motion.button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}