'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="mx-auto mb-4">{icon}</div>
      <h2 className="text-lg sm:text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">{title}</h2>
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4 sm:mb-6">{description}</p>
      {action}
    </div>
  );
}