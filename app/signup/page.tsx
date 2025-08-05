'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import type { FirebaseError } from 'firebase/app';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role && user.emailVerified) {
      router.push(role === 'admin' ? '/admin' : '/user-dashboard');
    }
  }, [user, role, loading, router]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSigningUp(true);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      setIsSigningUp(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSigningUp(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsSigningUp(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await sendEmailVerification(userCredential.user, {
          url: `${window.location.origin}/pages/verify-email`,
        });
        toast.success('Verification email sent. Please check your inbox and spam folder.', {
          duration: 5000,
        });
        setEmailSent(true);
      } catch (emailErr) {
        const error = emailErr as FirebaseError;
        console.error('Email verification error:', error.message, {
          code: error.code,
          userId: userCredential.user.uid,
          email,
        });
        setError('Failed to send verification email. Please try again.');
      }
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          role: 'user',
          createdAt: new Date(),
        });
      } catch (dbErr) {
        console.error('Firestore write error:', dbErr);
        setError('Account created, but failed to save user data. Please contact support.');
      }
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      await auth.signOut();
    } catch (err) {
      const error = err as FirebaseError;
      console.error('Sign-up error:', error.message, { code: error.code, email });
      const errorMap: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered. Try logging in or resetting your password.',
        'auth/weak-password': 'Password is too weak. Please use a stronger password.',
        'auth/invalid-email': 'Invalid email format.',
        'auth/too-many-requests': 'Too many sign-up attempts. Please try again later.',
      };
      setError(errorMap[error.code] || 'Failed to sign up. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      setError('Please enter your email and password to resend the verification email.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsSendingVerification(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user.emailVerified) {
        setError('This email is already verified. Please log in.');
        await auth.signOut();
        return;
      }
      await sendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/pages/verify-email`,
      });
      toast.success('Verification email resent. Please check your inbox and spam folder.', {
        duration: 5000,
      });
    } catch (err) {
      const error = err as FirebaseError;
      console.error('Resend verification error:', error.message, { code: error.code, email });
      const errorMap: Record<string, string> = {
        'auth/user-not-found': 'Invalid email or password.',
        'auth/wrong-password': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many requests. Please try again later.',
      };
      setError(errorMap[error.code] || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsSendingVerification(false);
      await auth.signOut();
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsSigningUp(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: 'user',
        createdAt: new Date(),
      }, { merge: true });
      toast.success('Signed up with Google successfully!');
      router.push('/user-dashboard');
    } catch (err) {
      const error = err as FirebaseError;
      console.error('Google sign-up error:', error.message, { code: error.code });
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setIsSigningUp(false);
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
        {error && (
          <p className="text-red-500 mb-4">
            {error}
            {error.includes('already registered') && (
              <span>
                {' '}
                <Link href="/login" className="text-blue-500 hover:underline">
                  Log in
                </Link>{' '}
                or{' '}
                <Link href="/reset-password" className="text-blue-500 hover:underline">
                  reset your password
                </Link>.
              </span>
            )}
          </p>
        )}
        {emailSent ? (
          <div className="text-gray-600 dark:text-gray-300 mb-4">
            <p>
              A verification email has been sent to <span className="font-medium">{email}</span>. Please check your inbox and spam folder to verify your email address before logging in.
            </p>
            <div className="space-y-4 mt-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-gray-400"
                aria-label="Email input"
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-gray-400"
                aria-label="Password input"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResendVerification}
                disabled={isSendingVerification}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingVerification ? 'Sending...' : 'Resend Verification Email'}
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-center"
              >
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 bg-black text-white dark:bg-gray-400 dark:text-white hover:bg-gray-800 dark:hover:bg-gray-500 rounded transition duration-200"
                >
                  <span className="mr-2">&lt;</span> Go to Login
                </Link>
              </motion.div>
            </div>
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
                  aria-label="Email input"
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
                  aria-label="Password input"
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
                  aria-label="Confirm password input"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full py-3 px-4 bg-black dark:bg-gray-400 text-white rounded-lg font-medium transition-all duration-300"
                disabled={isSigningUp}
              >
                {isSigningUp ? 'Signing Up...' : 'Sign Up'}
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
              disabled={isSigningUp}
            >
              {isSigningUp ? 'Signing Up...' : 'Sign up with Google'}
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