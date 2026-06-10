import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SkillModalProps {
  skill: {
    icon: LucideIcon;
    name: string;
    level: number;
    details: string[];
    experience: string;
  } | null;
  onClose: () => void;
  isLoggedIn?: boolean;
  onEdit?: () => void;
}

export function SkillModal({ skill, onClose, isLoggedIn, onEdit }: SkillModalProps) {
  if (!skill) return null;

  const Icon = skill.icon;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 backdrop-blur-sm rounded-xl border border-blue-200 dark:border-blue-700">
                <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{skill.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{skill.experience}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-800 dark:text-gray-200" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">숙련도</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{skill.level}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                style={{ width: `${skill.level}%` }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">가능한 작��</h3>
            <ul className="space-y-3">
              {skill.details.map((detail, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {isLoggedIn && onEdit && (
            <button
              onClick={onEdit}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              수정
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}