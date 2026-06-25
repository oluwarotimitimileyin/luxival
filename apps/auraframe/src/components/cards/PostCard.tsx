import { motion } from 'framer-motion';
import { Clock, GripVertical, ExternalLink } from 'lucide-react';
import PlatformBadge from './PlatformBadge';

interface PostCardProps {
  id: string;
  title: string;
  platform: string;
  scheduledFor: string;
  status: 'draft' | 'scheduled' | 'published';
  image: string;
  index: number;
}

const statusConfig = {
  draft: { color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Draft' },
  scheduled: { color: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'Scheduled' },
  published: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Published' },
};

export default function PostCard({ title, platform, scheduledFor, status, image, index }: PostCardProps) {
  const statusStyle = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.07)' }}
      className="group flex items-center gap-4 p-3 rounded-xl glass-surface cursor-pointer transition-all duration-200"
    >
      {/* Drag Handle */}
      <GripVertical className="w-4 h-4 text-[rgba(255,255,255,0.15)] group-hover:text-[rgba(255,255,255,0.4)] flex-shrink-0" />

      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5">
          <PlatformBadge platform={platform} />
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusStyle.bg} ${statusStyle.color}`}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1.5 text-[rgba(255,255,255,0.3)] flex-shrink-0">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs">{scheduledFor}</span>
      </div>

      {/* Open */}
      <ExternalLink className="w-4 h-4 text-[rgba(255,255,255,0.15)] group-hover:text-cyan-400 flex-shrink-0 transition-colors" />
    </motion.div>
  );
}
