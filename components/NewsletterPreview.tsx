'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

const newsletters = [
  {
    id: 1,
    title: "Tech Trends Weekly",
    description: "Latest developments in AI, machine learning, and emerging technologies that are shaping our future.",
    image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400",
    date: "Dec 15, 2024",
    readTime: "5 min read",
    category: "Technology"
  },
  {
    id: 2,
    title: "Business Insights",
    description: "Strategic insights and market analysis to help you make informed business decisions.",
    image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400",
    date: "Dec 12, 2024",
    readTime: "7 min read",
    category: "Business"
  },
  {
    id: 3,
    title: "Design Inspiration",
    description: "Creative trends, design patterns, and visual inspiration from around the world.",
    image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400",
    date: "Dec 10, 2024",
    readTime: "4 min read",
    category: "Design"
  }
];

export default function NewsletterPreview() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
            Featured Newsletters
          </h2>
          <p className="font-inter text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our most popular newsletters covering technology, business, and design insights
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <img
                  src={newsletter.image}
                  alt={newsletter.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/20 dark:bg-gray-800/20 text-xs font-medium px-3 py-1 rounded-full text-black dark:text-white border border-black/10 dark:border-white/10">
                    {newsletter.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <h3 className="font-bold text-xl text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {newsletter.title}
                </h3>
                
                <p className="font-inter text-gray-600 dark:text-gray-300 leading-relaxed">
                  {newsletter.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
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
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/20 dark:bg-gray-800/20 px-8 py-3 rounded-lg font-medium text-black dark:text-white border border-black/10 dark:border-white/10 transition-all duration-300"
          >
            View All Newsletters
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}