'use client';

import { motion } from 'framer-motion';
import { Shield, Star, MessageCircle, Clock, Users, Zap } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: "No Spam Guarantee",
    description: "We respect your inbox. Only quality content, no promotional clutter or spam."
  },
  {
    icon: Star,
    title: "Premium Content",
    description: "Handpicked articles and insights from industry experts and thought leaders."
  },
  {
    icon: MessageCircle,
    title: "Easy Interaction",
    description: "Reply directly to newsletters and engage with authors and fellow readers."
  },
  {
    icon: Clock,
    title: "Time-Efficient",
    description: "Digest important information quickly with our concise, well-structured format."
  },
  {
    icon: Users,
    title: "Trusted Community",
    description: "Join over 10,000 professionals who rely on NewsEcho for their daily insights."
  },
  {
    icon: Zap,
    title: "Instant Updates",
    description: "Stay ahead of trends with real-time notifications and breaking news alerts."
  }
];

export default function WhySubscribe() {
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
            Why Choose NewsEcho?
          </h2>
          <p className="font-inter text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the difference with our carefully curated newsletter platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const isReversed = index % 2 === 1;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-gray-200 dark:border-gray-700 shadow-md">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-all duration-300"
                  >
                    <Icon className="w-8 h-8 text-black dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors" />
                  </motion.div>
                  
                  <h3 className="font-bold text-xl text-black dark:text-white mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    {benefit.title}
                  </h3>
                  
                  <p className="font-inter text-gray-600 dark:text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                  
                  {/* Decorative gradient */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100/50 dark:from-gray-700/50 to-transparent rounded-bl-3xl"></div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16 bg-gray-100 dark:bg-gray-800 rounded-2xl p-8"
        >
          <h3 className="font-playfair text-2xl font-bold text-black dark:text-white mb-4">
            Ready to Transform Your Reading Experience?
          </h3>
          <p className="font-inter text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
            Join thousands of satisfied readers who have made NewsEcho their go-to source for quality content.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-black dark:bg-gray-400 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg"
          >
            Get Started Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}