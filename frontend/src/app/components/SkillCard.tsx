import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SkillCardProps {
  icon: LucideIcon;
  name: string;
  level: number;
  index: number;
  onClick: () => void;
}

export function SkillCard({ icon: Icon, name, level, index, onClick }: SkillCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-gray-200 hover:bg-white/85"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-blue-100 backdrop-blur-sm rounded-lg border border-blue-200">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">{level}%</p>
    </motion.div>
  );
}