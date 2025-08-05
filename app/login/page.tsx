'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { FirebaseError } from 'firebase/app';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role && user.emailVerified) {
      router.push(role === 'admin' ? '/admin' : '/user-dashboard');
    } else if (user && !user.emailVerified) {
      setError('Please verify your email before logging in. Check your inbox or spam folder, or resend the verification email.');
      auth.signOut();
    }
  }, [user, role, loading, router]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoggingIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await userCredential.user.reload();
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        setError('Please verify your email before logging in. Check your inbox or spam folder, or resend the verification email.');
        setIsLoggingIn(false);
        return;
      }
      toast.success('Logged in successfully!');
      setIsLoggingIn(false);
      router.push('/user-dashboard');
    } catch (err) {
      const error = err as FirebaseError;
      console.error('Login error:', error.message, { code: error.code, email });
      const errorMap: Record<string, string> = {
        'auth/user-not-found': 'Invalid email or password.',
        'auth/wrong-password': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many login attempts. Please try again later.',
        'auth/invalid-credential': 'Invalid credentials provided.',
      };
      setError(errorMap[error.code] || 'Failed to log in. Please try again.');
      setIsLoggingIn(false);
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
      const error = err as FirebaseError;
      console.error('Resend verification error:', error.message, { code: error.code, email });
      const errorMap: Record<string, string> = {
        'auth/user-not-found': 'Invalid email or password.',
        'auth/wrong-password': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many requests. Please try again later.',
      };
      setError(errorMap[error.code] || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
      await auth.signOut();
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Signed in with Google successfully!');
      setIsLoggingIn(false);
      router.push('/user-dashboard');
    } catch (err) {
      const error = err as FirebaseError;
      console.error('Google login error:', error.message, { code: error.code });
      setError('Failed to sign in with Google. Please try again.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-playfair">Login to NewsEcho</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 mb-4">
              {error}
              {error.includes('verify your email') && (
                <div className="mt-2">
                  <Button
                    onClick={handleResendVerification}
                    className="bg-blue-500 text-white"
                    disabled={isResending}
                  >
                    {isResending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Resend Verification Email'}
                  </Button>
                </div>
              )}
            </div>
          )}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email input"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password input"
            />
            <Button type="submit" className="w-full bg-black text-white dark:bg-gray-400" disabled={isLoggingIn}>
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Login'}
            </Button>
          </form>
          <div className="my-4 text-center text-gray-600 dark:text-gray-300">OR</div>
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black border border-gray-300 dark:bg-gray-800 dark:text-white"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Sign in with Google'}
          </Button>
          <p className="mt-4 text-center text-sm">
            Don&apos;t have an account? <Link href="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
          </p>
          <p className="mt-2 text-center text-sm">
            Forgot password? <Link href="/reset-password" className="text-blue-500 hover:underline">Reset Password</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}