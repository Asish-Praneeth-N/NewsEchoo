// app/verification-sent/page.tsx (or wherever your pages are structured in Next.js)

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VerificationSent() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center"
      >
        <h2 className="text-2xl font-playfair font-bold text-black dark:text-white mb-4">
          Verification Email Sent
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          A verification email has been sent to your email address. Please confirm your email before logging in. Ensure to check your spam folder as well.
        </p>
        <Link href="/login">
          <button className="w-full bg-black dark:bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors">
            Go to Login
          </button>
        </Link>
      </motion.div>
    </section>
  );
}