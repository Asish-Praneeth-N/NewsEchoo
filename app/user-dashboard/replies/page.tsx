'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RepliesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Replies - Coming Soon</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6">This feature is under development and will be available soon!</p>
        <Link
          href="/user-dashboard"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}