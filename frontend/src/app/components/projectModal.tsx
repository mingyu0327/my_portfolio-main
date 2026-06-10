import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectModalProps {
  project: {
    id: number;
    title: string;
    description: string;
    image: string;
    tags: string[];
    longDescription: string;
    myRole?: string;
    github?: string;
    demo?: string;
  } | null;
  onClose: () => void;
  isLoggedIn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProjectModal({ project, onClose, isLoggedIn, onEdit, onDelete }: ProjectModalProps) {
  if (!project) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
          >
            <X className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          </button>
        </div>
        
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{project.title}</h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">프로젝트 설명</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {project.longDescription}
            </p>
          </div>

          {project.myRole && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">담당 파트</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {project.myRole}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors"
              >
                GitHub
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                라이브 데모
              </a>
            )}
            {isLoggedIn && onEdit && (
              <button
                onClick={onEdit}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-auto"
              >
                수정
              </button>
            )}
            {isLoggedIn && onDelete && (
              <button
                onClick={onDelete}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}