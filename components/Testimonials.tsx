
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Product Manager at TechCorp',
    content: 'NewsEcho has completely transformed how I stay informed. The quality of content is exceptional, and the curation saves me hours every week.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    role: 'Startup Founder',
    content: 'The business insights I get from NewsEcho are invaluable. It’s like having a personal research team delivering the most relevant information.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    content: 'I love how clean and organized everything is. The design inspiration newsletters have helped me discover so many amazing projects and techniques.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Software Engineer',
    content: 'The tech trends weekly has become essential reading. It keeps me ahead of the curve and helps me make better technology choices for my projects.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
            What Our Readers Say
          </h2>
          <p className="font-inter text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Don’t just take our word for it. Here’s what our community has to say about NewsEcho.
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 mx-auto max-w-4xl shadow-md"
          >
            <div className="text-center">
              <Quote className="w-10 sm:w-12 h-10 sm:h-12 text-black dark:text-gray-400 mx-auto mb-4 sm:mb-6 opacity-50" />
              <p className="font-inter text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6 sm:mb-8 italic">
                &quot;{testimonials[currentIndex].content}&quot;
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Image
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  width={64}
                  height={64}
                  className="w-12 sm:w-16 h-12 sm:h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
                <div>
                  <h4 className="font-bold text-base sm:text-lg text-black dark:text-white">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="font-inter text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center items-center mt-6 sm:mt-8 space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrevious}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 text-black dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
            >
              <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6" />
            </motion.button>
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-black dark:bg-gray-400 scale-125'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNext}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 text-black dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
            >
              <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
