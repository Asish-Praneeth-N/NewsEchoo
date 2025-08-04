'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role && user.emailVerified) {
      router.push(role === 'admin' ? '/admin' : '/user-dashboard');
    }
  }, [user, role, loading, router]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          role: 'user',
          createdAt: new Date(),
        });
        await sendEmailVerification(userCredential.user);
        setEmailSent(true);
        toast.success('Verification email sent. Please check your inbox (and spam folder).', {
          duration: 5000,
        });
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } catch (emailErr: unknown) {
        const error = emailErr instanceof Error ? emailErr : new Error('Unknown error');
        console.error('Email verification error:', error);
        setError(`Failed to send verification email: ${error.message}`);
        await auth.signOut();
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Sign-up error:', error);
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: 'user',
        createdAt: new Date(),
      });
      router.push('/user-dashboard');
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        Loading...
      </div>
    );
  }

  if (user && role && user.emailVerified) {
    return null;
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      >
        <h2 className="text-3xl font-playfair font-bold text-black dark:text-white mb-6 text-center">
          Sign Up for NewsEcho
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {emailSent ? (
          <div className="text-gray-600 dark:text-gray-300 mb-4">
            <p>
              A verification email has been sent to <span className="font-medium">{email}</span>. Please check your inbox to verify your email address before continuing. If you don&apos;t see the email, be sure to check your spam or junk folder.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4"
            >
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-black text-white dark:bg-gray-400 dark:text-white hover:bg-gray-800 dark:hover:bg-gray-500 rounded transition duration-200"
              >
                <span className="mr-2">&lt;</span> Go to Login
              </Link>
            </motion.div>
          </div>
        ) : (
          <>
            <form onSubmit={handleEmailSignUp} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full py-3 px-4 bg-black dark:bg-gray-400 text-white rounded-lg font-medium transition-all duration-300"
              >
                Sign Up
              </motion.button>
            </form>
            <div className="my-4 text-center text-gray-600 dark:text-gray-300">
              OR
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoogleSignUp}
              className="w-full py-3 px-4 bg-white text-black border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 rounded-lg font-medium transition-all duration-300"
            >
              Sign up with Google
            </motion.button>
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:underline">
                Log In
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </section>
  );
} 