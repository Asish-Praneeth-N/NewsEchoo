'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeDialog();
    }
  };

  return (
    <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 min-h-[80vh] flex items-center">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white leading-tight"
            >
              Stay Ahead with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700 dark:from-gray-400 dark:to-gray-600">
                Insightful
              </span>{' '}
              Newsletters
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-inter text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg"
            >
              Curated content delivered straight to your inbox. Join thousands of readers 
              who trust NewsEcho for quality insights and meaningful updates.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/signup')}
                className="group bg-black dark:bg-gray-400 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium text-base sm:text-lg transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={openDialog}
                className="group bg-white/20 dark:bg-gray-800/20 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium text-black dark:text-white border border-black/10 dark:border-white/10 transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Play className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>Preview Newsletter</span>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex items-center space-x-4 sm:space-x-6 pt-4"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center"
                  >
                    <span className="text-xs sm:text-sm font-medium text-black dark:text-white">
                      {String.fromCharCode(64 + i)}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-medium text-black dark:text-white text-sm sm:text-base">10,000+ readers</p>
                <p className="font-inter text-xs sm:text-sm text-gray-500 dark:text-gray-400">Trust NewsEcho daily</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-black dark:bg-gray-400 rounded-full"></div>
                    <div>
                      <h3 className="font-bold text-black dark:text-white text-base sm:text-lg">Weekly Insights</h3>
                      <p className="font-inter text-xs sm:text-sm text-gray-500 dark:text-gray-400">NewsEcho Newsletter</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <img
                      src="https://imgs.search.brave.com/ZeUUmAwMIy2S7LD5qtU2k0nP5El1jF4YbrSX1Vab-x4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAxLzMyLzQwLzAz/LzM2MF9GXzEzMjQw/MDMxOV9wcEE2SXpw/THJmVHlJb3FVM1U4/dkJlQU9oalB5Q1Ux/cy5qcGc"
                      alt="Tech innovation"
                      className="h-24 sm:h-32 w-full object-cover rounded-lg"
                    />
                    <h4 className="font-bold text-black dark:text-white text-base sm:text-lg">The Future of Digital Communication</h4>
                    <p className="font-inter text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                      Discover how emerging technologies are reshaping the way we connect, 
                      communicate, and collaborate in our digital world...
                    </p>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">5 min read</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => router.push('/login')}
                        className="text-black dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-12 sm:w-16 h-12 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center backdrop-blur-sm z-20"
            >
              <span className="text-black dark:text-white font-bold text-sm sm:text-base">📧</span>
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 w-10 sm:w-12 h-10 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center backdrop-blur-sm z-20"
            >
              <span className="text-black dark:text-white font-bold text-sm">✨</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 dark:bg-gray-900/50 flex items-center justify-center z-50"
            onClick={closeDialog}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-dialog-title"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-md sm:max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto scrollbar-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 id="newsletter-dialog-title" className="font-playfair text-xl sm:text-2xl font-bold text-black dark:text-white">
                  Tech Trends Weekly
                </h2>
                <button
                  onClick={closeDialog}
                  className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Close dialog"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <img
                  src="https://imgs.search.brave.com/6bHBYV0OgOBrjZByg_GOvrdTM7WKkwJ9bsddmQaxbEs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL00v/TVY1Qk1qVTBOREU0/TkdJdFl6WTJaQzAw/WkRNMUxXRTRPVFF0/WkRGaFpqWmlNemxp/TUdVeVhrRXlYa0Zx/Y0djQC5qcGc"
                  alt="Tech trends"
                  className="w-full h-40 sm:h-48 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-bold text-lg sm:text-xl text-black dark:text-white">AI Revolution in 2025</h3>
                  <p className="font-inter text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed mt-2">
                    Explore how artificial intelligence is transforming industries, from healthcare to finance. 
                    This week, we dive into the latest advancements in generative AI and their impact on 
                    everyday life. Stay informed with cutting-edge insights delivered to your inbox.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-base sm:text-lg text-black dark:text-white">Key Highlights</h4>
                  <ul className="font-inter text-gray-600 dark:text-gray-300 text-sm list-disc pl-5">
                    <li>AI-powered diagnostics in healthcare</li>
                    <li>Automated trading systems in finance</li>
                    <li>Ethical considerations for AI deployment</li>
                  </ul>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/signup')}
                  className="bg-black dark:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium w-full text-base sm:text-lg"
                >
                  Subscribe to Read More
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}