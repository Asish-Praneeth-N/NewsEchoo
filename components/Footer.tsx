'use client';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="font-playfair text-xl font-bold text-black dark:text-white">
            NewsEcho
          </span>
          <p className="font-inter text-sm text-gray-600 dark:text-gray-300">
            © 2025 NewsEcho. All rights reserved. Made with ❤️ 
          </p>
        </div>
      </div>
    </footer>
  );
}