import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface TimelineItemProps {
  icon: LucideIcon;
  title: string;
  organization: string;
  date: string;
  description: string;
  index: number;
  onClick: () => void;
}

export function TimelineItem({ icon: Icon, title, organization, date, description, index, onClick }: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-8 pb-12 border-l-2 border-blue-300 last:pb-0"
    >
      <div className="absolute -left-4 top-0 p-2 bg-blue-500 rounded-full border-2 border-blue-300 shadow-lg">
        <Icon className="w-4 h-4 text-white" />
      </div>
      
      <div 
        onClick={onClick}
        className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all border border-blue-100 hover:bg-white/90 cursor-pointer"
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-600 mt-1 md:mt-0">{date}</span>
        </div>
        <p className="text-blue-600 font-semibold mb-3">{organization}</p>
        <p className="text-gray-700">{description}</p>
      </div>
    </motion.div>
  );
}