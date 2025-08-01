'use client';

import { motion } from 'framer-motion';
import { UserPlus, Mail, Bell } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your free account in seconds with just your email address."
  },
  {
    icon: Mail,
    title: "Subscribe",
    description: "Choose from our curated selection of newsletters that match your interests."
  },
  {
    icon: Bell,
    title: "Get Updates",
    description: "Receive high-quality content directly in your inbox on your preferred schedule."
  }
];

export default function HowItWorks() {
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
            How It Works
          </h2>
          <p className="font-inter text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Getting started with NewsEcho is simple and straightforward
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative text-center group"
              >
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 bg-black dark:bg-gray-400 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 shadow-md">
                    <div className="w-8 h-8 bg-black dark:bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-sm mb-4 mx-auto">
                      {index + 1}
                    </div>
                    
                    <h3 className="font-bold text-xl text-black dark:text-white mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {step.title}
                    </h3>
                    
                    <p className="font-inter text-gray-600 dark:text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-black dark:bg-gray-400 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg"
          >
            Start Your Journey
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}