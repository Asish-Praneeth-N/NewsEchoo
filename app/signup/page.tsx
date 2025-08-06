'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { FirebaseError } from 'firebase/app';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
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

    // Client-side validation
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
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Send verification email
      await sendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/pages/verify-email`,
      });

      // Save user data to Firestore
      await setDoc(
        doc(db, 'users', userCredential.user.uid),
        {
          email,
          role: 'user',
          createdAt: Timestamp.fromDate(new Date()),
        },
        { merge: true }
      );

      // Show success toast
      toast.success('Verification email sent. Please check your inbox and spam folder.', {
        duration: 5000,
      });

      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Navigate to login after 3 seconds
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      // Log raw error for debugging
      console.error('Sign-up error:', {
        message: err.message || 'Unknown error',
        code: err.code || 'No code',
        email,
        stack: err.stack || 'No stack trace',
      });

      // Handle Firebase-specific errors
      const errorMap: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered. Try logging in or resetting your password.',
        'auth/weak-password': 'Password is too weak. Please use a stronger password.',
        'auth/invalid-email': 'Invalid email format.',
        'auth/too-many-requests': 'Too many sign-up attempts. Please try again later.',
        'auth/operation-not-allowed': 'Email/password sign-up is disabled. Please contact support.',
        'firestore/permission-denied': 'Failed to save user data due to permission issues. Please contact support.',
      };

      const errorMessage = errorMap[err.code] || 'Failed to sign up. Please try again.';
      setError(errorMessage);

      // Sign out if user was created but subsequent steps failed
      if (err.code !== 'auth/email-already-in-use') {
        await auth.signOut();
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsSigningUp(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await setDoc(
        doc(db, 'users', userCredential.user.uid),
        {
          email: userCredential.user.email,
          role: 'user',
          createdAt: Timestamp.fromDate(new Date()),
        },
        { merge: true }
      );
      toast.success('Signed up with Google successfully!');
      router.push('/user-dashboard');
    } catch (err: any) {
      console.error('Google sign-up error:', {
        message: err.message || 'Unknown error',
        code: err.code || 'No code',
        stack: err.stack || 'No stack trace',
      });
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
        <form onSubmit={handleEmailSignUp} className="space-y-6">
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
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password input"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-label="Confirm password input"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-black dark:bg-gray-400 text-white"
            disabled={isSigningUp}
          >
            {isSigningUp ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>
        <div className="my-4 text-center text-gray-600 dark:text-gray-300">OR</div>
        <Button
          onClick={handleGoogleSignUp}
          className="w-full bg-white text-black border border-gray-300 dark:bg-gray-800 dark:text-white"
          disabled={isSigningUp}
        >
          {isSigningUp ? 'Signing Up...' : 'Sign up with Google'}
        </Button>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </section>
  );
}