'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { FirebaseError } from 'firebase/app';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsSending(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
      });
      setEmailSent(true);
      toast.success('Password reset email sent. Please check your inbox and spam folder.', {
        duration: 5000,
      });
      setEmail('');
    } catch (err: any) {
      console.error('Password reset error:', {
        message: err.message || 'Unknown error',
        code: err.code || 'No code',
        email,
        stack: err.stack || 'No stack trace',
        details: JSON.stringify(err, null, 2),
      });
      const errorMap: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/invalid-email': 'Invalid email format.',
        'auth/too-many-requests': 'Too many requests. Please try again later.',
        'auth/invalid-api-key': 'Invalid Firebase API key. Please check your configuration.',
      };
      setError(errorMap[err.code] || `Failed to send password reset email: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      >
        <h2 className="text-3xl font-playfair font-bold text-black dark:text-white mb-6 text-center">
          Reset Password
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {emailSent ? (
          <div className="text-gray-600 dark:text-gray-300 mb-4">
            <p>
              A password reset email has been sent to <span className="font-medium">{email}</span>. Please check your inbox and spam folder to reset your password.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="mt-4 w-full py-3 px-4 bg-black dark:bg-gray-400 text-white rounded-lg font-medium transition-all duration-300"
            >
              Go to Login
            </motion.button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email input"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white dark:bg-gray-400"
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          Back to{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </section>
  );
}