'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-6 sm:p-8">
      <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}