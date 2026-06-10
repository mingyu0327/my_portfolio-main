import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    image: string;
    tags: string[];
  };
  onClick: () => void;
  index: number;
}

export function ProjectCard({ project, onClick, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="bg-white/70 backdrop-blur-md rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-2xl transition-all border border-gray-200 hover:bg-white/85"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900">{project.title}</h3>
        <p className="text-gray-700 mb-4 line-clamp-2">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-100 backdrop-blur-sm text-blue-700 rounded-full text-sm border border-blue-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}