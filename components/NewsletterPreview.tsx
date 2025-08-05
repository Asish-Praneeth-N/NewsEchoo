  
'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const newsletters = [
  {
    id: 1,
    title: 'Tech Trends Weekly',
    description: 'Latest developments in AI, machine learning, and emerging technologies that are shaping our future.',
    image: 'https://imgs.search.brave.com/F5sky87NC4zpwt-sfH9iPQrVXIrexJMSR7aqMHbF3LU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9iZXJu/YXJkbWFyci5jb20v/aW1nL1RoZXNlJTIw/MjUlMjBUZWNobm9s/b2d5JTIwVHJlbmRz/JTIwV2lsbCUyMERl/ZmluZSUyMFRoZSUy/ME5leHQlMjBEZWNh/ZGUucG5n',
    date: 'Dec 15, 2024',
    readTime: '5 min read',
    category: 'Technology',
  },
  {
    id: 2,
    title: 'Business Insights',
    description: 'Strategic insights and market analysis to help you make informed business decisions.',
    image: 'https://imgs.search.brave.com/iMpNkJpuRL-jUbhj2O_6-rbkmcymLiVEo6Tg7pXcuUM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by9i/dXNpbmVzcy1wZW9w/bGUtbWVldGluZy1k/aXNjdXNzaW9uLWNv/cnBvcmF0ZS1jb25j/ZXB0XzUzODc2LTEy/MTA1NC5qcGc_c2Vt/dD1haXNfaHlicmlk/Jnc9NzQw',
    date: 'Dec 12, 2024',
    readTime: '7 min read',
    category: 'Business',
  },
  {
    id: 3,
    title: 'Design Inspiration',
    description: 'Creative trends, design patterns, and visual inspiration from around the world.',
    image: 'https://imgs.search.brave.com/lS0yf8I9NVsQkNXX8HrGED-ngrNBYegDaCuRbCb-rBc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9mcmVz/Y29jcmVhdGl2ZS5j/b20uYXUvd3AtY29u/dGVudC91cGxvYWRz/LzIwMjMvMDUvSW5z/cGlyYXRpb25fR3Jh/cGhpYy1EZXNpZ24t/QmxvZzEtMTIwMHB4/Vy0xMDI0eDY4My5q/cGc',
    date: 'Dec 10, 2024',
    readTime: '4 min read',
    category: 'Design',
  },
];

export default function NewsletterPreview() {
  const router = useRouter();

  const handleReadMore = () => {
    router.push('/login');
  };

  const handleViewAll = () => {
    router.push('/login');
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
            Featured Newsletters
          </h2>
          <p className="font-inter text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our most popular newsletters covering technology, business, and design insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {newsletters.map((newsletter, index) => (
            <motion.div
              key={newsletter.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden shadow-md"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={newsletter.image}
                  alt={newsletter.title}
                  width={400}
                  height={192}
                  className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/20 dark:bg-gray-800/20 text-xs font-medium px-3 py-1 rounded-full text-black dark:text-white border border-black/10 dark:border-white/10">
                    {newsletter.category}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <h3 className="font-bold text-lg sm:text-xl text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {newsletter.title}
                </h3>
                <p className="font-inter text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                  {newsletter.description}
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-500 dark:text-gray-400 space-y-2 sm:space-y-0">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{newsletter.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{newsletter.readTime}</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={handleReadMore}
                  className="group/btn flex items-center space-x-2 text-black dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 font-medium transition-colors pt-2"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-10 sm:mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewAll}
            className="bg-white/20 dark:bg-gray-800/20 px-6 sm:px-8 py-3 rounded-lg font-medium text-black dark:text-white border border-black/10 dark:border-white/10 text-base sm:text-lg transition-all duration-300"
          >
            View All Newsletters
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
