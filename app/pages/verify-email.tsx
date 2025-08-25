'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode, getAuth, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VerifyEmail() {
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = getAuth();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    const verify = async () => {
      const oobCode = searchParams.get('oobCode');
      if (!oobCode) {
        setError('Invalid or missing verification link. Please resend the verification email.');
        console.error('No oobCode found in URL:', window.location.href);
        return;
      }

      setIsVerifying(true);
      try {
        await applyActionCode(auth, oobCode);
        await auth.currentUser?.reload();
        setVerified(true);
        toast.success('Email verified successfully! Redirecting to login...', {
          duration: 5000,
        });
        setTimeout(() => router.push('/login'), 3000);
      } catch (err) {
        console.error('Verification error:', {
          message: (err as Error).message || 'Unknown error',
          code: (err as { code?: string }).code || 'No code',
          oobCode,
          stack: (err as Error).stack || 'No stack trace',
          details: JSON.stringify(err, null, 2),
        });
        const errorMap: Record<string, string> = {
          'auth/invalid-action-code': 'The verification link is invalid or expired.',
          'auth/expired-action-code': 'The verification link has expired.',
          'auth/user-not-found': 'User not found. Please sign up again.',
          'auth/invalid-api-key': 'Invalid Firebase API key. Please check your configuration.',
        };
        setError(errorMap[(err as { code: string }).code] || `Failed to verify email: ${(err as Error).message || 'Unknown error'}`);
      } finally {
        setIsVerifying(false);
      }
    };
    verify();
  }, [searchParams, router, auth]);

  const handleResendVerification = async () => {
    if (!email || !password) {
      setError('Please enter your email and password to resend the verification email.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsResending(true);
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
      console.error('Resend verification error:', {
        message: (err as Error).message || 'Unknown error',
        code: (err as { code?: string }).code || 'No code',
        email,
        stack: (err as Error).stack || 'No stack trace',
        details: JSON.stringify(err, null, 2),
      });
      const errorMap: Record<string, string> = {
        'auth/user-not-found': 'Invalid email or password.',
        'auth/wrong-password': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many requests. Please try again later.',
        'auth/invalid-api-key': 'Invalid Firebase API key. Please check your configuration.',
      };
      setError(errorMap[(err as { code: string }).code] || `Failed to resend verification email: ${(err as Error).message || 'Unknown error'}`);
    } finally {
      setIsResending(false);
      await auth.signOut();
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
          Email Verification
        </h2>
        {error && (
          <div className="text-red-500 mb-4">
            {error}
            {error.includes('resend') && (
              <div className="space-y-4 mt-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email input"
                />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Password input"
                />
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full bg-blue-500 text-white"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
            )}
            {error.includes('already verified') && (
              <p className="mt-2">
                <Link href="/login" className="text-blue-500 hover:underline">
                  Go to Login
                </Link>
              </p>
            )}
          </div>
        )}
        {verified && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your email has been verified. Redirecting to login...
          </p>
        )}
        {isVerifying && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">Verifying your email...</p>
        )}
        {!error && !verified && !isVerifying && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">Verifying your email...</p>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          className="w-full py-3 px-4 bg-black dark:bg-gray-400 text-white rounded-lg font-medium transition-all duration-300"
        >
          Go to Login
        </motion.button>
      </motion.div>
    </section>
  );
}