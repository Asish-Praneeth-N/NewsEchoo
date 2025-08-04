'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode, getAuth } from 'firebase/auth';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link'; 

export default function VerifyEmail() {
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const verify = async () => {
      const oobCode = searchParams.get('oobCode');
      if (!oobCode) {
        setError('Invalid or missing verification code.');
        return;
      }

      try {
        await applyActionCode(auth, oobCode);
        await auth.currentUser?.reload();
        setVerified(true);
        toast.success('Email verified successfully! You can now log in.');
        setTimeout(() => router.push('/login'), 3000);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('Verification error:', error);
        setError(`Failed to verify email: ${error.message}`);
      }
    };
    verify();
  }, [searchParams, router, auth]);

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
        {error ? (
          <p className="text-red-500 mb-4">{error}</p>
        ) : verified ? (
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your email has been verified. Redirecting to login...
          </p>
        ) : (
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