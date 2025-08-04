'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role && user.emailVerified) {
      router.push(role === 'admin' ? '/admin' : '/user-dashboard');
    } else if (user && !user.emailVerified) {
      setError('Please verify your email before logging in.');
      auth.signOut();
    }
  }, [user, role, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-black dark:text-gray-400" /></div>;
  if (user && role && user.emailVerified) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await userCredential.user.reload();
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        setError('Please verify your email before logging in.');
        setIsLoggingIn(false);
        return;
      }
      setIsLoggingIn(false);
      router.push('/user-dashboard');
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Login error:', error);
      setError(error.message);
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsLoggingIn(false);
      router.push('/user-dashboard');
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Google login error:', error);
      setError(error.message);
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
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
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
            Don&apos;t have an account? <a href="/signup" className="text-blue-500 hover:underline">Sign Up</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}