'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, Users } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black dark:bg-gray-400 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-white dark:bg-gray-800 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-white dark:bg-gray-800 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white dark:bg-gray-800 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <Mail className="w-16 h-16 text-white mb-6 mx-auto" />
          </motion.div>

          <h2 className="font-playfair text-3xl md:text-5xl font-bold text-white mb-6">
            Join 10,000+ Readers Today
          </h2>
          
          <p className="font-inter text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
            Don&rsquo;t miss out on the insights that matter. Subscribe now and get your first 
            curated newsletter within 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-white text-black dark:text-gray-300 px-8 py-4 rounded-lg font-bold transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-200 flex items-center space-x-2 shadow-lg"
            >
              <span>Subscribe Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex items-center justify-center space-x-8 pt-8"
          >
            <div className="flex items-center space-x-2 text-white/80">
              <Users className="w-5 h-5" />
              <span className="font-inter font-medium">10,000+ subscribers</span>
            </div>
            <div className="text-white/60">•</div>
            <div className="font-inter text-white/80 font-medium">
              No spam, unsubscribe anytime
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            viewport={{ once: true }}
            className="pt-4"
          >
            <p className="font-inter text-white/70 text-sm">
              ✨ Free forever • 📧 Weekly insights • 🚀 Cancel anytime
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}