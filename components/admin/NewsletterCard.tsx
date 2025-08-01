import { motion } from 'framer-motion';
import { Calendar, MessageSquare } from 'lucide-react';

interface NewsletterCardProps {
  title: string;
  status: 'published' | 'draft';
  date: Date;
  replies: number;
  imageUrl?: string;
  onClick: () => void;
}

export default function NewsletterCard({ title, status, date, replies, imageUrl, onClick }: NewsletterCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-300 dark:border-gray-600 p-4 flex items-center space-x-4 cursor-pointer"
    >
      {imageUrl && <img src={imageUrl} alt={title} className="w-16 h-16 rounded-lg object-cover" />}
      <div className="flex-1">
        <h3 className="text-lg font-medium text-black dark:text-white">{title}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {status}
          </span>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {date.toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" />
            {replies} replies
          </div>
        </div>
      </div>
    </motion.div>
  );
}